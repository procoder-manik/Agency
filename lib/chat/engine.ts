import { getPublished } from "../content";
import { getAllSettings, siteUrl } from "../settings";
import { formatPrice, stripMd, truncate } from "../util";
import { aiAvailable, generate, parseJson } from "../ai/providers";
import { scrubNumbers } from "../ai/tasks";
import { and, isNull, eq } from "drizzle-orm";
import { db, schema } from "../db";
import { chunkText } from "./sources";

export interface Chunk { id: string; type: string; title: string; text: string; url: string; say: string }
export interface ChatMsg { role: "user" | "assistant"; content: string }
export interface ChatReply { answer: string; links: { label: string; href: string }[]; suggestions: string[]; lead: boolean; mode: "ai" | "kb" }

/* ---------------- text processing ---------------- */
const STOP = new Set("a an the is are was were be been am do does did can could would should will shall may might to of in on at for from by with about as into and or but if then so than that this these those it its you your yours we our us i me my he she they them what which who whom how when where why please tell show give want need get have has had there here any some just also very more most other such only own same too s t ok okay yes no hi hello hey".split(" "));
const GROUPS: Record<string, string[]> = {
  price: ["cost", "pricing", "prices", "fee", "fees", "rate", "rates", "charge", "charges", "budget", "quote", "quotation", "expensive", "cheap", "afford", "affordable", "payment", "pay", "paid", "invoice", "package", "plan", "taka", "bdt", "usd", "dollar", "দাম", "খরচ", "মূল্য", "টাকা", "প্যাকেজ", "কত"],
  contact: ["reach", "call", "phone", "email", "mail", "whatsapp", "number", "address", "location", "office", "visit", "message", "ফোন", "যোগাযোগ", "ইমেইল", "ঠিকানা"],
  work: ["portfolio", "project", "projects", "example", "examples", "client", "clients", "case", "study", "showcase", "sample", "samples", "কাজ", "পোর্টফোলিও"],
  website: ["web", "site", "webpage", "landing", "redesign", "wordpress", "shopify", "ecommerce", "store", "ওয়েবসাইট", "সাইট"],
  seo: ["search", "ranking", "rank", "google", "keyword", "keywords", "traffic", "organic", "এসইও"],
  automate: ["automation", "automating", "crm", "workflow", "integrate", "integration", "zapier", "অটোমেশন"],
  time: ["timeline", "duration", "long", "weeks", "week", "delivery", "deliver", "deadline", "turnaround", "days", "কতদিন", "সময়"],
  process: ["step", "steps", "approach", "method", "discovery", "stages"],
  team: ["people", "staff", "founder", "designer", "developer", "who"],
  hours: ["open", "opening", "hours", "availability", "available", "timing"],
  care: ["maintenance", "support", "update", "updates", "backup", "backups", "hosting", "security"],
};
const CANON = new Map<string, string>();
for (const [k, list] of Object.entries(GROUPS)) { CANON.set(k, k); for (const w of list) CANON.set(w, k); }

function stem(w: string) {
  if (!/^[a-z0-9]+$/.test(w) || w.length < 5) return w;
  return w.replace(/ies$/, "y").replace(/(ing|ed|es|s)$/, "");
}
export function tokenize(s: string) {
  return (s.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean))
    .filter((w) => !STOP.has(w)).map((w) => { const c = CANON.get(w) || CANON.get(stem(w)); return c || stem(w); });
}

/* ---------------- knowledge base ---------------- */
let cache: { at: number; chunks: Chunk[]; key: string } | null = null;
/** Called after training sources change so the assistant sees them immediately. */
export function resetKbCache() { cache = null; }

