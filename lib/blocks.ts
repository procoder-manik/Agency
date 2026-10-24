import { Field, opts } from "./fields";

export interface Block { id: string; type: string; hidden?: boolean; required?: boolean; data: Record<string, any> }
export interface BlockDef { type: string; label: string; description: string; fields: Field[] }

const heading: Field = { name: "heading", label: "Heading", type: "text" };
const intro: Field = { name: "intro", label: "Intro", type: "textarea" };
const link = (p: string, l: string): Field[] => [{ name: `${p}Label`, label: `${l} label`, type: "text" }, { name: `${p}Href`, label: `${l} link`, type: "url" }];

export const BLOCKS: BlockDef[] = [
  { type: "hero", label: "Hero", description: "Animated headline with calls to action and optional background media", fields: [
    heading, { name: "subheading", label: "Subheading", type: "textarea" }, ...link("primary", "Primary button"), ...link("secondary", "Secondary button"),
    { name: "badges", label: "Trust badges", type: "tags" },
    { name: "media", label: "Feature media (image, GIF, MP4/WebM loop or Lottie JSON)", type: "media", size: "1600 × 1000 (16:10)" },
    { name: "mediaMode", label: "Media placement", type: "select", options: opts("side|Beside the headline", "background|Full background") },
  ] },
  { type: "richtext", label: "Rich text", description: "Heading and formatted text", fields: [heading, { name: "body", label: "Body", type: "markdown" }] },
  { type: "split", label: "Image + text", description: "Media on one side, text on the other", fields: [
    heading, { name: "body", label: "Body", type: "markdown" }, { name: "media", label: "Media", type: "media", size: "1200 × 900 (4:3)" },
    { name: "reverse", label: "Media on the left", type: "toggle" }, ...link("link", "Link"),
  ] },
  { type: "cards", label: "Card grid", description: "Grid of cards with optional images and links", fields: [heading, intro,
    { name: "items", label: "Cards", type: "list", fields: [{ name: "icon", label: "Icon (emoji or symbol)", type: "text", ai: false }, { name: "title", label: "Title", type: "text" }, { name: "text", label: "Text", type: "textarea" }, { name: "image", label: "Image", type: "image", size: "800 × 600 (4:3)" }, { name: "href", label: "Link", type: "url" }] },
  ] },
  { type: "features", label: "Feature list", description: "Short list of benefits", fields: [heading, intro,
    { name: "items", label: "Features", type: "list", fields: [{ name: "title", label: "Title", type: "text" }, { name: "text", label: "Text", type: "textarea" }] },
  ] },
  { type: "steps", label: "Numbered steps", description: "A process in order", fields: [heading, intro,
    { name: "items", label: "Steps", type: "list", fields: [{ name: "title", label: "Title", type: "text" }, { name: "text", label: "Text", type: "textarea" }] },
    { name: "media", label: "Optional media", type: "media", size: "1200 × 900 (4:3)" },
  ] },
  { type: "stats", label: "Stat counters", description: "Numbers that count up on scroll (real figures only)", fields: [heading,
    { name: "items", label: "Stats", type: "list", fields: [{ name: "value", label: "Number", type: "number" }, { name: "suffix", label: "Suffix (+, %, etc.)", type: "text", ai: false }, { name: "label", label: "Label", type: "text" }] },
  ] },
  { type: "timeline", label: "Timeline", description: "Dated milestones", fields: [heading,
    { name: "items", label: "Milestones", type: "list", fields: [{ name: "date", label: "Date", type: "text", ai: false }, { name: "title", label: "Title", type: "text" }, { name: "text", label: "Text", type: "textarea" }] },
  ] },
  { type: "faq", label: "FAQ accordion", description: "Questions from the FAQ collection or typed here", fields: [heading,
    { name: "source", label: "Source", type: "select", options: opts("collection|FAQ collection", "manual|Typed below") },
    { name: "group", label: "Only this group (blank = all)", type: "text", ai: false },
    { name: "limit", label: "Max questions", type: "number" },
    { name: "searchable", label: "Show search and groups (full FAQ page)", type: "toggle" },
    { name: "items", label: "Questions", type: "list", fields: [{ name: "q", label: "Question", type: "text" }, { name: "a", label: "Answer", type: "textarea" }] },
  ] },
  { type: "cta", label: "Call-to-action banner", description: "Closing prompt with buttons", fields: [heading, { name: "text", label: "Text", type: "textarea" }, ...link("primary", "Primary button"), ...link("secondary", "Secondary button")] },
  { type: "marquee", label: "Logo marquee", description: "Infinitely scrolling client logos or names", fields: [heading,
    { name: "items", label: "Logos", type: "list", fields: [{ name: "label", label: "Name", type: "text" }, { name: "logo", label: "Logo", type: "image", size: "320 × 120" }] },
  ] },
  { type: "gallery", label: "Image gallery", description: "Grid of images, GIFs or loops", fields: [heading,
    { name: "items", label: "Images", type: "list", fields: [{ name: "image", label: "Media", type: "media", size: "1200 × 900 (4:3)" }, { name: "caption", label: "Caption", type: "text" }] },
  ] },
  { type: "video", label: "Video / GIF", description: "A looping video, GIF, Lottie or YouTube embed", fields: [heading, { name: "media", label: "Media (or YouTube URL)", type: "media", size: "1920 × 1080 (16:9)" }, { name: "caption", label: "Caption", type: "text" }] },
  { type: "services", label: "Services grid", description: "All published services", fields: [heading, intro] },
  { type: "work", label: "Work grid", description: "Projects from the Work collection", fields: [heading, intro, { name: "limit", label: "Max items (0 = all)", type: "number" }, { name: "featuredOnly", label: "Featured only", type: "toggle" }, { name: "filters", label: "Show filters", type: "toggle" }] },
  { type: "casestudies", label: "Case studies", description: "First featured large, the rest in a grid", fields: [heading, intro, { name: "limit", label: "Max items (0 = all)", type: "number" }] },
  { type: "blog", label: "Blog list", description: "Latest posts", fields: [heading, intro, { name: "limit", label: "Max posts (0 = all)", type: "number" }, { name: "filters", label: "Show category filters and search", type: "toggle" }] },
  { type: "pricing", label: "Pricing table", description: "Packages grouped by service", fields: [heading, intro, { name: "service", label: "Only this service", type: "relation", collection: "services" }, { name: "teaser", label: "Compact teaser", type: "toggle" }] },
  { type: "testimonials", label: "Testimonials", description: "Client quotes", fields: [heading, { name: "limit", label: "Max (0 = all)", type: "number" }] },
  { type: "team", label: "Team", description: "Team roster", fields: [heading, intro, { name: "limit", label: "Max (0 = all)", type: "number" }] },
  { type: "highlights", label: "Highlights strip", description: "A row of short commitments or key facts (use true statements only)", fields: [
    { name: "items", label: "Highlights", type: "list", fields: [{ name: "value", label: "Big text (e.g. 1 day, 0, 100%)", type: "text", ai: false }, { name: "title", label: "Title", type: "text" }, { name: "text", label: "Text", type: "textarea" }] },
  ] },
  { type: "bento", label: "Bento grid", description: "Creative grid of highlight tiles in mixed sizes", fields: [heading, intro,
    { name: "items", label: "Tiles", type: "list", fields: [{ name: "icon", label: "Icon (emoji or symbol)", type: "text", ai: false }, { name: "title", label: "Title", type: "text" }, { name: "text", label: "Text", type: "textarea" }, { name: "size", label: "Size", type: "select", options: opts("sm|Small","md|Wide","lg|Large and tall") }, { name: "href", label: "Link", type: "url" }] },
  ] },
  { type: "platforms", label: "Platforms and tools", description: "Cards for the platforms or tools you work with", fields: [heading, intro,
    { name: "items", label: "Platforms", type: "list", fields: [{ name: "name", label: "Name", type: "text" }, { name: "tag", label: "Best for", type: "text" }, { name: "text", label: "Description", type: "textarea" }, { name: "href", label: "Link", type: "url" }] },
  ] },
  { type: "compare", label: "Comparison table", description: "Compare options side by side", fields: [heading, intro,
    { name: "columns", label: "Columns (in order)", type: "tags", help: "e.g. WordPress, Shopify, Next.js" },
    { name: "highlight", label: "Column to highlight", type: "text", ai: false },
    { name: "rows", label: "Rows", type: "list", fields: [{ name: "label", label: "Row label", type: "text" }, { name: "values", label: "Values, one per column in the same order", type: "tags" }] },
  ] },
  { type: "locations", label: "Location and industry links", description: "Links to your generated location pages, with filters", fields: [heading, intro,
    { name: "limit", label: "Max links (0 = all)", type: "number" }, { name: "filters", label: "Show search and filters", type: "toggle" }] },
  { type: "html", label: "Custom HTML", description: "Your own HTML and CSS (admins only)", fields: [
    { name: "html", label: "HTML", type: "textarea", mono: true, rows: 12, ai: false, help: "Use theme colours with rgb(var(--c-accent)), rgb(var(--c-fg)), rgb(var(--c-surface)). Scripts are removed." },
    { name: "css", label: "CSS (optional, scoped to this block)", type: "textarea", mono: true, rows: 8, ai: false },
    { name: "fullWidth", label: "Full width (no page container or spacing)", type: "toggle" }] },
  { type: "module", label: "Custom module", description: "A module you designed in Modules", fields: [{ name: "module", label: "Module", type: "relation", collection: "modules" }] },
  { type: "contact", label: "Contact form", description: "A form from the Forms collection", fields: [heading, { name: "text", label: "Text", type: "textarea" }, { name: "form", label: "Form", type: "relation", collection: "forms" }, { name: "details", label: "Show contact details", type: "toggle" }] },
];

