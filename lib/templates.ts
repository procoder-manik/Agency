/** Ready-made page templates, section presets and HTML starters. Pure data, safe for client and server. */
export type BlockSpec = [type: string, data: Record<string, any>];
export interface PageTemplate { id: string; label: string; description: string; schema: string; blocks: BlockSpec[]; template?: boolean }

const cta = (h = "Ready to talk?", t = "Tell us what you need. We reply within one business day."): BlockSpec => ["cta", { heading: h, text: t, primaryLabel: "Book a free consultation", primaryHref: "/contact", secondaryLabel: "See pricing", secondaryHref: "/pricing" }];

const LOCAL_BLOCKS: BlockSpec[] = [
["hero", { heading: "{Website design|Web development} for {{industries}} in {{location}}", subheading: "We build fast, search-ready websites for {{industries}} serving customers in {{city}} and nearby areas.", primaryLabel: "Get a free quote", primaryHref: "/contact", badges: ["{{service}}", "{{location}}"] }],
    ["features", { heading: "What {{industries}} in {{city}} get from us", eyebrow: "{{service}}", items: [{ title: "A site built to be found", text: "Pages structured around the searches {{industries}} customers in {{city}} actually make." }, { title: "A clear path to enquiries", text: "Click-to-call, short forms and booking links on every page." }, { title: "Speed on every device", text: "Most local searches happen on a phone, so we build mobile first." }] }],
    ["steps", { heading: "How we work with {{industries}}", eyebrow: "Process", items: [{ title: "Free consultation", text: "We learn your services, your area and your competitors." }, { title: "Plan", text: "We agree the pages, the message and the timeline." }, { title: "Build", text: "We design, write and build, with your feedback at each stage." }, { title: "Launch and grow", text: "We go live, then help you rank and get enquiries." }] }],
    ["pricing", { heading: "Pricing", teaser: true }],
    ["faq", { heading: "Questions from {{industries}} in {{city}}", source: "manual", items: [{ q: "Do you work with businesses in {{location}}?", a: "Yes. We work remotely with {{industries}} in {{location}} and across time zones." }, { q: "How long does a {{industry}} website take?", a: "Most sites take a few weeks, depending on how many pages you need. We confirm the timeline after the first call." }] }],
    cta("Let's grow your {{industry}} business in {{city}}", "Tell us about your business and we will reply within one business day.")
];

