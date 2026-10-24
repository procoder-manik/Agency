import { generate, parseJson } from "./providers";
import { siteContext, RULES } from "./context";
import { BLOCKS, getBlockDef, newBlock } from "../blocks";
import { getCollection } from "../collections";
import { SCHEMA_TYPES } from "../fields";
import { slugify, stripMd } from "../util";
import { safeFetchText } from "../ssrf";

const numbersIn = (s: string) => new Set((s.match(/\d[\d,.]*/g) || []).map((n) => n.replace(/[,]/g, "").replace(/\.$/, "")));
/** Drop sentences containing numbers that were not supplied by a human or the site context. */
export function scrubNumbers(text: string, allowed: Set<string>) {
  if (!text || typeof text !== "string") return text;
  return text.split(/(?<=[.!?])\s+/).filter((sent) => {
    for (const n of numbersIn(sent)) if (n.length > 1 && !allowed.has(n)) return false;
    return true;
  }).join(" ");
}
function scrubDeep(v: any, allowed: Set<string>, skip = new Set(["href", "primaryHref", "secondaryHref", "linkHref", "slug", "value"])): any {
  if (typeof v === "string") return scrubNumbers(v, allowed);
  if (Array.isArray(v)) return v.map((x) => scrubDeep(x, allowed, skip));
  if (v && typeof v === "object") { const o: any = {}; for (const k in v) o[k] = skip.has(k) ? v[k] : scrubDeep(v[k], allowed, skip); return o; }
  return v;
}

const SYS = (ctx: any) => `You are the in-house copywriter and SEO lead for this agency. Context (JSON):\n${JSON.stringify(ctx)}\n\n${RULES}`;

async function run(ctx: any, prompt: string, json = true, maxTokens = 4000) {
  const out = await generate({ system: SYS(ctx), prompt, json, maxTokens });
  return { ...out, data: json ? parseJson(out.text) : out.text.trim() };
}

function textFieldsOf(type: string) {
  const d = getBlockDef(type); if (!d) return [];
  return d.fields.filter((f) => ["text", "textarea", "markdown", "list", "tags"].includes(f.type)).map((f) => f.type === "list" ? `${f.name}: [${f.fields!.filter((x) => ["text", "textarea", "number"].includes(x.type)).map((x) => x.name).join(", ")}]` : `${f.name} (${f.type})`);
}
const BLOCK_GUIDE = () => BLOCKS.map((b) => `- ${b.type}: ${b.description}. Fields: ${textFieldsOf(b.type).join("; ")}`).join("\n");

function cleanBlock(b: any) {
  const def = getBlockDef(b?.type); if (!def) return null;
  const data: any = {};
  for (const f of def.fields) if (b.data && f.name in b.data) data[f.name] = b.data[f.name];
  return newBlock(def.type, data);
}

/** What a field is for, so the AI writes the right kind of text for it (alt text, meta title, button label...). */
function fieldGuide(name: string, label: string, type: string, section?: string) {
  const k = `${name} ${label}`.toLowerCase();
  const g: string[] = [];
  if (/\balt\b|alt text/.test(k)) g.push("This is the alt text of an image. Describe what the image shows or represents in plain words, under 125 characters, with no 'image of' or 'picture of'. If it is a logo, write '<Brand> logo' (add the brand's descriptor only if it is known).");
  else if (/meta ?title|seo title|og ?title|open graph title/.test(k)) g.push("Search/social title: 50 to 60 characters, the main keyword near the start, no brand suffix, no clickbait.");
  else if (/meta ?description|og ?description|open graph description/.test(k)) g.push("Search/social description: 140 to 160 characters, says what the page offers and ends with a light reason to click. No quotes.");
  else if (/focus keyword/.test(k)) g.push("One search phrase (2 to 4 words) people would really type.");
  else if (/breadcrumb/.test(k)) g.push("A short label of 1 to 3 words.");
  else if (/tagline|headline|footer headline/.test(k)) g.push("One short, concrete line (under 10 words). No buzzwords.");
  else if (/button|cta|label|link text/.test(k)) g.push("A button or link label of 2 to 4 words, starting with a verb where it makes sense.");
  else if (/placeholder/.test(k)) g.push("A short hint shown inside an empty input (under 6 words).");
  else if (/heading|title|name/.test(k)) g.push("A short, clear heading (under 9 words).");
  else if (/subject/.test(k)) g.push("An email subject line under 60 characters, specific, no ALL CAPS.");
  else if (/greeting|message|intro|body|signature|note/.test(k)) g.push("Friendly, plain and brief.");
  if (section) g.push(`It sits in the "${section}" part of the site.`);
  return g.join(" ");
}

const SEO_SHAPE = `{"focusKeyword":"","keywords":["",""],"metaTitle":"(max 60 chars, without the brand suffix)","metaDescription":"(140-160 chars)","ogTitle":"","ogDescription":"","breadcrumbTitle":"(short)","schemaType":"one of ${SCHEMA_TYPES.filter((t) => t !== "auto").join(", ")}"}`;