const eyebrow: Field = { name: "eyebrow", label: "Small label above the heading", type: "text", placeholder: "e.g. Services" };
for (const b of BLOCKS) {
  if (b.type === "hero") continue;
  const i = b.fields.findIndex((f) => f.name === "heading");
  if (i >= 0 && !b.fields.some((f) => f.name === "eyebrow")) b.fields.splice(i + 1, 0, eyebrow);
}

const layoutFields: Field[] = [
  { name: "layout", label: "Card layout", type: "select", options: opts("grid|Grid", "carousel|Carousel") },
  { name: "carouselMotion", label: "Carousel scrolling", type: "select", options: opts("auto|Auto scroll on (default)", "manual|Auto scroll off"), help: "Only used when the layout is Carousel." },
];
for (const t of ["cards", "platforms", "team", "blog", "work"]) { const b = BLOCKS.find((x) => x.type === t); if (b && !b.fields.some((f) => f.name === "layout")) b.fields.push(...layoutFields); }

export const getBlockDef = (t: string) => BLOCKS.find((b) => b.type === t);
export const newBlock = (type: string, data: Record<string, any> = {}, required = false): Block => ({
  id: Math.random().toString(36).slice(2, 10), type, data, ...(required ? { required: true } : {}),
});

/** Built-in pages: fixed URLs, required parts (can be reordered/hidden, not deleted). */
export const BUILTIN_PAGES: { slug: string; title: string; schema: string; blocks: [string, Record<string, any>][] }[] = [
  { slug: "home", title: "Home", schema: "WebPage", blocks: [
    ["hero", { heading: "Websites that win you clients, not just compliments", subheading: "We design, build and grow fast websites for small and mid-sized businesses, then keep them working.", primaryLabel: "Book a free consultation", primaryHref: "/contact", secondaryLabel: "See our work", secondaryHref: "/work", badges: ["Design", "Development", "SEO", "Automation"], mediaMode: "side" }],
    ["marquee", { heading: "Teams we've built for", items: [{ label: "Northwind" }, { label: "Acme Co" }, { label: "Harbor & Pine" }, { label: "Lumen Clinic" }, { label: "Fieldstone" }, { label: "Kite Labs" }] }],
    ["split", { heading: "A small team that ships", body: "We keep projects small enough that the people you talk to are the people doing the work. Strategy, design, code and search all sit at one table." }],
    ["services", { heading: "What we do", eyebrow: "Services", intro: "Pick one service or combine them. Every project starts with a free call." }],
    ["work", { heading: "Selected work", eyebrow: "Work", limit: 6, featuredOnly: true }],
    ["casestudies", { heading: "Case study", eyebrow: "Case study", limit: 1 }],
    ["steps", { heading: "How we work", eyebrow: "Process", items: [{ title: "Discovery call", text: "We learn what you sell, who buys it and what the site has to do." }, { title: "Plan and design", text: "Sitemap, wireframes and a visual direction you approve before we build." }, { title: "Build and launch", text: "Fast, accessible pages, set up for search from day one." }, { title: "Grow and care", text: "Monthly updates, SEO and fixes so the site keeps earning." }] }],
    ["team", { heading: "The people behind the work", eyebrow: "Team", limit: 4 }],
    ["testimonials", { heading: "What clients say", eyebrow: "Clients", limit: 3 }],
    ["pricing", { heading: "Simple packages", eyebrow: "Pricing", intro: "Fixed prices for common projects. Custom quotes for everything else.", teaser: true }],
    ["blog", { heading: "From the blog", eyebrow: "Journal", limit: 3 }],
    ["faq", { heading: "Questions we hear often", eyebrow: "FAQ", source: "collection", limit: 5 }],
    ["cta", { heading: "Have a project in mind?", text: "Tell us what you need. We reply within one business day.", primaryLabel: "Book a free consultation", primaryHref: "/contact" }],
  ] },
  { slug: "services", title: "Services", schema: "CollectionPage", blocks: [["hero", { heading: "Services", subheading: "Design, development, search and automation for growing businesses." }], ["services", {}], ["cta", { heading: "Not sure what you need?", text: "A short call usually answers it.", primaryLabel: "Book a free consultation", primaryHref: "/contact" }]] },
  { slug: "work", title: "Work", schema: "CollectionPage", blocks: [["hero", { heading: "Our work", subheading: "Live sites, current builds and long-term care clients." }], ["work", { filters: true }], ["cta", { heading: "Want results like these?", primaryLabel: "Start a project", primaryHref: "/contact" }]] },
  { slug: "case-studies", title: "Case studies", schema: "CollectionPage", blocks: [["hero", { heading: "Case studies", subheading: "The problem, what we did and what changed." }], ["casestudies", {}]] },
  { slug: "pricing", title: "Pricing", schema: "WebPage", blocks: [["hero", { heading: "Pricing", subheading: "Clear packages for common projects." }], ["pricing", {}], ["faq", { heading: "Pricing questions", source: "collection", group: "Pricing" }], ["cta", { heading: "Need something custom?", text: "Book a call and we'll quote it.", primaryLabel: "Book a call", primaryHref: "/contact" }]] },
  { slug: "about", title: "About", schema: "AboutPage", blocks: [["hero", { heading: "About us", subheading: "Who we are and how we work." }], ["richtext", { heading: "Our story", body: "Write your agency story here." }], ["team", { heading: "Team" }], ["testimonials", { heading: "Kind words" }]] },
  { slug: "blog", title: "Blog", schema: "CollectionPage", blocks: [["hero", { heading: "Blog", subheading: "Notes on design, search and running a better website." }], ["blog", { filters: true }]] },
  { slug: "faq", title: "FAQ", schema: "FAQPage", blocks: [["hero", { heading: "Frequently asked questions" }], ["faq", { source: "collection", searchable: true }]] },
  { slug: "help", title: "Help center", schema: "CollectionPage", blocks: [["hero", { heading: "Help center", subheading: "Guides and answers for our clients." }], ["faq", { source: "collection", searchable: true, group: "__help" }]] },
  { slug: "contact", title: "Contact", schema: "ContactPage", blocks: [["hero", { heading: "Let's talk", subheading: "Tell us about your project." }], ["contact", { details: true, heading: "Send us a message" }]] },
  { slug: "privacy", title: "Privacy policy", schema: "WebPage", blocks: [["richtext", { heading: "Privacy policy", body: "Write your privacy policy here." }]] },
  { slug: "terms", title: "Terms of service", schema: "WebPage", blocks: [["richtext", { heading: "Terms of service", body: "Write your terms here." }]] },
];
export const BUILTIN_SLUGS = BUILTIN_PAGES.map((p) => p.slug);