export const PAGE_TEMPLATES: PageTemplate[] = [
  { id: "blank", label: "Blank page", description: "Start with a hero and build from there.", schema: "WebPage", blocks: [["hero", { heading: "Page title", subheading: "One sentence that says what this page is about." }]] },
  { id: "service", label: "Service landing page", description: "Hero, benefits, process, pricing, FAQ and a call to action.", schema: "Service", blocks: [
    ["hero", { heading: "Service name that says the result", subheading: "Who it is for and what they get, in one clear sentence.", primaryLabel: "Book a free consultation", primaryHref: "/contact", secondaryLabel: "See pricing", secondaryHref: "/pricing" }],
    ["features", { heading: "What you get", eyebrow: "Included", items: [{ title: "Benefit one", text: "Explain the outcome, not the task." }, { title: "Benefit two", text: "Explain the outcome, not the task." }, { title: "Benefit three", text: "Explain the outcome, not the task." }] }],
    ["steps", { heading: "How it works", eyebrow: "Process", items: [{ title: "Discovery", text: "We learn your goals." }, { title: "Plan", text: "We agree scope and timeline." }, { title: "Build", text: "We deliver in clear stages." }, { title: "Launch and improve", text: "We measure and refine." }] }],
    ["pricing", { heading: "Packages", teaser: true }],
    ["faq", { heading: "Questions about this service", source: "manual", items: [{ q: "How long does it take?", a: "Answer honestly." }, { q: "What do you need from me?", a: "List the inputs." }] }],
    cta()] },
  { id: "platform", label: "Platform page (Next.js, WordPress, Shopify...)", description: "Why this platform, who it suits, how we build on it.", schema: "Service", blocks: [
    ["hero", { heading: "Platform name development for businesses that need results", subheading: "What the platform is great at and who it suits.", primaryLabel: "Book a free consultation", primaryHref: "/contact", badges: ["Platform", "Fast", "SEO ready"] }],
    ["bento", { heading: "Why this platform", eyebrow: "Strengths", items: [{ icon: "01", title: "Strength one", text: "Explain it.", size: "md" }, { icon: "02", title: "Strength two", text: "Explain it.", size: "md" }, { icon: "03", title: "Strength three", text: "Explain it.", size: "sm" }, { icon: "04", title: "Strength four", text: "Explain it.", size: "sm" }, { icon: "05", title: "Strength five", text: "Explain it.", size: "sm" }] }],
    ["steps", { heading: "How we build on it", eyebrow: "Process", items: [{ title: "Plan", text: "" }, { title: "Design", text: "" }, { title: "Build", text: "" }, { title: "Launch", text: "" }] }],
    ["faq", { heading: "Common questions", source: "manual", items: [{ q: "Is this the right platform for me?", a: "Explain who it suits and who it does not." }] }],
    cta()] },
  { id: "local", label: "Local landing page (location and industry)", description: "A page for one service in one place, optionally for one industry.", schema: "Service", blocks: [
    ["hero", { heading: "{Website design|Web development} for {{industries}} in {{location}}", subheading: "We build fast, search-ready websites for {{industries}} serving customers in {{city}} and nearby areas.", primaryLabel: "Get a free quote", primaryHref: "/contact", badges: ["{{service}}", "{{location}}"] }],
    ["features", { heading: "What {{industries}} in {{city}} get from us", eyebrow: "{{service}}", items: [{ title: "A site built to be found", text: "Pages structured around the searches {{industries}} customers in {{city}} actually make." }, { title: "A clear path to enquiries", text: "Click-to-call, short forms and booking links on every page." }, { title: "Speed on every device", text: "Most local searches happen on a phone, so we build mobile first." }] }],
    ["steps", { heading: "How we work with {{industries}}", eyebrow: "Process", items: [{ title: "Free consultation", text: "We learn your services, your area and your competitors." }, { title: "Plan", text: "We agree the pages, the message and the timeline." }, { title: "Build", text: "We design, write and build, with your feedback at each stage." }, { title: "Launch and grow", text: "We go live, then help you rank and get enquiries." }] }],
    ["pricing", { heading: "Pricing", teaser: true }],
    ["faq", { heading: "Questions from {{industries}} in {{city}}", source: "manual", items: [{ q: "Do you work with businesses in {{location}}?", a: "Yes. We work remotely with {{industries}} in {{location}} and across time zones." }, { q: "How long does a {{industry}} website take?", a: "Most sites take a few weeks, depending on how many pages you need. We confirm the timeline after the first call." }] }],
    cta("Let's grow your {{industry}} business in {{city}}", "Tell us about your business and we will reply within one business day.")] },
  { id: "leadgen", label: "Lead generation landing page", description: "A focused page with one goal: get the enquiry.", schema: "WebPage", blocks: [
    ["hero", { heading: "A clear promise for one audience", subheading: "Say what they get and how fast.", primaryLabel: "Get my free audit", primaryHref: "#form" }],
    ["features", { heading: "What is included", items: [{ title: "Item one", text: "" }, { title: "Item two", text: "" }, { title: "Item three", text: "" }] }],
    ["contact", { heading: "Request your free audit", text: "Fill in the form and we will reply within one business day.", details: false }],
    ["faq", { heading: "Quick answers", source: "manual", items: [{ q: "Is it really free?", a: "Answer honestly." }] }]] },
  { id: "about", label: "About page", description: "Story, values, process, team.", schema: "AboutPage", blocks: [
    ["hero", { heading: "A small senior team for your whole growth stack", subheading: "Who we are and how we work." }],
    ["richtext", { heading: "Our story", body: "Write your story here." }],
    ["bento", { heading: "How we work", eyebrow: "Values", items: [{ icon: "01", title: "Plain English", text: "No jargon.", size: "md" }, { icon: "02", title: "Honest advice", text: "We tell you what you do not need.", size: "md" }, { icon: "03", title: "Measured results", text: "", size: "sm" }, { icon: "04", title: "Clear ownership", text: "", size: "sm" }, { icon: "05", title: "Fast replies", text: "", size: "sm" }] }],
    ["team", { heading: "The team" }], cta()] },
  { id: "resource", label: "Guide or resource page", description: "A long-form page with headings and an FAQ.", schema: "WebPage", blocks: [
    ["hero", { heading: "Guide title", subheading: "What the reader will learn." }],
    ["richtext", { heading: "Introduction", body: "## First point\n\nWrite here." }],
    ["faq", { heading: "FAQ", source: "manual", items: [{ q: "Question?", a: "Answer." }] }], cta()] },
  { id: "local-template", label: "Location page template (for the generator)", description: "A master page with {{variables}} that the Location pages tool copies.", schema: "Service", template: true, blocks: LOCAL_BLOCKS },
];