export async function buildKb(): Promise<Chunk[]> {
  if (cache && Date.now() - cache.at < 30_000) return cache.chunks;
  const s = await getAllSettings();
  const [faqs, services, packages, projects, cases, posts] = await Promise.all(["faqs", "services", "packages", "projects", "caseStudies", "posts"].map((c) => getPublished(c)));
  const base = siteUrl(s.identity);
  const out: Chunk[] = [];
  const add = (c: Chunk) => out.push({ ...c, text: truncate(c.text, 900) });
  const pricingOn = s.features.pricing;
  const arr = (v: any) => (Array.isArray(v) ? v : []);

  for (const f of faqs) add({ id: `faq-${f.id}`, type: "faq", title: f.title, text: `${f.title} ${stripMd(f.data.answer || "")}`, url: "/faq", say: truncate(stripMd(f.data.answer || ""), 520) });
  for (const sv of services) {
    const inc = arr(sv.data.includes).map((x: any) => x.title).filter(Boolean);
    const url = `/services/${sv.slug}`;
    add({ id: `svc-${sv.id}`, type: "service", title: sv.title, url, text: `${sv.title} ${sv.data.summary || ""} ${stripMd(sv.data.description || "")} ${inc.join(" ")}`,
      say: `**${sv.title}**\n${sv.data.summary || truncate(stripMd(sv.data.description || ""), 240)}${inc.length ? `\n${inc.slice(0, 5).map((x: string) => `- ${x}`).join("\n")}` : ""}` });
    const steps = arr(sv.data.steps).filter((x: any) => x.title);
    if (steps.length) add({ id: `svc-steps-${sv.id}`, type: "service", title: `${sv.title} process`, url, text: `${sv.title} process steps how it works ${steps.map((x: any) => `${x.title} ${x.text || ""}`).join(" ")}`,
      say: `Here is how **${sv.title}** works:\n${steps.map((x: any, i: number) => `${i + 1}. ${x.title}${x.text ? `: ${x.text}` : ""}`).join("\n")}` });
    for (const f of arr(sv.data.faq).filter((x: any) => x.q && x.a)) add({ id: `svc-faq-${sv.id}-${f.q}`, type: "faq", title: f.q, url, text: `${f.q} ${f.a} ${sv.title}`, say: truncate(stripMd(f.a), 520) });
  }
  if (pricingOn) {
    for (const p of packages) {
      const sv = services.find((x) => x.id === Number(p.data.service));
      const price = formatPrice(p.data.price, p.data.currency || "USD"); const max = p.data.priceMax ? formatPrice(p.data.priceMax, p.data.currency || "USD") : "";
      const per = p.data.billing === "monthly" ? "per month" : p.data.billing === "yearly" ? "per year" : "one-time";
      const feats = arr(p.data.features);
      add({ id: `pkg-${p.id}`, type: "package", title: `${p.title}${sv ? ` (${sv.title})` : ""}`, url: sv ? `/services/${sv.slug}` : "/pricing",
        text: `${p.title} ${sv?.title || ""} package price cost ${price} ${max} ${per} ${p.data.delivery || ""} ${p.data.summary || ""} ${feats.join(" ")}`,
        say: `**${p.title}**${sv ? ` for ${sv.title}` : ""}: ${price ? `${price}${max ? ` to ${max}` : ""} (${per}${p.data.delivery ? `, ${p.data.delivery}` : ""})` : "custom pricing"}${feats.length ? `\n${feats.slice(0, 5).map((x: string) => `- ${x}`).join("\n")}` : ""}` });
    }
    add({ id: "payments", type: "pricing", title: "Payment methods and currencies", url: "/pricing", text: `payment pay methods currencies accept ${s.payments.methods?.join(" ")} ${s.payments.currencies?.join(" ")} ${s.payments.note}`,
      say: `${s.payments.note}${s.payments.methods?.length ? `\nPayment methods: ${s.payments.methods.join(", ")}.` : ""}` });
  }
  for (const p of projects) add({ id: `prj-${p.id}`, type: "project", title: p.title, url: `/work/${p.slug}`, text: `${p.title} ${p.data.client || ""} ${p.data.industry || ""} ${p.data.summary || ""} ${arr(p.data.technologies).join(" ")} portfolio work project`,
    say: `**${p.title}**${p.data.client ? ` for ${p.data.client}` : ""}${p.data.industry ? ` (${p.data.industry})` : ""}. ${p.data.summary || ""}` });
  if (s.features.caseStudies) for (const c of cases) add({ id: `case-${c.id}`, type: "case", title: c.title, url: `/case-studies/${c.slug}`, text: `${c.title} ${c.data.client || ""} ${c.data.summary || ""} ${stripMd(c.data.overview || "")} case study`, say: `**${c.title}**. ${c.data.summary || ""}` });
  if (s.features.blog) for (const p of posts) add({ id: `post-${p.id}`, type: "post", title: p.title, url: `/blog/${p.slug}`, text: `${p.title} ${p.data.excerpt || ""} blog article`, say: `Our article **${p.title}** may help. ${p.data.excerpt || ""}` });
  add({ id: "about", type: "about", title: `About ${s.identity.name}`, url: "/about", text: `about who we are team agency company ${s.identity.name} ${s.identity.description} ${s.identity.longDescription}`, say: `${s.identity.longDescription || s.identity.description}` });
  const id = s.identity;
  add({ id: "contact", type: "contact", title: "Contact details", url: "/contact", text: `contact reach email phone call whatsapp address hours ${id.email} ${id.phone} ${id.address} ${id.hours}`,
    say: [`You can reach us here:`, id.email && `- Email: ${id.email}`, id.phone && `- Phone: ${id.phone}`, id.whatsapp && `- WhatsApp: ${id.whatsapp}`, id.address && `- Address: ${id.address}`, id.hours && `- Hours: ${id.hours}`, id.replyTime && `We reply ${id.replyTime}.`].filter(Boolean).join("\n") });
  // Extra pages and notes added in Admin > Chat training
  try {
    const srcs = await db().select().from(schema.chatSources).where(and(isNull(schema.chatSources.deletedAt), eq(schema.chatSources.status, "ok")));
    for (const sr of srcs) chunkText(sr.content).forEach((t, i) => out.push({ id: `src-${sr.id}-${i}`, type: "source", title: sr.title || sr.url, url: sr.kind === "url" ? sr.url : "/contact", text: `${sr.title} ${t}`, say: truncate(t, 520) }));
  } catch (e) { console.error("[chat] could not load training sources:", (e as Error).message); }
  cache = { at: Date.now(), chunks: out, key: base };
  return out;
}