export async function runTask(task: string, p: any) {
  const ctx = await siteContext();
  const human = JSON.stringify(p || {});
  const allowed = new Set([...numbersIn(human), ...numbersIn(JSON.stringify(ctx.services))]);

  switch (task) {
    case "field": {
      const verb = p.mode === "improve" ? "Improve this text, keeping its meaning and facts" : p.mode === "shorten" ? "Shorten this text by about half, keeping the key facts" : "Write this field";
      const guide = fieldGuide(String(p.name || ""), String(p.label || ""), String(p.type || ""), p.section);
      const r = await run(ctx, `${verb}.\nField: "${p.label}" (key: ${p.name || "n/a"}; ${p.type}${p.type === "markdown" ? ", markdown allowed" : ", plain text"}).${p.help ? ` Field help: ${p.help}.` : ""}${guide ? `\nWhat this field is for: ${guide}` : ""}\nItem being edited: ${JSON.stringify(p.item || {}).slice(0, 4000)}\nCurrent text: ${p.current || "(empty)"}\nExtra instruction: ${p.instruction || "none"}\nReturn JSON {"text": "..."}.`);
      return { ...r, data: { text: scrubNumbers(String(r.data.text || ""), allowed) } };
    }
    case "alt": {
      // The model cannot see the picture: it writes from the file name, the field the image fills and the page it belongs to.
      const file = String(p.filename || "").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[-_]+/g, " ").replace(/\b[0-9a-f]{8,}\b/gi, "").trim();
      const r = await run(ctx, `Write alt text for an image on this website.\nWhere it is used: field "${p.label || "Image"}" on ${p.collection ? `a ${p.collection} item` : "the site"}${p.title ? ` titled "${p.title}"` : ""}.\nFile name hint: ${file || "none"}.\nCurrent alt text: ${p.current || "(empty)"}.\nRules: describe the image's role and likely content in under 125 characters, plain words, no "image of". If the field is a logo, write "${ctx.agency.name} logo" style text. Do not invent details the file name and context do not support.\nReturn JSON {"text": "..."}.`);
      return { ...r, data: { text: scrubNumbers(String(r.data.text || "").slice(0, 160), allowed) } };
    }
    case "seo": {
      const col = getCollection(p.collection);
      const r = await run(ctx, `Write SEO for this ${col?.singular || "page"} using its real content. Content: ${JSON.stringify(p.item || {}).slice(0, 8000)}\nReturn JSON exactly shaped like ${SEO_SHAPE}.`);
      const d = r.data; if (!SCHEMA_TYPES.includes(d.schemaType)) d.schemaType = col?.defaultSchema || "WebPage";
      if (typeof d.keywords === "string") d.keywords = d.keywords.split(",").map((s: string) => s.trim());
      return { ...r, data: scrubDeep(d, allowed) };
    }
    case "section": {
      const r = await run(ctx, `Write the text for one "${p.type}" section on the page "${p.pageTitle}". Sections around it: ${JSON.stringify(p.neighbours || []).slice(0, 2000)}.\nCurrent content: ${JSON.stringify(p.data || {}).slice(0, 3000)}\nInstruction: ${p.instruction || "none"}\nFields to fill: ${textFieldsOf(p.type).join("; ")}\nReturn JSON {"data": {...only those fields...}}.`);
      const cleaned = cleanBlock({ type: p.type, data: r.data.data || r.data });
      return { ...r, data: { data: scrubDeep(cleaned?.data || {}, allowed) } };
    }
    case "page": {
      const builtin = p.builtinTypes as string[] | undefined;
      const r = await run(ctx, `Draft a complete ${p.pageType || "landing"} page.\nTopic: ${p.topic}\nAudience: ${p.audience || "not specified"}\nTarget keyword: ${p.keyword || "none"}\nReal facts to include: ${p.facts || "none"}\n${builtin ? `This is a built-in page. Write text for exactly these sections, in this order: ${builtin.join(", ")}.` : `Choose a sensible sequence of 5 to 9 sections from these block types:\n${BLOCK_GUIDE()}`}\nFor "services", "work", "blog", "pricing", "testimonials", "team", "casestudies" and "contact" blocks only write heading/intro; their items come from the database. Hero should have primaryLabel/primaryHref pointing to an allowed link.\nReturn JSON {"title":"","slug":"","blocks":[{"type":"","data":{}}],"seo":${SEO_SHAPE}}.`, true, 7000);
      const d = r.data;
      const blocks = (d.blocks || []).map(cleanBlock).filter(Boolean).map((b: any) => ({ ...b, data: scrubDeep(b.data, allowed) }));
      return { ...r, data: { title: d.title || p.topic, slug: slugify(d.slug || d.title || p.topic), blocks, seo: scrubDeep(d.seo || {}, allowed) } };
    }
    case "caseStudy": {
      let site = "";
      if (p.website) { try { site = (await safeFetchText(p.website)).slice(0, 5000); } catch (e: any) { site = `(could not read site: ${e.message})`; } }
      const r = await run(ctx, `Write a case study.\nClient: ${p.client}\nWebsite: ${p.website || "n/a"}\nText from the client's live site (for context only): ${site}\nServices performed: ${p.services || ""}\nThe problem, in the owner's words: ${p.problem}\nReal results typed by our team (the ONLY numbers you may use): ${p.results || "none given, so do not mention any numbers"}\nReturn JSON {"title":"","summary":"","overview":"(markdown)","challenges":[{"title":"","text":""}],"approach":[{"title":"","text":""}],"results":[{"value":"(must be copied from the real results)","label":""}],"resultsText":"(markdown)","seo":${SEO_SHAPE}}.`, true, 6000);
      const humanNums = numbersIn(String(p.results || ""));
      const d = scrubDeep(r.data, new Set([...humanNums]));
      d.results = (r.data.results || []).filter((x: any) => { const ns = numbersIn(String(x.value || "")); return ns.size > 0 && [...ns].every((n) => humanNums.has(n)); });
      return { ...r, data: d };
    }
    case "coverPrompts": {
      const r = await run(ctx, `Write 3 ready-to-paste prompts for an external image AI (ChatGPT image, Gemini, Midjourney) to create a cover image.\nSlot size: ${p.size}. Title: ${p.title}. Summary: ${p.summary || ""}. Brand colours: ${JSON.stringify(p.colors || {})}.\n${p.hasScreenshot ? "A screenshot exists: one prompt must say to attach it and build around it." : ""}\nEach prompt must state the exact final pixel size and aspect ratio, and a central safe area (inner 80%) where any text or key subject must stay. No real logos or brand marks.\nReturn JSON {"prompts":["","",""]}.`);
      return r;
    }
    case "locationPage": {
      const kind = p.kind === "industry" ? "industry" : "location";
      const r = await run(ctx, `Write a ${kind} landing page for "${p.name}" about our service "${p.serviceName}".\nReal facts the team supplied: ${p.facts || "none"}.\n${kind === "location" ? "Do NOT claim a local office, local team or local clients. Say we work remotely with clients in this area, across time zones." : "Speak to this industry's real needs without inventing clients or results."}\nOther pages in this batch (make this one clearly different in structure and wording): ${(p.others || []).join(", ")}.\nUse blocks from:\n${BLOCK_GUIDE()}\nInclude a "pricing" block (we'll attach the service) and a "cta" block.\nReturn JSON {"title":"","blocks":[{"type":"","data":{}}],"seo":${SEO_SHAPE}}.`, true, 6000);
      const blocks = (r.data.blocks || []).map(cleanBlock).filter(Boolean).map((b: any) => (b.type === "pricing" ? { ...b, data: { ...b.data, service: p.serviceId } } : { ...b, data: scrubDeep(b.data, allowed) }));
      return { ...r, data: { title: r.data.title || p.name, blocks, seo: scrubDeep(r.data.seo || {}, allowed) } };
    }
    case "servicePage": {
      const svc = ctx.services.find((s) => s.id === Number(p.serviceId));
      const r = await run(ctx, `Write a full service page for "${svc?.name}". Service record: ${JSON.stringify(p.service || {}).slice(0, 6000)}\nUse these blocks in order: hero, split (what's included as markdown list), steps (the process), pricing, faq (source manual, 4 questions from the service's real content), cta.\nReturn JSON {"title":"","blocks":[{"type":"","data":{}}],"seo":${SEO_SHAPE}}.`, true, 6000);
      const blocks = (r.data.blocks || []).map(cleanBlock).filter(Boolean).map((b: any) => (b.type === "pricing" ? { ...b, data: { ...b.data, service: Number(p.serviceId) } } : b.type === "faq" ? { ...b, data: { ...scrubDeep(b.data, allowed), source: "manual" } } : { ...b, data: scrubDeep(b.data, allowed) }));
      const seo = scrubDeep(r.data.seo || {}, allowed); seo.schemaType = "Service";
      return { ...r, data: { title: r.data.title || svc?.name, blocks, seo } };
    }
    case "chat": {
      const r = await run(ctx, `A website visitor asks: "${String(p.question).slice(0, 500)}". Answer in 1 to 3 short sentences using only this knowledge base and the context: ${JSON.stringify(p.kb || []).slice(0, 6000)}. If unsure, suggest contacting us. Return JSON {"answer":""}.`);
      return { ...r, data: { answer: scrubNumbers(String(r.data.answer || ""), allowed) } };
    }
    default: throw new Error("Unknown AI task.");
  }
}
export const plain = stripMd;