/** Ready-made sections: insert and edit. */
export interface SectionPreset { id: string; category: string; label: string; type: string; data: Record<string, any> }
export const SECTION_PRESETS: SectionPreset[] = [
  { id: "why", category: "Trust", label: "Why work with us (bento)", type: "bento", data: { heading: "Why teams work with us", eyebrow: "Why us", items: [{ icon: "01", title: "One team, one plan", text: "Website, search, ads, video and automation planned together.", size: "md" }, { icon: "02", title: "Built to rank", text: "SEO is part of every build, not an add-on.", size: "md" }, { icon: "03", title: "Plain-English reports", text: "You see what we did and what it did for you.", size: "sm" }, { icon: "04", title: "No lock-in", text: "You own your site, accounts and content.", size: "sm" }, { icon: "05", title: "Fast replies", text: "A real answer within one business day.", size: "sm" }] } },
  { id: "process4", category: "Process", label: "Four-step process", type: "steps", data: { heading: "How a project runs", eyebrow: "Process", items: [{ title: "Discovery call", text: "Goals, audience and the one action that matters." }, { title: "Plan", text: "Scope, timeline and price agreed in writing." }, { title: "Build", text: "Delivered in clear stages with your feedback." }, { title: "Launch and improve", text: "Go live, measure, refine." }] } },
  { id: "platforms", category: "Services", label: "Platforms we build on", type: "platforms", data: { heading: "Pick the platform that fits, not the one we prefer", eyebrow: "Platforms", items: [{ name: "Next.js", tag: "Speed and control", text: "Custom builds for fast, flexible sites and web apps.", href: "/nextjs-development" }, { name: "WordPress", tag: "Easy editing", text: "The most flexible CMS for content-heavy sites.", href: "/wordpress-development" }, { name: "Shopify", tag: "Online stores", text: "Reliable ecommerce with checkout handled.", href: "/shopify-development" }] } },
  { id: "compare-platforms", category: "Services", label: "Platform comparison table", type: "compare", data: { heading: "Which platform fits you?", eyebrow: "Compare", columns: ["WordPress", "Shopify", "Next.js"], highlight: "WordPress", rows: [{ label: "Best for", values: ["Content sites", "Online stores", "Custom products"] }, { label: "Easy to edit", values: ["yes", "yes", "Needs a CMS"] }, { label: "Full design freedom", values: ["yes", "Within themes", "yes"] }, { label: "Built-in checkout", values: ["With WooCommerce", "yes", "Custom"] }] } },
  { id: "faq5", category: "Trust", label: "FAQ (from your FAQ list)", type: "faq", data: { heading: "Questions we hear often", eyebrow: "FAQ", source: "collection", limit: 6 } },
  { id: "cta", category: "Conversion", label: "Closing call to action", type: "cta", data: { heading: "Have a project in mind?", text: "Tell us what you need. We reply within one business day.", primaryLabel: "Book a free consultation", primaryHref: "/contact" } },
  { id: "stats", category: "Trust", label: "Numbers (use real figures only)", type: "stats", data: { heading: "Our numbers", items: [{ value: 0, suffix: "+", label: "Replace with a real figure" }] } },
  { id: "locations", category: "Local", label: "Location and industry links", type: "locations", data: { heading: "Where we help", eyebrow: "Areas and industries", intro: "Pages for the places and industries we work with most.", filters: true } },
  { id: "contact", category: "Conversion", label: "Contact form with details", type: "contact", data: { heading: "Tell us about your project", text: "We reply within one business day.", details: true } },
  { id: "html-hero", category: "Custom HTML", label: "HTML: highlight banner", type: "html", data: { html: "", css: "", fullWidth: false } },
];

