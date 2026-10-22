import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { PRESETS } from "../lib/themes";
import { SETTING_DEFAULTS } from "../lib/settings-defaults";
import { BUILTIN_PAGES, newBlock } from "../lib/blocks";

export async function seed() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  const j = (v: any) => sql.json(v);
  try {
    // Admin user
    const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
    const [u] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (!u) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 12);
      await sql`INSERT INTO users (email, name, password_hash, role) VALUES (${email}, 'Admin', ${hash}, 'admin')`;
      console.log("  created admin", email);
    }
    // Built-in themes (refreshed on every run so preset updates ship)
    for (const t of PRESETS) {
      await sql`INSERT INTO themes (slug, name, builtin, tokens) VALUES (${t.slug}, ${t.name}, true, ${j(t.tokens)})
        ON CONFLICT (slug) DO UPDATE SET tokens = EXCLUDED.tokens, name = EXCLUDED.name, builtin = true, updated_at = now()`;
    }
    // Settings (only missing keys)
    for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
      await sql`INSERT INTO settings (key, value) VALUES (${key}, ${j(value)}) ON CONFLICT (key) DO NOTHING`;
    }
    // Built-in pages
    let order = 0;
    for (const p of BUILTIN_PAGES) {
      const [exists] = await sql`SELECT id FROM entries WHERE collection='pages' AND slug=${p.slug} AND deleted_at IS NULL`;
      if (!exists) {
        const blocks = p.blocks.map(([type, data]) => newBlock(type, data, true));
        await sql`INSERT INTO entries (collection, slug, title, status, builtin, sort_order, data, seo, published_at)
          VALUES ('pages', ${p.slug}, ${p.title}, 'published', true, ${order}, ${j({ blocks })}, ${j({ schemaType: p.schema })}, now())`;
      }
      order++;
    }
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM entries WHERE collection <> 'pages'`;
    if (count === 0) await sampleContent(sql);
    console.log("✓ Seed data ready");
  } finally {
    await sql.end();
  }
}

async function sampleContent(sql: postgres.Sql) {
  const j = (v: any) => sql.json(v);
  const ins = async (collection: string, title: string, slug: string, data: any, extra: { featured?: boolean; order?: number } = {}) => {
    const [r] = await sql`INSERT INTO entries (collection, title, slug, status, featured, sort_order, data, published_at)
      VALUES (${collection}, ${title}, ${slug}, 'published', ${extra.featured ?? false}, ${extra.order ?? 0}, ${j(data)}, now()) RETURNING id`;
    return r.id as number;
  };
  const web = await ins("services", "Website design & development", "web-design", {
    icon: "◆", summary: "Fast, accessible websites designed around what your customers need to do.",
    description: "We plan, design and build your site on a modern stack, with editing you can do yourself.",
    includes: [{ title: "Sitemap and wireframes", text: "" }, { title: "Custom visual design", text: "" }, { title: "Responsive build", text: "" }, { title: "Content editing panel", text: "" }],
    steps: [{ title: "Discovery", text: "Goals, audience and content." }, { title: "Design", text: "Wireframes, then visuals." }, { title: "Build", text: "Pages, CMS and integrations." }, { title: "Launch", text: "Testing, redirects and go-live." }],
    faq: [{ q: "How long does a website take?", a: "Most small business sites take three to six weeks." }],
  }, { order: 0, featured: true });
  const seo = await ins("services", "SEO", "seo", {
    icon: "◎", summary: "Technical fixes, on-page work and content that helps the right people find you.",
    description: "We audit what's holding your site back in search, fix it, and build a content plan you can keep up with.",
    includes: [{ title: "Technical audit", text: "" }, { title: "On-page optimisation", text: "" }, { title: "Monthly reporting", text: "" }],
    steps: [{ title: "Audit", text: "" }, { title: "Fix", text: "" }, { title: "Grow", text: "" }],
  }, { order: 1 });
  const auto = await ins("services", "Marketing automation", "marketing-automation", {
    icon: "⟳", summary: "Forms, emails and follow-ups that run without someone copying data around.",
    description: "We connect your site, CRM and inbox so leads get a reply and nothing falls through.",
    includes: [{ title: "Lead capture flows", text: "" }, { title: "Email sequences", text: "" }, { title: "CRM integration", text: "" }],
  }, { order: 2 });
  await ins("services", "Care & maintenance", "care-plan", {
    icon: "✚", summary: "Updates, backups, uptime checks and small changes every month.", description: "A monthly plan so your site stays fast, secure and current.",
  }, { order: 3 });
  await ins("packages", "Starter site", "", { service: web, price: 900, currency: "USD", billing: "one-time", delivery: "3 weeks", summary: "For a new business that needs a clear, professional site.", features: ["Up to 5 pages", "Contact form", "Basic SEO setup", "Editing panel"] }, { order: 0 });
  await ins("packages", "Growth site", "", { service: web, price: 2400, priceMax: 3500, currency: "USD", billing: "one-time", delivery: "5 to 6 weeks", summary: "For businesses that rely on the site for leads.", features: ["Up to 15 pages", "Custom design", "Blog and case studies", "Analytics and SEO"], highlight: true }, { order: 1 });
  await ins("packages", "SEO monthly", "", { service: seo, price: 450, currency: "USD", billing: "monthly", delivery: "Ongoing", summary: "Steady, measurable search work.", features: ["Technical fixes", "2 articles a month", "Monthly report"] }, { order: 2 });
  await ins("packages", "Automation setup", "", { service: auto, price: 700, currency: "USD", billing: "one-time", delivery: "2 weeks", features: ["Lead form to CRM", "Auto-reply email", "Follow-up sequence"] }, { order: 3 });
  const founder = await ins("team", "Founder Name", "founder", { role: "Founder & lead developer", bio: "Replace with your bio.", skills: ["Next.js", "SEO", "Strategy"] }, { order: 0 });
  await ins("team", "Designer Name", "designer", { role: "Design lead", bio: "Replace with a real team member, or delete.", skills: ["UI design", "Branding"] }, { order: 1 });
  const p1 = await ins("projects", "Clinic booking website", "clinic-booking-website", { client: "Example Clinic", industry: "Healthcare", summary: "A new site with online booking and service pages for each treatment.", body: "Replace this with the real project write-up.", services: [web, seo], technologies: ["Next.js", "PostgreSQL"], platform: "Custom", workStatus: "completed", accent: "#3D8BFF" }, { featured: true, order: 0 });
  await ins("projects", "Outdoor gear store", "outdoor-gear-store", { client: "Example Outfitters", industry: "Retail", summary: "Storefront redesign with faster product pages.", services: [web], technologies: ["Shopify"], platform: "Shopify", workStatus: "ongoing" }, { featured: true, order: 1 });
  await ins("projects", "Law firm lead engine", "law-firm-lead-engine", { client: "Example Legal", industry: "Legal", summary: "Practice-area pages, intake forms and a monthly care plan.", services: [seo, auto], technologies: ["WordPress", "HubSpot"], platform: "WordPress", workStatus: "care" }, { featured: true, order: 2 });
  await ins("caseStudies", "Rebuilding a clinic's booking journey", "clinic-booking-journey", { client: "Example Clinic", industry: "Healthcare", summary: "How we replaced phone-only bookings with a clear online flow.", overview: "Replace with the real story.", challenges: [{ title: "Bookings only by phone", text: "Staff spent hours on the phone." }], approach: [{ title: "Mapped every treatment", text: "" }, { title: "Built a booking flow", text: "" }], results: [], resultsText: "Add real, measured results here. The AI tools will never invent numbers.", project: p1, services: [web, seo] }, { featured: true });
  await ins("testimonials", "Client Name", "", { role: "Owner", company: "Example Clinic", quote: "Replace with a real client quote.", project: p1 });
  const cat = await ins("categories", "Guides", "guides", { description: "How-to articles." });
  await ins("posts", "How to brief a web agency", "how-to-brief-a-web-agency", { excerpt: "What to prepare before your first call so the quote is accurate.", body: "## Start with goals\n\nReplace with your article.", category: cat, author: founder, tags: ["planning"], kind: "article" });
  const faqs = [
    ["How much does a website cost?", "Our packages start at the prices on the pricing page. Custom work is quoted after a call.", "Pricing"],
    ["Do you work with clients abroad?", "Yes. We work remotely with clients across time zones.", "General"],
    ["Can I edit the site myself?", "Yes. Every site comes with an editing panel and a short walkthrough.", "Website design & development"],
    ["How long until SEO shows results?", "Usually a few months, depending on competition and the site's starting point.", "SEO"],
  ];
  let i = 0;
  for (const [q, a, g] of faqs) await ins("faqs", q, q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), { answer: a, category: g, showOnFaq: true, showInHelp: true }, { order: i++ });
  await ins("forms", "Contact", "contact", {
    fields: [
      { name: "name", label: "Your name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" }, { name: "company", label: "Company", type: "text" },
      { name: "service", label: "Service", type: "select", options: "Website, SEO, Automation, Not sure yet" },
      { name: "budget", label: "Budget", type: "select", options: "Under $1,000, $1,000 to $3,000, $3,000 to $10,000, $10,000+" },
      { name: "message", label: "Tell us about the project", type: "textarea", required: true },
    ], successMessage: "Thanks! We got your message and will reply soon.", createLead: true,
  });
  console.log("  added sample content (replace or delete it in the admin)");
}

if (process.argv[1]?.includes("seed")) seed().catch((e) => { console.error(e); process.exit(1); });