/* ---------------- BM25 retrieval ---------------- */
function search(chunks: Chunk[], query: string, k = 5) {
  const q = Array.from(new Set(tokenize(query))); if (!q.length) return [];
  const docs = chunks.map((c) => ({ c, t: [...tokenize(c.title), ...tokenize(c.title), ...tokenize(c.title), ...tokenize(c.text)] }));
  const N = docs.length || 1; const avg = docs.reduce((a, d) => a + d.t.length, 0) / N || 1;
  const df = new Map<string, number>(); for (const d of docs) for (const w of new Set(d.t)) df.set(w, (df.get(w) || 0) + 1);
  const scored = docs.map(({ c, t }) => {
    const tf = new Map<string, number>(); for (const w of t) tf.set(w, (tf.get(w) || 0) + 1);
    let score = 0; for (const w of q) { const f = tf.get(w) || 0; if (!f) continue; const idf = Math.log(1 + (N - (df.get(w) || 0) + 0.5) / ((df.get(w) || 0) + 0.5)); score += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (t.length / avg)))); }
    return { c, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

/* ---------------- intents ---------------- */
const RX = {
  greet: /^\s*(hi+|hello+|hey+|hola|salam|assalamu?\s?alaikum|good\s(morning|afternoon|evening)|yo|sup|হাই|হ্যালো|সালাম|আসসালামু আলাইকুম)\b[\s!.,?]*$/i,
  thanks: /\b(thanks|thank you|thx|ty|appreciate it|cheers|ধন্যবাদ)\b/i,
  bye: /^\s*(bye|goodbye|see you|see ya|later|take care|that'?s all)\b/i,
  human: /(talk|speak|chat|connect|get)\b.*\b(human|person|someone|somebody|team|agent|sales|representative|expert)|\b(human|real person|call me|callback|call back|book (a )?(call|meeting|consult)|schedule (a )?(call|meeting)|get (a )?quote|request (a )?quote|free consult|hire you|start (a )?project|work with you|get started|কথা বলতে চাই)/i,
  pricing: /\b(price|prices|pricing|cost|costs|how much|quote|budget|package|packages|plans?|fees?|rates?|charge|afford|cheap|expensive)\b|দাম|খরচ|কত টাকা|মূল্য/i,
  services: /\b(what (do|can) you (do|offer|build|make|provide)|services?|offerings?|capabilit\w+|do you (do|provide|build|make|offer)|help (me )?with|what you do)\b|সার্ভিস|কি কি/i,
  portfolio: /\b(portfolio|your work|past work|previous work|recent work|projects?|case stud(y|ies)|examples?|showcase|(your|past|previous|recent|some) clients|references?)\b|কাজ|পোর্টফোলিও/i,
  contact: /\b(contact|email|e-mail|phone|call|whatsapp|address|office|location|where are you|reach you|reach out|number)\b|যোগাযোগ|ঠিকানা|ফোন/i,
  hours: /\b(hours|opening|open (on|at|late)|working (time|hours)|business hours|availab\w+|timing|when are you)\b/i,
  about: /\b(about (you|us|the (agency|company|team))|who are you|who is|your (story|team|background)|tell me about (you|yourself|your))\b/i,
  timeline: /\b(how long|timeline|turnaround|delivery time|how fast|how soon|duration|deadline)\b|কতদিন/i,
};

const clean = (s: string) => s.replace(/\u2014|\u2013/g, ",");

export async function chatReply(messages: ChatMsg[]): Promise<ChatReply> {
  const s = await getAllSettings();
  const chunks = await buildKb();
  const last = messages[messages.length - 1].content.trim();
  const prevUser = [...messages].slice(0, -1).reverse().find((m) => m.role === "user")?.content || "";
  const name = s.identity.name;
  const pricingOn = s.features.pricing;
  const custom = ((s.integrations as any).chatSuggestions || []) as string[];
  const defaults = [pricingOn ? "How much does it cost?" : "How do I get a quote?", "What services do you offer?", "Show me your work", "Talk to a human"];
  const base = custom.length ? custom : defaults;
  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content.toLowerCase()));
  const sugg = (list: string[]) => list.filter((x) => !asked.has(x.toLowerCase())).slice(0, 3);
  const contactLink = { label: s.identity.ctaLabel || "Contact us", href: s.identity.ctaHref || "/contact" };
  const ai = await aiAvailable();
  const L = (label: string, href: string) => ({ label, href });
  const shortMsg = last.length <= 40;

  const make = (answer: string, o: Partial<ChatReply> = {}): ChatReply => ({ answer: clean(answer), links: o.links || [], suggestions: o.suggestions || sugg(base), lead: !!o.lead, mode: o.mode || "kb" });

  // Small talk and routing answered instantly, without AI.
  if (shortMsg && RX.greet.test(last)) return make(`Hi! I'm the ${name} assistant. I can answer questions about our services${pricingOn ? ", pricing" : ""} and work, or connect you with the team. What would you like to know?`);
  if (RX.thanks.test(last) && shortMsg) return make("You're welcome! Is there anything else I can help with?", { suggestions: sugg(["Talk to a human", ...base]) });
  if (RX.bye.test(last)) return make(`Thanks for stopping by. We're here whenever you need us.`, { suggestions: [] });
  if (RX.human.test(last)) return make(`Happy to connect you with the team. Leave your details below and we will reply ${s.identity.replyTime}.`, { lead: true, links: [contactLink], suggestions: [] });

  // Topic answers from your own content.
  const topic = (() => {
    if (RX.contact.test(last)) return "contact";
    if (RX.hours.test(last)) return "hours";
    if (RX.pricing.test(last)) return "pricing";
    if (RX.timeline.test(last)) return "timeline";
    if (RX.portfolio.test(last)) return "portfolio";
    if (RX.about.test(last)) return "about";
    if (RX.services.test(last)) return "services";
    return "";
  })();

  const services = chunks.filter((c) => c.id.startsWith("svc-") && !c.id.startsWith("svc-steps") && !c.id.startsWith("svc-faq"));
  // "website" alone must not match a service such as "Website care", so generic words are dropped before matching.
  const findService = (q: string) => { const hit = search(services, q.replace(/\b(websites?|sites?)\b/gi, " "), 1)[0]; return hit && hit.score > 1.2 ? hit.c : null; };
  const kb = (() => {
    if (topic === "contact") return make(chunks.find((c) => c.id === "contact")!.say, { links: [contactLink], suggestions: sugg(["Talk to a human", ...base]) });
    if (topic === "hours") return make(`${s.identity.hours ? `Our hours: ${s.identity.hours}.` : "We work remotely and reply during business hours."} We reply ${s.identity.replyTime}.`, { links: [contactLink], suggestions: sugg(["Talk to a human", ...base]) });
    if (topic === "services") {
      if (!services.length) return null;
      return make(`Here is what we do:\n${services.map((c) => `- **${c.title}**: ${c.say.split("\n")[1] || ""}`).join("\n")}`, { links: services.slice(0, 3).map((c) => L(c.title, c.url)), suggestions: sugg(services.slice(0, 2).map((c) => `Tell me about ${c.title}`).concat(pricingOn ? ["How much does it cost?"] : [], ["Talk to a human"])) });
    }
    if (topic === "pricing") {
      if (!pricingOn) return make("We quote every project individually, so you only pay for what you need. Tell us about your project and we will send a quote.", { lead: true, links: [contactLink], suggestions: [] });
      const target = findService(`${last} ${shortMsg ? prevUser : ""}`);
      let pk = chunks.filter((c) => c.type === "package");
      if (target) { const f = pk.filter((c) => c.url === target.url); if (f.length) pk = f; }
      if (!pk.length) return make("Pricing depends on the scope of your project. Tell us what you need and we will send a quote.", { lead: true, links: [contactLink] });
      return make(`${target ? `Pricing for ${target.title}:` : "Our packages:"}\n${pk.slice(0, 6).map((c) => `- ${c.say.split("\n")[0]}`).join("\n")}\n\nCustom projects are quoted after a short call.`, { links: [L("See all pricing", "/pricing"), contactLink], suggestions: sugg(["Talk to a human", "What services do you offer?", "Show me your work"]) });
    }
    if (topic === "timeline") {
      const target = findService(`${last} ${prevUser}`);
      const steps = chunks.find((c) => c.id.startsWith("svc-steps") && (!target || c.url === target.url));
      const dl = chunks.filter((c) => c.type === "package" && / (weeks?|days?)\b/i.test(c.text) && (!target || c.url === target.url)).slice(0, 4);
      const lines = dl.map((c) => { const m = c.say.match(/\(([^)]*)\)/); return `- ${c.say.split(":")[0].replace(/\*\*/g, "")}: ${m ? m[1] : ""}`; });
      if (!lines.length && !steps) return make("Timelines depend on the scope of the project. Tell us what you need and we will give you a realistic estimate.", { lead: true, links: [contactLink] });
      return make(`${lines.length ? `Typical delivery times:\n${lines.join("\n")}` : ""}${steps ? `${lines.length ? "\n\n" : ""}${steps.say}` : ""}`, { links: [contactLink], suggestions: sugg(["Talk to a human", ...base]) });
    }
    if (topic === "portfolio") {
      const pr = chunks.filter((c) => c.type === "project").slice(0, 4);
      if (!pr.length) return null;
      return make(`Here are some of our projects:\n${pr.map((c) => `- ${c.say.split("\n")[0].replace(/\*\*/g, "").slice(0, 140)}`).join("\n")}`, { links: [L("See all work", "/work"), ...(s.features.caseStudies ? [L("Case studies", "/case-studies")] : [])], suggestions: sugg(["Talk to a human", ...base]) });
    }
    if (topic === "about") return make(chunks.find((c) => c.id === "about")!.say, { links: [L("About us", "/about")], suggestions: sugg(["What services do you offer?", "Talk to a human"]) });
    return null;
  })();
  if (kb) return kb;

  // A question that names one of our services gets that service's own answer first.
  const named = findService(`${last}${tokenize(last).length < 2 ? " " + prevUser : ""}`);
  if (named && search(services, last, 1)[0]?.score >= 2) {
    return make(named.say, { links: [L(named.title, named.url), ...(pricingOn ? [L("Pricing", "/pricing")] : [])], suggestions: sugg([pricingOn ? `How much is ${named.title}?` : "How do I get a quote?", "How long does it take?", "Talk to a human"]) });
  }

  // Retrieval for everything else. Short follow-ups borrow the previous question for context.
  const query = tokenize(last).length < 2 && prevUser ? `${prevUser} ${last}` : last;
  const hits = search(chunks, query, 6);
  const best = hits[0]?.score || 0;

  if (ai) {
    try {
      const ctx = (hits.length ? hits : search(chunks, "services contact about", 4)).slice(0, 6).map((h, i) => `[${i + 1}] (${h.c.url}) ${h.c.title}: ${truncate(h.c.text, 520)}`);
      const allowed = Array.from(new Set([...hits.map((h) => h.c.url), "/contact", "/services", "/work", ...(pricingOn ? ["/pricing"] : [])]));
      const history = messages.slice(-7, -1).map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${truncate(m.content, 300)}`).join("\n");
      const out = await generate({
        system: `You are the website assistant for ${name}, a digital agency. Answer the visitor using ONLY the facts in KNOWLEDGE.\nRules: be concise (at most 4 short sentences or a short list), warm and plain; reply in the visitor's language (English or Bengali); never invent prices, numbers, client names, results, dates or promises; if KNOWLEDGE does not contain the answer, say you are not sure and offer to connect them with the team and set needHuman true; do not use em dashes; you may use **bold** and "- " bullet lines.\nReturn ONLY JSON: {"answer":"","suggestions":["up to 3 short follow-up questions the visitor might ask"],"needHuman":false,"links":["paths chosen only from: ${allowed.join(", ")}"]}`,
        prompt: `KNOWLEDGE:\n${ctx.join("\n")}\n\nAgency contact reply time: ${s.identity.replyTime}\n\nCONVERSATION:\n${history}\nVisitor: ${last}`,
        json: true, maxTokens: 700,
      });
      const j = parseJson<{ answer?: string; suggestions?: string[]; needHuman?: boolean; links?: string[] }>(out.text);
      if (j.answer && j.answer.trim()) {
        const nums = new Set<string>(); for (const m of (ctx.join(" ") + " " + messages.map((m) => m.content).join(" ")).match(/\d[\d,.]*/g) || []) nums.add(m.replace(/,/g, "").replace(/\.$/, ""));
        const answer = clean(scrubNumbers(j.answer.trim(), nums) || j.answer.trim());
        const links = (j.links || []).filter((l) => allowed.includes(l)).slice(0, 3).map((href) => { const hit = hits.find((h) => h.c.url === href); return L(hit ? hit.c.title : href === "/pricing" ? "Pricing" : href === "/contact" ? "Contact us" : href.replace("/", "").replace(/^./, (c) => c.toUpperCase()), href); });
        return { answer, links, suggestions: (j.suggestions || []).filter((x) => typeof x === "string").slice(0, 3).map(clean), lead: !!j.needHuman, mode: "ai" };
      }
    } catch (e) { console.error("[chat] AI failed, using knowledge base:", (e as Error).message); }
  }

  if (best >= 2.0) {
    const top = hits.filter((h, i) => i === 0 || (h.score >= best * 0.7 && h.c.url !== hits[0].c.url)).slice(0, 2);
    const links = Array.from(new Map(top.map((h) => [h.c.url, L(h.c.type === "faq" ? "More answers" : h.c.title, h.c.url)])).values());
    return make(top.map((h) => h.c.say).join("\n\n"), { links, suggestions: sugg(["Talk to a human", ...base]) });
  }
  return make(`I'm not sure about that one yet. I can pass your question to the team and they will reply ${s.identity.replyTime}.`, { lead: true, links: [contactLink], suggestions: sugg(base) });
}