export interface HtmlStarter { id: string; label: string; html: string; css: string }
export const HTML_STARTERS: HtmlStarter[] = [
  { id: "banner", label: "Highlight banner", html: '<div class="hl"><p class="hl-tag">New</p><h2>Say the one thing that matters</h2><p>Support it with a single sentence.</p><a class="hl-btn" href="/contact">Get in touch</a></div>',
    css: '.hl{padding:clamp(2rem,6vw,4.5rem);border:1px solid rgb(var(--c-line));border-radius:var(--r-xl);background:radial-gradient(80% 120% at 0% 0%,rgb(var(--c-accent)/.18),transparent 60%),rgb(var(--c-surface))}.hl-tag{font-family:var(--font-mono);font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:rgb(var(--c-accent))}.hl h2{font-size:clamp(2rem,4.5vw,3.6rem);margin:.5rem 0 1rem;max-width:18ch}.hl p{color:rgb(var(--c-fg2));max-width:52ch}.hl-btn{display:inline-block;margin-top:1.5rem;padding:.85rem 1.5rem;border-radius:var(--r-btn);background:rgb(var(--c-accent));color:rgb(var(--c-onaccent));font-weight:600;text-decoration:none}' },
  { id: "twocol", label: "Two columns: text and list", html: '<div class="tc"><div><h2>Heading</h2><p>Short paragraph that sets up the list.</p></div><ul><li>Point one</li><li>Point two</li><li>Point three</li></ul></div>',
    css: '.tc{display:grid;gap:3rem;grid-template-columns:1fr}@media(min-width:900px){.tc{grid-template-columns:1fr 1fr;align-items:center}}.tc h2{font-size:clamp(1.8rem,3.6vw,3rem)}.tc p{color:rgb(var(--c-fg2));margin-top:1rem}.tc ul{list-style:none;padding:0;margin:0;border-top:1px solid rgb(var(--c-line))}.tc li{padding:1.1rem 0;border-bottom:1px solid rgb(var(--c-line));font-size:1.15rem}' },
  { id: "cards3", label: "Three cards", html: '<div class="c3"><div><h3>One</h3><p>Text.</p></div><div><h3>Two</h3><p>Text.</p></div><div><h3>Three</h3><p>Text.</p></div></div>',
    css: '.c3{display:grid;gap:1rem;grid-template-columns:1fr}@media(min-width:800px){.c3{grid-template-columns:repeat(3,1fr)}}.c3>div{padding:1.75rem;border:1px solid rgb(var(--c-line));border-radius:var(--r-lg);background:rgb(var(--c-surface)/.6);transition:transform .4s,border-color .4s}.c3>div:hover{transform:translateY(-4px);border-color:rgb(var(--c-accent))}.c3 h3{font-size:1.4rem}.c3 p{margin-top:.6rem;color:rgb(var(--c-fg2))}' },
  { id: "strip", label: "Contact strip", html: '<div class="cs"><p>Prefer to talk? <strong>Call us</strong> or send a message.</p><a href="/contact">Contact us →</a></div>',
    css: '.cs{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between;padding:1.25rem 1.75rem;border:1px solid rgb(var(--c-line));border-radius:999px;background:rgb(var(--c-surface)/.6)}.cs a{color:rgb(var(--c-accent));font-weight:600;text-decoration:none}' },
];
