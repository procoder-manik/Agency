import type { BlockSpec } from "../templates";
import { PAGE_TEMPLATES } from "../templates";

export interface PageSeed { slug: string; title: string; schema: string; blocks: BlockSpec[]; seo?: Record<string, any>; status?: "published" | "draft"; template?: boolean; data?: Record<string, any> }

const CTA_LABEL = "Book a free consultation";
const cta = (h: string, t: string): BlockSpec => ["cta", { heading: h, text: t, primaryLabel: CTA_LABEL, primaryHref: "/contact", secondaryLabel: "See pricing", secondaryHref: "/pricing" }];
const hero = (heading: string, subheading: string, extra: Record<string, any> = {}): BlockSpec => ["hero", { heading, subheading, ...extra }];
const TOOLS = ["Next.js", "Laravel", "WordPress", "WooCommerce", "Shopify", "Squarespace", "Wix", "Google Ads", "Meta Ads", "GA4", "n8n", "Make", "Zapier", "OpenAI"].map((label) => ({ label }));


/* ---------------- shared sections ---------------- */
const COMMIT: BlockSpec = ["highlights", { items: [
  { value: "1", title: "Team, one plan", text: "Website, SEO, marketing, video and automation planned together." },
  { value: "1 day", title: "Reply time", text: "A real answer within one business day." },
  { value: "0", title: "Lock-in contracts", text: "Monthly services can be cancelled with notice." },
  { value: "100%", title: "Yours to keep", text: "Your site, accounts, ad data and content belong to you." }] }];

const COMPARE_US: BlockSpec = ["compare", { heading: "A typical agency vs our approach", eyebrow: "Difference", intro: "The gaps we hear about most from businesses who come to us after a bad experience.", columns: ["Typical agency", "Our approach"], highlight: "Our approach", rows: [
  { label: "Platform advice", values: ["Pushes the platform they sell", "Recommends what fits, even when it is the cheaper option"] },
  { label: "SEO", values: ["Added after the site launches", "Built into every page from day one"] },
  { label: "Website and marketing", values: ["Separate teams that rarely talk", "One plan across site, ads, email and video"] },
  { label: "Reporting", values: ["Dashboards full of vanity metrics", "Plain-English reports tied to enquiries and sales"] },
  { label: "Contracts", values: ["Long lock-in terms", "Monthly services, cancel with notice"] },
  { label: "Ownership", values: ["Accounts and files held by the agency", "You own your site, accounts and data"] },
  { label: "Follow-up work", values: ["Manual copy and paste", "Leads captured, followed up and reported automatically"] }] }];

const INDUSTRIES: BlockSpec = ["cards", { heading: "Industries we help", eyebrow: "Who we work with", intro: "We work remotely with businesses across time zones. These are the industries we build for most often.", items: [
  { icon: "⌂", title: "Home and trade services", text: "Plumbers, electricians, HVAC and cleaners: sites and local SEO that bring in calls.", href: "/areas-we-serve" },
  { icon: "✚", title: "Healthcare and dental", text: "Clinics and practices: clear service pages, booking and local visibility.", href: "/areas-we-serve" },
  { icon: "§", title: "Legal and professional", text: "Law firms, accountants and consultants: trust-building sites and lead capture.", href: "/areas-we-serve" },
  { icon: "◈", title: "Real estate", text: "Agents and agencies: listing pages, local SEO and lead follow-up.", href: "/areas-we-serve" },
  { icon: "◉", title: "Restaurants and hospitality", text: "Menus, bookings, local search and short-form video.", href: "/areas-we-serve" },
  { icon: "▣", title: "Ecommerce and retail", text: "Shopify and WooCommerce stores with SEO, email and ads.", href: "/shopify-development" },
  { icon: "▶", title: "Creators and coaches", text: "Sites, video editing and funnels for personal brands.", href: "/services/video-editing" },
  { icon: "⬡", title: "Startups and SaaS", text: "Fast marketing sites, product pages and automation.", href: "/nextjs-development" }] }];

const FIRST90: BlockSpec = ["timeline", { heading: "What your first 90 days can look like", eyebrow: "Roadmap", items: [
  { date: "Week 1", title: "Discovery and audit", text: "We learn your goals, review your current site and competitors, and agree a plan." },
  { date: "Weeks 2 to 4", title: "Build and fix", text: "Design, development and technical fixes, with your feedback at each stage." },
  { date: "Month 2", title: "Launch and publish", text: "The site goes live, tracking is verified, and the first content and campaigns start." },
  { date: "Month 3", title: "Measure and improve", text: "We review enquiries, rankings and conversions, then decide what to scale." }] }];

const WAYS: BlockSpec = ["bento", { heading: "Ways to work with us", eyebrow: "Engagement", items: [
  { icon: "01", title: "One-off project", text: "A website, a store, a video pack or an automation, with a fixed scope, timeline and price.", size: "md" },
  { icon: "02", title: "Monthly partnership", text: "SEO, marketing, video editing or automation month to month, with a clear monthly report.", size: "md" },
  { icon: "03", title: "Audit first", text: "Not sure where to start? An audit gives you a prioritised plan you can use with or without us.", size: "sm" },
  { icon: "04", title: "Care plan", text: "Updates, backups and small changes after launch.", size: "sm" },
  { icon: "05", title: "Training and handover", text: "Sessions so your team can run the site confidently.", size: "sm" }] }];

const INCLUDED_ITEMS = [
  { title: "SEO foundations", text: "Titles, headings, schema, clean URLs and redirects from the start." },
  { title: "Analytics and tracking", text: "GA4 and Search Console set up so you can see what works." },
  { title: "Speed and mobile checks", text: "Tested on real devices and tuned for fast loading." },
  { title: "Accessibility basics", text: "Readable text, sensible contrast, keyboard-friendly navigation." },
  { title: "Security basics", text: "HTTPS, backups and spam protection on forms." },
  { title: "Training and handover", text: "A walkthrough and written guide so you are never stuck." },
  { title: "Clear documentation", text: "What was built, where it lives and how to change it." },
  { title: "A post-launch support window", text: "We stay close after go-live to fix anything that comes up." }];
const INCLUDED: BlockSpec = ["features", { heading: "Included in every project", eyebrow: "Standards", intro: "The basics we never skip, whatever the platform or the budget.", items: INCLUDED_ITEMS }];

/* ---------------- core pages ---------------- */
export const CORE_PAGES: PageSeed[] = [
  { slug: "home", title: "Home", schema: "WebPage", seo: { metaTitle: "Web development, SEO and AI automation agency", metaDescription: "We build fast websites on Next.js, Laravel, WordPress, Shopify, Squarespace and Wix, then grow them with SEO, marketing, video and AI automation.", focusKeyword: "web development and SEO agency" }, blocks: [
    hero("Websites, search and automation that bring in customers", "We build fast websites on the platform that fits you, get them found on Google, run the marketing around them, edit your videos and automate the busywork.", { primaryLabel: CTA_LABEL, primaryHref: "/contact", secondaryLabel: "See our services", secondaryHref: "/services", badges: ["Web development", "SEO", "Digital marketing", "Video editing", "AI automation"] }),
    ["marquee", { heading: "Platforms and tools we work with", items: TOOLS }],
    COMMIT,
    ["split", { heading: "One team for the whole growth stack", body: "Most businesses juggle a web designer, an SEO freelancer, an ads manager, a video editor and a tool expert, and nobody owns the result.\n\nWe replace that with one small, senior team and one plan. The site we build is made to rank. The marketing we run points at pages that convert. The repetitive work behind it is automated.\n\nYou get clear scope, plain-English reports and no lock-in contracts.", linkLabel: "How we work", linkHref: "/about" }],
    ["services", { heading: "What we do", eyebrow: "Services", intro: "Pick one service or combine them. Every project starts with a free call and an honest recommendation." }],
    ["bento", { heading: "Why businesses choose us", eyebrow: "Why us", items: [
      { icon: "01", title: "Built to rank from day one", text: "Technical SEO, schema and clean structure are part of every build, not an upsell.", size: "md" },
      { icon: "02", title: "Any platform, honest advice", text: "Next.js, Laravel, WordPress, Shopify, Squarespace or Wix. We recommend what fits, even when it is the cheaper option.", size: "md" },
      { icon: "03", title: "Fast on every device", text: "Performance budgets and mobile-first layouts.", size: "sm" },
      { icon: "04", title: "Automation that saves hours", text: "Leads captured, followed up and reported on automatically.", size: "sm" },
      { icon: "05", title: "You own everything", text: "Your site, accounts, ad data and content are yours.", size: "sm" },
      { icon: "06", title: "Plain-English reports", text: "You see what we did and what it did for the business. No jargon, no vanity metrics.", size: "md" },
      { icon: "07", title: "Fast replies", text: "A real answer within one business day.", size: "md" }] }],
    COMPARE_US,
    ["platforms", { heading: "Pick the platform that fits, not the one we prefer", eyebrow: "Platforms", intro: "We build on the platforms businesses actually use, and we will tell you which one to choose.", items: [
      { name: "Next.js", tag: "Speed and control", text: "Custom sites and web apps with top performance and full design freedom.", href: "/nextjs-development" },
      { name: "Laravel", tag: "Custom apps", text: "Robust back-ends, portals, dashboards and custom business logic.", href: "/laravel-development" },
      { name: "WordPress", tag: "Content and flexibility", text: "The most flexible CMS for business, service and content sites.", href: "/wordpress-development" },
      { name: "Shopify", tag: "Online stores", text: "Reliable ecommerce with checkout, payments and inventory handled.", href: "/shopify-development" },
      { name: "Squarespace", tag: "Simple and elegant", text: "Polished, easy-to-manage sites for small businesses and creators.", href: "/squarespace-design" },
      { name: "Wix", tag: "Quick to launch", text: "Fast, flexible sites with a friendly editor and built-in tools.", href: "/wix-design" }] }],
    INDUSTRIES,
    FIRST90,
    ["steps", { heading: "How a project runs", eyebrow: "Process", items: [{ title: "Free discovery call", text: "We learn your goals, audience and competitors, then tell you honestly what we would do." }, { title: "Plan and proposal", text: "Scope, timeline and price in writing, before any work starts." }, { title: "Build and launch", text: "We deliver in clear stages, with your feedback at each one." }, { title: "Grow and improve", text: "SEO, marketing and automation turn the launch into steady results." }] }],
    WAYS,
    ["locations", { heading: "Built for local and service businesses", eyebrow: "Areas and industries", intro: "Pages for the industries and places we work with most.", limit: 6 }],
    ["pricing", { heading: "Simple, transparent packages", eyebrow: "Pricing", intro: "Fixed prices for common projects. Custom quotes for everything else.", teaser: true }],
    ["work", { heading: "Selected work", eyebrow: "Work", limit: 6, featuredOnly: true }],
    ["testimonials", { heading: "What clients say", eyebrow: "Clients", limit: 3 }],
    ["blog", { heading: "From the blog", eyebrow: "Journal", limit: 3 }],
    ["faq", { heading: "Questions we hear often", eyebrow: "FAQ", source: "collection", limit: 8 }],
    cta("Have a project in mind?", "Tell us what you need. We reply within one business day."),
  ] },
  { slug: "services", title: "Services", schema: "CollectionPage", seo: { metaTitle: "Web development, SEO, marketing, video and AI automation services", metaDescription: "Explore our web development, SEO, digital marketing, video editing and AI automation services." }, blocks: [
    hero("Everything you need to get found and get customers", "Web development, SEO, digital marketing, video editing and AI automation from one senior team."),
    COMMIT,
    ["services", { heading: "Our services", eyebrow: "Services", intro: "Choose one, or combine them for a single joined-up plan." }],
    INCLUDED,
    ["compare", { heading: "Which website platform fits you?", eyebrow: "Compare", intro: "A quick guide. We will confirm the best choice on a short call.", columns: ["WordPress", "Shopify", "Squarespace / Wix", "Next.js / Laravel"], highlight: "WordPress", rows: [
      { label: "Best for", values: ["Content and service sites", "Online stores", "Simple sites you manage yourself", "Custom features and top speed"] },
      { label: "Easy for your team to edit", values: ["yes", "yes", "yes", "With a CMS we set up"] },
      { label: "Full design freedom", values: ["yes", "Within themes", "Within templates", "yes"] },
      { label: "Built-in online store", values: ["With WooCommerce", "yes", "Basic", "Custom"] },
      { label: "Typical speed to launch", values: ["Weeks", "Weeks", "Days to weeks", "Weeks to months"] }] }],
    ["steps", { heading: "How we work", eyebrow: "Process", items: [{ title: "Discover", text: "A free call to understand your goals." }, { title: "Plan", text: "A written proposal with scope, timeline and price." }, { title: "Deliver", text: "Clear stages and regular updates." }, { title: "Improve", text: "Measure, learn and keep growing." }] }],
    WAYS,
    INDUSTRIES,
    ["faq", { heading: "Service questions", eyebrow: "FAQ", source: "collection", limit: 6 }],
    cta("Not sure what you need?", "A short call usually answers it."),
  ] },
  { slug: "platforms", title: "Website platforms", schema: "CollectionPage", seo: { metaTitle: "Website platforms we build on: Next.js, Laravel, WordPress, Shopify, Squarespace, Wix", metaDescription: "We build business websites, stores and web apps on Next.js, Laravel, WordPress, Shopify, Squarespace and Wix. See which platform fits you." }, blocks: [
    hero("The right platform for your website", "We build on six platforms and recommend the one that fits your team, your budget and your goals."),
    ["platforms", { heading: "Platforms we build on", eyebrow: "Platforms", items: [
      { name: "Next.js", tag: "Speed and control", text: "Custom sites and web apps with excellent performance and full design freedom.", href: "/nextjs-development" },
      { name: "Laravel", tag: "Custom apps", text: "Portals, dashboards, booking systems and custom business logic.", href: "/laravel-development" },
      { name: "WordPress", tag: "Content and flexibility", text: "The most flexible CMS for business, service and content sites.", href: "/wordpress-development" },
      { name: "Shopify", tag: "Online stores", text: "Reliable ecommerce with checkout, payments and inventory handled.", href: "/shopify-development" },
      { name: "Squarespace", tag: "Simple and elegant", text: "Polished, easy-to-manage sites for small businesses and creators.", href: "/squarespace-design" },
      { name: "Wix", tag: "Quick to launch", text: "Fast, flexible sites with a friendly editor and built-in tools.", href: "/wix-design" }] }],
    ["compare", { heading: "Side by side", eyebrow: "Compare", columns: ["WordPress", "Shopify", "Squarespace", "Wix", "Next.js", "Laravel"], highlight: "WordPress", rows: [
      { label: "Best for", values: ["Content sites", "Stores", "Simple sites", "Quick launches", "Speed and custom UI", "Custom apps"] },
      { label: "Edit without a developer", values: ["yes", "yes", "yes", "yes", "With a CMS", "With an admin panel"] },
      { label: "Online store", values: ["WooCommerce", "yes", "Basic", "Basic", "Custom", "Custom"] },
      { label: "Custom features", values: ["Plugins and code", "Apps and themes", "Limited", "Limited", "yes", "yes"] },
      { label: "Ongoing upkeep", values: ["Updates needed", "Handled by Shopify", "Handled by Squarespace", "Handled by Wix", "Developer-managed", "Developer-managed"] }] }],
    ["faq", { heading: "Choosing a platform", source: "manual", items: [{ q: "Can you move my site from one platform to another?", a: "Yes. We migrate content, set up redirects to protect your search rankings and test everything before the switch." }, { q: "What if I do not know which platform I need?", a: "That is the most common starting point. Book a short call and we will recommend one based on your goals, team and budget." }, { q: "Can you work on a site someone else built?", a: "Yes. We review it first and tell you whether to improve it or rebuild it." }] }],
    cta("Let us help you choose", "A 20-minute call is usually enough to pick the right platform."),
  ] },
  { slug: "about", title: "About", schema: "AboutPage", seo: { metaTitle: "About us: a small senior team for web, SEO and automation", metaDescription: "Meet the team behind your website, SEO, marketing, video and AI automation. How we work and what to expect." }, blocks: [
    hero("A small senior team for your whole growth stack", "Who we are, how we work and what it is like to work with us."),
    COMMIT,
    ["split", { heading: "Why we exist", eyebrow: "Our story", body: "Too many businesses pay for a website that looks good and never brings in work, then pay someone else for SEO, someone else for ads and someone else to fix the mess in between.\n\nWe believe the website, the search strategy, the marketing and the automation should be planned together. So we work as one team, with senior people on every project and one person who owns your account.\n\nWe would rather tell you a simple solution is enough than sell you something you do not need." }],
    ["bento", { heading: "How we work", eyebrow: "Principles", items: [
      { icon: "01", title: "Plain English", text: "No jargon and no mystery. You always know what we are doing and why.", size: "md" },
      { icon: "02", title: "Honest advice", text: "If the cheaper option is enough, we will say so.", size: "md" },
      { icon: "03", title: "Measured results", text: "We tie work to enquiries and sales.", size: "sm" },
      { icon: "04", title: "You own it", text: "Your site, accounts and data stay yours.", size: "sm" },
      { icon: "05", title: "No lock-in", text: "Monthly services, cancel with notice.", size: "sm" }] }],
    ["split", { heading: "Who we work best with", eyebrow: "Fit", reverse: true, body: "**We are a good fit if you:**\n\n- want a website that brings in enquiries, not just a nicer design\n- are happy to give honest feedback and decide quickly\n- want one team across web, SEO, marketing, video and automation\n- care about clear reports and long-term results\n\n**We may not be the right fit if you:**\n\n- need the cheapest possible site with no strategy\n- want guaranteed rankings or overnight results\n- expect us to work without access to your accounts and information" }],
    ["features", { heading: "How we communicate", eyebrow: "Working together", items: [
      { title: "One point of contact", text: "A single person who knows your project and answers your questions." },
      { title: "Short written updates", text: "Clear progress notes, so you never have to chase us." },
      { title: "A shared project board", text: "See what is done, what is next and what we need from you." },
      { title: "A monthly review call", text: "For ongoing services, we review results and plan the next month." },
      { title: "Plain-English reports", text: "What we did, what changed and what we recommend next." },
      { title: "Replies within one business day", text: "Always a real answer, never an auto-reply." }] }],
    ["steps", { heading: "What working with us looks like", eyebrow: "Process", items: [{ title: "A free call", text: "We listen first, then tell you honestly what we would do." }, { title: "A clear proposal", text: "Scope, timeline and price in writing." }, { title: "Regular updates", text: "Short, written progress notes, and a call when you need one." }, { title: "A proper handover", text: "Training and documentation so you are never stuck." }] }],
    ["marquee", { heading: "Tools and platforms we use", items: TOOLS }],
    ["team", { heading: "The team", eyebrow: "People" }],
    ["faq", { heading: "About working with us", eyebrow: "FAQ", source: "manual", items: [{ q: "Do you work with small businesses?", a: "Yes. Most of our clients are small and mid-sized businesses, and we scope work to match your budget." }, { q: "Will I work with senior people?", a: "Yes. Senior people lead every project, and you always know who is responsible for your account." }, { q: "Do you outsource the work?", a: "We use specialist tools and partners where it helps, but your project is led and quality-checked by our core team." }] }],
    cta("Want to work together?", "Tell us about your project. We reply within one business day."),
  ] },
  { slug: "pricing", title: "Pricing", schema: "WebPage", seo: { metaTitle: "Pricing: websites, SEO, marketing, video and AI automation", metaDescription: "Clear packages for web development, SEO, digital marketing, video editing and AI automation. Custom quotes available." }, blocks: [
    hero("Clear packages for common projects", "Fixed prices for the work most businesses need. Custom quotes for everything else."),
    ["pricing", { heading: "Packages", eyebrow: "Pricing" }],
    WAYS,
    INCLUDED,
    ["features", { heading: "What affects the price", eyebrow: "Scope", intro: "Packages are starting points. Your quote depends on these.", items: [{ title: "Platform", text: "A template-based site costs less than a custom build." }, { title: "Number of pages and features", text: "Booking, payments, memberships and integrations add work." }, { title: "Content", text: "Who writes the copy and prepares photos and video." }, { title: "Ongoing support", text: "Hosting, updates and care plans are separate from the build." }] }],
    ["faq", { heading: "Pricing questions", eyebrow: "FAQ", source: "collection", group: "Pricing" }],
    cta("Need something custom?", "Book a call and we will send a fixed quote."),
  ] },
  { slug: "work", title: "Work", schema: "CollectionPage", seo: { metaTitle: "Our work", metaDescription: "Recent websites, campaigns and automations." }, blocks: [
    hero("Our work", "Recent websites, campaigns and automations."),
    ["cards", { heading: "What we build", eyebrow: "Capabilities", items: [
      { icon: "◆", title: "Business and portfolio sites", text: "Clear, fast sites that explain what you do and make contact easy.", href: "/services/web-development" },
      { icon: "⌂", title: "Service and local-business sites", text: "Built around the searches your local customers make.", href: "/local-seo" },
      { icon: "◎", title: "Location landing page sets", text: "Pages for each service, industry and area you cover.", href: "/areas-we-serve" },
      { icon: "▣", title: "Online stores", text: "Shopify and WooCommerce stores ready to sell.", href: "/shopify-development" },
      { icon: "⬡", title: "Web apps and portals", text: "Custom tools built with Next.js and Laravel.", href: "/laravel-development" },
      { icon: "▶", title: "Video content", text: "Short-form, YouTube and promo edits.", href: "/services/video-editing" },
      { icon: "⟳", title: "Automations and chatbots", text: "Workflows that capture and follow up leads.", href: "/services/ai-automation" },
      { icon: "✦", title: "Campaigns", text: "Google Ads and Meta Ads built around enquiries.", href: "/google-ads-management" }] }],
    ["marquee", { heading: "Platforms and tools", items: TOOLS }],
    ["work", { filters: true }],
    cta("Want results like these?", "Tell us about your project and we will reply within one business day."),
  ] },
  { slug: "case-studies", title: "Case studies", schema: "CollectionPage", seo: { metaTitle: "Case studies", metaDescription: "The problem, what we did and what changed." }, blocks: [hero("Case studies", "The problem, what we did and what changed."), ["features", { heading: "What every case study covers", eyebrow: "Format", items: [{ title: "The starting point", text: "Where the business was and what was not working." }, { title: "What we changed", text: "The platform, pages, campaigns or workflows we built." }, { title: "How we measured it", text: "The numbers we tracked, from real accounts." }, { title: "What we learned", text: "What worked, what did not and what came next." }] }], ["casestudies", {}], cta("Want a story like this?", "Let us talk about your goals.")] },
  { slug: "blog", title: "Blog", schema: "CollectionPage", seo: { metaTitle: "Blog: web development, SEO, marketing and automation guides", metaDescription: "Practical guides on websites, SEO, marketing, video and AI automation." }, blocks: [hero("The blog", "Practical guides on websites, SEO, marketing, video and automation."), ["blog", { filters: true }]] },
  { slug: "faq", title: "FAQ", schema: "FAQPage", seo: { metaTitle: "Frequently asked questions", metaDescription: "Answers about pricing, platforms, SEO, marketing, video editing and AI automation." }, blocks: [hero("Frequently asked questions", "Straight answers about how we work."), ["faq", { source: "collection", searchable: true }], cta("Still have a question?", "Ask us. We reply within one business day.")] },
  { slug: "help", title: "Help center", schema: "CollectionPage", seo: { metaTitle: "Help center", metaDescription: "Guides and answers for clients." }, blocks: [hero("Help center", "Guides and answers for our clients."), ["cards", { heading: "Quick links", items: [{ icon: "$", title: "Pricing", text: "Packages and what affects the price.", href: "/pricing" }, { icon: "◆", title: "Services", text: "Everything we offer.", href: "/services" }, { icon: "✦", title: "Blog", text: "Guides on websites, SEO and automation.", href: "/blog" }, { icon: "@", title: "Contact", text: "Talk to a real person.", href: "/contact" }] }], ["faq", { source: "collection", searchable: true, group: "__help" }]] },
  { slug: "contact", title: "Contact", schema: "ContactPage", seo: { metaTitle: "Contact us: book a free consultation", metaDescription: "Tell us about your project. We reply within one business day." }, blocks: [
    hero("Let us talk about your project", "Tell us what you need and we will reply within one business day."),
    ["contact", { heading: "Send us a message", details: true }],
    ["steps", { heading: "What happens after you get in touch", eyebrow: "Next steps", items: [{ title: "We read and reply", text: "A real person answers within one business day." }, { title: "A free discovery call", text: "A short call to understand your goals. No pressure and no jargon." }, { title: "A written proposal", text: "Scope, timeline and price, so you know exactly what you get." }, { title: "Kick-off", text: "We start once you approve the proposal." }] }],
    ["features", { heading: "Helpful to include in your message", eyebrow: "Tips", items: [{ title: "Your website address", text: "If you already have a site, we will review it before the call." }, { title: "What you want to achieve", text: "More enquiries, online sales, better rankings or time saved." }, { title: "Your timeline", text: "Any launch date or deadline we should know about." }, { title: "A rough budget range", text: "It helps us recommend the right option." }, { title: "Examples you like", text: "Sites, videos or campaigns you admire." }] }],
    ["faq", { heading: "Before you reach out", eyebrow: "FAQ", source: "manual", items: [{ q: "Is the consultation really free?", a: "Yes. The first call is free and comes with an honest recommendation, even if the answer is that you do not need us." }, { q: "Do I need an existing website?", a: "No. We work with new businesses and existing sites." }, { q: "Which time zones do you work in?", a: "We work remotely with clients across time zones and agree call times that suit you." }, { q: "Can I message you on WhatsApp?", a: "Yes, if a WhatsApp number is listed on this page. Otherwise use the form or email." }] }],
  ] },
  { slug: "areas-we-serve", title: "Areas we serve", schema: "CollectionPage", seo: { metaTitle: "Areas and industries we serve", metaDescription: "Web development, SEO and marketing for local businesses and industries." }, blocks: [
    hero("Areas and industries we serve", "We work remotely with businesses across time zones. Find the page for your industry and area."),
    ["locations", { heading: "Find your page", eyebrow: "Locations", filters: true }],
    cta("Do not see your area?", "We work with businesses everywhere. Tell us where you are."),
  ] },
  { slug: "privacy", title: "Privacy policy", schema: "WebPage", seo: { metaTitle: "Privacy policy" }, blocks: [["richtext", { heading: "Privacy policy", body: "This is a plain-language starting point. Please have it reviewed for your jurisdiction before relying on it.\n\n## What we collect\n\nWhen you contact us, we collect the details you give us, such as your name, email address, phone number, company and message. We also collect basic usage data through analytics, such as pages visited and device type.\n\n## How we use it\n\nWe use your details to reply to you, provide services, send invoices and improve our website. We do not sell your personal data.\n\n## Cookies and analytics\n\nWe use cookies and similar tools for analytics and to remember preferences such as light or dark mode. You can control cookies in your browser settings.\n\n## Sharing\n\nWe share data only with tools and providers we need to run our business, such as hosting, email and analytics, and when the law requires it.\n\n## Retention\n\nWe keep enquiry details for as long as needed to respond and to meet legal and accounting requirements.\n\n## Your rights\n\nYou can ask to see, correct or delete the personal data we hold about you by contacting us.\n\n## Contact\n\nFor privacy questions, use the contact page." }]] },
  { slug: "terms", title: "Terms of service", schema: "WebPage", seo: { metaTitle: "Terms of service" }, blocks: [["richtext", { heading: "Terms of service", body: "This is a plain-language starting point. Please have it reviewed for your jurisdiction before relying on it.\n\n## Services\n\nWe provide the services described in each written proposal. Anything outside the agreed scope is quoted separately.\n\n## Payment\n\nPayment terms are set out in the proposal. Projects are usually paid in stages. Monthly services are billed monthly. Third-party costs such as hosting, domains, licences and ad spend are paid by you unless stated otherwise.\n\n## Your content and accounts\n\nYou own your content, domain and accounts. You confirm you have the right to use any material you give us.\n\n## Ownership of work\n\nOn full payment, you own the final deliverables we create for you. We keep the right to reuse general know-how, and tools and templates we owned before the project.\n\n## Revisions and approvals\n\nEach package states its revision rounds. Feedback should be consolidated so work can move forward on schedule.\n\n## Results\n\nWe work carefully and report honestly, but we cannot guarantee specific search rankings, traffic or sales, because these depend on factors outside our control.\n\n## Cancellation\n\nMonthly services can be cancelled with the notice stated in the proposal. Work completed up to cancellation remains payable.\n\n## Liability\n\nOur liability is limited to the fees you paid for the relevant service, to the extent the law allows.\n\n## Contact\n\nFor questions about these terms, use the contact page." }]] },
];

/* ---------------- platform pages ---------------- */
interface Plat { slug: string; name: string; h1: string; tagline: string; strengths: [string, string][]; best: string[]; notBest: string[]; faq: [string, string][]; metaDesc: string }
const PLATFORMS: Plat[] = [
  { slug: "nextjs-development", name: "Next.js", h1: "Next.js development for businesses that need speed and control", tagline: "Fast, flexible websites and web apps built with React and Next.js, with SEO built in.", strengths: [["Excellent performance", "Pages are rendered on the server or ahead of time, so they load quickly and score well on speed checks."], ["Full design freedom", "Nothing is limited by a theme or a page builder."], ["SEO-friendly by default", "Clean HTML, fast pages, metadata control and structured data."], ["Scales with you", "Add features, integrations and dashboards without replatforming."], ["Your choice of content editor", "Pair it with a headless CMS or an admin panel so your team can edit content."]], best: ["Businesses that need custom features or integrations", "Sites where speed and polish are a competitive advantage", "Web apps, portals and dashboards", "Teams that want a modern, maintainable code base"], notBest: ["Very small budgets where a template would do", "Teams that want to manage everything with a drag-and-drop builder"], faq: [["Can my team edit a Next.js site?", "Yes. We connect it to a content management system or build an admin panel so non-developers can edit pages, posts and settings."], ["Is Next.js good for SEO?", "Yes, when it is built properly. Server rendering, fast loading, clean structure and metadata control all help."]], metaDesc: "Custom Next.js websites and web apps with fast performance, SEO built in and an easy editing experience." },
  { slug: "laravel-development", name: "Laravel", h1: "Laravel development for custom business applications", tagline: "Robust back-ends, portals, booking systems and dashboards built with Laravel.", strengths: [["Built for business logic", "Users, roles, payments, bookings and workflows are handled cleanly."], ["Secure by design", "Authentication, validation and protection against common attacks come built in."], ["Great for portals and dashboards", "Client areas, admin panels, reports and internal tools."], ["Easy integrations", "Connect payment gateways, CRMs, email, SMS and other APIs."], ["Maintainable code", "A clear structure that other developers can pick up later."]], best: ["Custom web applications and client portals", "Booking, membership and marketplace platforms", "Internal tools and admin dashboards", "Projects that need complex data and rules"], notBest: ["Simple brochure sites", "Projects that need to launch in days with a template"], faq: [["When should I choose Laravel over WordPress?", "Choose Laravel when you need custom logic, user accounts, complex data or integrations that go beyond what plugins handle well."], ["Can you add a Laravel back-end to an existing site?", "Yes. We can add an API or admin area and connect it to your current front-end."]], metaDesc: "Laravel development for custom web applications, portals, booking systems and dashboards." },
  { slug: "wordpress-development", name: "WordPress", h1: "WordPress development for fast, flexible business sites", tagline: "Custom WordPress and WooCommerce sites that are easy to edit, fast to load and ready for SEO.", strengths: [["Easy for your team to edit", "A familiar editor for pages, posts and media."], ["Flexible and extendable", "Thousands of plugins, and custom code when plugins are not enough."], ["Strong for content and SEO", "Great for blogs, service pages and location pages."], ["WooCommerce for stores", "Sell products, subscriptions and bookings."], ["Huge talent pool", "You are never locked into one developer or agency."]], best: ["Service businesses and local businesses", "Content-heavy sites and blogs", "Stores that want full control through WooCommerce", "Teams that update the site often"], notBest: ["Teams that do not want to handle updates and security", "Projects that need a very custom app experience"], faq: [["Is WordPress secure?", "It can be very secure when kept updated, with a good host, limited plugins and regular backups. Our care plans handle this."], ["Will you build a custom theme or use a template?", "Either. Templates are faster and cheaper, custom themes give you more control and speed. We recommend one based on your goals."]], metaDesc: "WordPress and WooCommerce development: custom, fast, SEO-ready sites that are easy for your team to edit." },
  { slug: "shopify-development", name: "Shopify", h1: "Shopify development for stores that sell", tagline: "Shopify stores with great product pages, a smooth checkout and the setup to grow.", strengths: [["Reliable checkout", "Payments, taxes, shipping and security are handled for you."], ["Easy product management", "Add products, variants and collections without code."], ["A large app ecosystem", "Reviews, subscriptions, email and more."], ["Built for scale", "Handles traffic spikes and growing catalogues."], ["Works across channels", "Sell online, in person and on marketplaces."]], best: ["Businesses that sell physical or digital products", "Brands that want to focus on selling, not hosting", "Stores that want a proven checkout", "Teams that manage inventory and orders daily"], notBest: ["Sites with very little to sell", "Highly custom checkout or pricing logic"], faq: [["Can you migrate my store to Shopify?", "Yes. We move products, customers and content, and set up redirects so your existing search traffic is protected."], ["Do you customise Shopify themes?", "Yes. We customise themes and build custom sections so the store matches your brand and sells well."]], metaDesc: "Shopify store design and development: product pages, checkout, migrations and growth setup." },
  { slug: "squarespace-design", name: "Squarespace", h1: "Squarespace design for polished, easy-to-manage sites", tagline: "Beautiful Squarespace sites for small businesses, studios and creators, set up so you can manage them yourself.", strengths: [["Clean, modern templates", "Elegant layouts that look professional out of the box."], ["All-in-one platform", "Hosting, security and updates are included."], ["Easy to manage", "A simple editor with a short learning curve."], ["Good built-in tools", "Forms, scheduling, email campaigns and basic commerce."], ["Fast to launch", "Great when you need a professional site quickly."]], best: ["Small businesses and solo professionals", "Portfolios, studios and creators", "Brochure sites that change occasionally", "Teams that want low upkeep"], notBest: ["Complex custom features", "Large stores with advanced needs"], faq: [["Can Squarespace rank well on Google?", "Yes. With good structure, content and page speed, Squarespace sites can rank well. We set up titles, descriptions and structure properly."], ["Can you customise beyond the templates?", "Within limits. We can add custom code and layouts, and we will tell you if you are better off on another platform."]], metaDesc: "Squarespace design and setup for small businesses, studios and creators." },
  { slug: "wix-design", name: "Wix", h1: "Wix design for fast, flexible business sites", tagline: "Professional Wix sites with a friendly editor, built-in tools and a fast launch.", strengths: [["Quick to build", "A short path from idea to a live site."], ["Friendly editor", "Easy for your team to update."], ["Built-in business tools", "Bookings, forms, payments and email marketing."], ["Wix Studio for flexibility", "More design control for agencies and advanced builds."], ["Low upkeep", "Hosting and security are handled for you."]], best: ["Small businesses and local services", "Sites with bookings and simple stores", "Teams that want to manage content themselves", "Quick launches with a modest budget"], notBest: ["Highly custom applications", "Sites that need unusual integrations"], faq: [["Is Wix good for SEO?", "Yes, when set up properly. We handle titles, descriptions, structure, speed and indexing."], ["Can I move from Wix to another platform later?", "Yes, but it is a rebuild. We plan redirects to protect your search rankings if you ever move."]], metaDesc: "Wix and Wix Studio design: fast, flexible sites for small businesses." },
];

export const PLATFORM_PAGES: PageSeed[] = PLATFORMS.map((p) => ({
  slug: p.slug, title: `${p.name} ${p.slug.endsWith("design") ? "design" : "development"}`, schema: "Service",
  seo: { metaTitle: `${p.name} ${p.slug.endsWith("design") ? "design" : "development"} services`, metaDescription: p.metaDesc, focusKeyword: `${p.name.toLowerCase()} ${p.slug.endsWith("design") ? "design" : "development"}`, breadcrumbTitle: p.name },
  blocks: [
    hero(p.h1, p.tagline, { primaryLabel: CTA_LABEL, primaryHref: "/contact", secondaryLabel: "See pricing", secondaryHref: "/pricing", badges: [p.name, "SEO ready", "Fast"] }),
    ["bento", { heading: `Why choose ${p.name}`, eyebrow: "Strengths", items: p.strengths.map(([title, text], i) => ({ icon: String(i + 1).padStart(2, "0"), title, text, size: i < 2 ? "md" : "sm" })) }],
    ["split", { heading: `Is ${p.name} right for you?`, eyebrow: "Fit", body: `**${p.name} is a great fit for:**\n\n${p.best.map((x) => `- ${x}`).join("\n")}\n\n**Think twice if you need:**\n\n${p.notBest.map((x) => `- ${x}`).join("\n")}\n\nNot sure? We will tell you honestly, even if the answer is a different platform.` }],
    ["steps", { heading: `How we build on ${p.name}`, eyebrow: "Process", items: [{ title: "Plan the structure", text: "Sitemap, page layouts and content outline, tied to what your customers search for." }, { title: "Design the pages", text: "A clean, responsive design that makes the next step obvious." }, { title: `Build on ${p.name}`, text: "Fast pages, forms, tracking and technical SEO foundations." }, { title: "Launch and support", text: "Testing, redirects, training and optional ongoing care." }] }],
    ["features", { heading: `What we set up on every ${p.name} site`, eyebrow: "Included", items: INCLUDED_ITEMS.slice(0, 6) }],
    ["pricing", { heading: "Packages", eyebrow: "Pricing", teaser: true }],
    ["faq", { heading: `${p.name} questions`, eyebrow: "FAQ", source: "manual", items: p.faq.map(([q, a]) => ({ q, a })) }],
    cta(`Ready to build on ${p.name}?`, "Tell us about your project. We reply within one business day."),
  ],
}));

/* ---------------- service topic pages ---------------- */
interface Topic { slug: string; name: string; h1: string; tagline: string; parent: string; items: [string, string][]; steps: [string, string][]; faq: [string, string][]; metaDesc: string }
const TOPICS: Topic[] = [
  { slug: "local-seo", name: "Local SEO", h1: "Local SEO for businesses that serve a specific area", tagline: "Show up in Google Maps and local results when customers search for what you do, near where they are.", parent: "/services/seo", items: [["Google Business Profile", "Complete, accurate and actively managed so you appear in the map pack."], ["Local pages", "Service and area pages written for real searches, not copied with the city name swapped."], ["Reviews and reputation", "A simple system for asking for reviews and replying to them."], ["Listings and citations", "Consistent business details across the directories that matter."]], steps: [["Local audit", "Profile, listings, site and competitors."], ["Fix the foundations", "Profile, listings and site structure."], ["Publish local pages", "Content for each service and area."], ["Build trust", "Reviews, links and local mentions."]], faq: [["How is local SEO different from regular SEO?", "Local SEO targets searches with a place attached, such as a service in a city, and focuses on the Maps results, your Business Profile and local pages."], ["Do I need a physical address?", "Not always. Service-area businesses can rank for the areas they serve. We will explain the rules for your case."]], metaDesc: "Local SEO services: Google Business Profile, local pages, reviews and citations for businesses that serve a specific area." },
  { slug: "technical-seo", name: "Technical SEO", h1: "Technical SEO audits and fixes", tagline: "Find and fix the speed, crawling, indexing and structure issues that hold your site back.", parent: "/services/seo", items: [["Crawl and index review", "Make sure search engines can find and understand the right pages."], ["Speed and Core Web Vitals", "Fix what slows pages down on real devices."], ["Structured data", "Schema markup for businesses, services, articles and FAQs."], ["Site architecture", "Clean URLs, internal links and redirects."]], steps: [["Crawl", "A full technical crawl of the site."], ["Prioritise", "A ranked list of issues by impact."], ["Fix", "We implement the fixes or hand a clear list to your developer."], ["Monitor", "Check results in Search Console."]], faq: [["Do you fix the issues or only report them?", "Both options are available. We can implement fixes ourselves or give a clear, prioritised list to your developer."], ["How often should I run a technical audit?", "Once a year for stable sites, and after any redesign, migration or big change."]], metaDesc: "Technical SEO audits: crawling, indexing, speed, schema and site structure fixes." },
  { slug: "google-ads-management", name: "Google Ads management", h1: "Google Ads management that focuses on enquiries", tagline: "Search campaigns, landing pages and tracking built around leads and sales, not clicks.", parent: "/services/digital-marketing", items: [["Account and campaign setup", "Clear structure, tight targeting and negative keywords."], ["Conversion tracking", "Calls, forms and sales tracked correctly."], ["Landing pages", "Pages built to turn clicks into enquiries."], ["Ongoing optimisation", "Weekly testing and budget control."]], steps: [["Goals and tracking", "Define what counts as a result."], ["Build campaigns", "Keywords, ads and landing pages."], ["Launch", "Go live with a controlled budget."], ["Optimise", "Cut waste and scale winners."]], faq: [["What is the minimum ad budget?", "It depends on your market. We will recommend a test budget on the first call and scale only when the numbers justify it."], ["Do I keep control of my ad account?", "Yes. The account is yours and we are added as managers."]], metaDesc: "Google Ads management with conversion tracking, landing pages and clear reporting." },
  { slug: "youtube-video-editing", name: "YouTube video editing", h1: "YouTube video editing that keeps viewers watching", tagline: "Hooks, pacing, captions and clean sound for creators and brands.", parent: "/services/video-editing", items: [["Retention-focused editing", "Strong openings and tight pacing."], ["Captions and graphics", "Readable captions and simple motion titles."], ["Audio cleanup", "Clear voice and balanced music."], ["Thumbnail briefs", "Direction for a thumbnail that matches the video."]], steps: [["Brief", "Goals, style and references."], ["First cut", "A full edit to review."], ["Revisions", "Refine from your notes."], ["Final export", "Ready to upload."]], faq: [["Can you edit my videos every week?", "Yes. Our monthly plan covers a set number of videos with a steady turnaround."], ["Do you edit podcasts and interviews?", "Yes, including multi-camera cuts, cleanup and highlight clips."]], metaDesc: "YouTube video editing for creators and brands: pacing, captions, audio cleanup and fast turnaround." },
  { slug: "short-form-video-editing", name: "Short-form video editing", h1: "Short-form video editing for Reels, TikTok and Shorts", tagline: "Vertical videos with strong hooks, captions and clean audio, ready to post.", parent: "/services/video-editing", items: [["Hooks that stop the scroll", "The first seconds are edited to earn the next ten."], ["Captions that match your brand", "Styled, accurate and easy to read."], ["Repurposing", "Turn long videos into many clips."], ["Batch delivery", "Packs of videos on a steady schedule."]], steps: [["Send footage", "Raw files and a short brief."], ["Edit", "Cuts, captions, music and sound."], ["Review", "Quick notes in one round."], ["Deliver", "Exports for every platform."]], faq: [["How many videos can I get at once?", "Our short-form pack covers eight videos, and we can scale up for larger batches."], ["Do you add music and captions?", "Yes. We add captions and licensed or royalty-free music where needed."]], metaDesc: "Short-form video editing for Instagram Reels, TikTok and YouTube Shorts with captions and quick delivery." },
  { slug: "ai-chatbot-development", name: "AI chatbot development", h1: "AI chatbots trained on your own content", tagline: "A website assistant that answers customer questions, captures leads and hands over to your team.", parent: "/services/ai-automation", items: [["Trained on your content", "Answers come from your services, pricing and FAQs."], ["Lead capture", "Collect names and emails and send them to your CRM."], ["Human handover", "Pass complex questions to your team."], ["Your tone and branding", "A chatbot that sounds like you."]], steps: [["Collect content", "Gather the pages and answers it should know."], ["Build and brand", "Set up the assistant and its rules."], ["Test", "Check answers and edge cases."], ["Launch and monitor", "Review conversations and improve."]], faq: [["Will the chatbot make things up?", "We configure it to answer only from your content and to hand over when it is unsure."], ["Which channels can it work on?", "Your website first, and later channels such as WhatsApp or email where it makes sense."]], metaDesc: "AI chatbot development: assistants trained on your content that answer questions and capture leads." },
  { slug: "workflow-automation", name: "Workflow automation", h1: "Workflow automation with n8n, Make and Zapier", tagline: "Connect your forms, CRM, email and spreadsheets so repetitive work runs on its own.", parent: "/services/ai-automation", items: [["Lead to CRM", "Capture, tag, assign and follow up automatically."], ["Follow-up sequences", "Timely emails and messages that stop leads going cold."], ["Reports", "One weekly summary of the numbers that matter."], ["AI steps", "Sort, summarise and draft with a human approval step."]], steps: [["Map", "List the repetitive tasks and their rules."], ["Build", "Create the workflow and handle edge cases."], ["Test", "Run it with real examples."], ["Monitor", "Alerts, logs and fixes."]], faq: [["Which tool is best: n8n, Make or Zapier?", "It depends on your budget, volume and the apps you use. We recommend the simplest tool that does the job."], ["What happens if a workflow fails?", "We add alerts and logging, so we know quickly and can fix it before it affects customers."]], metaDesc: "Workflow automation with n8n, Make and Zapier: lead capture, CRM updates, follow-up and reporting." },
];

export const TOPIC_PAGES: PageSeed[] = TOPICS.map((t) => ({
  slug: t.slug, title: t.name, schema: "Service",
  seo: { metaTitle: t.name, metaDescription: t.metaDesc, focusKeyword: t.name.toLowerCase(), breadcrumbTitle: t.name },
  blocks: [
    hero(t.h1, t.tagline, { primaryLabel: CTA_LABEL, primaryHref: "/contact", secondaryLabel: "See the full service", secondaryHref: t.parent }),
    ["features", { heading: "What is included", eyebrow: "Scope", items: t.items.map(([title, text]) => ({ title, text })) }],
    ["steps", { heading: "How it works", eyebrow: "Process", items: t.steps.map(([title, text]) => ({ title, text })) }],
    ["pricing", { heading: "Packages", eyebrow: "Pricing", teaser: true }],
    ["faq", { heading: `${t.name} questions`, eyebrow: "FAQ", source: "manual", items: t.faq.map(([q, a]) => ({ q, a })) }],
    cta(`Ready to start with ${t.name.toLowerCase()}?`, "Tell us what you need. We reply within one business day."),
  ],
}));

/* ---------------- location templates (edited in Pages, copied by Location pages) ---------------- */
const localBlocks = PAGE_TEMPLATES.find((t) => t.id === "local")!.blocks;
export const LOCATION_TEMPLATES: PageSeed[] = [
  { slug: "template-service-industry-location", title: "TEMPLATE: service for an industry in a location", schema: "Service", template: true, status: "draft", seo: { noindex: true, excludeFromSitemap: true }, blocks: localBlocks },
  { slug: "template-service-location", title: "TEMPLATE: service in a location", schema: "Service", template: true, status: "draft", seo: { noindex: true, excludeFromSitemap: true }, blocks: [
    hero("{{service}} in {{location}}", "We help businesses in {{city}} get a fast, search-ready website and the marketing to go with it.", { primaryLabel: "Get a free quote", primaryHref: "/contact", badges: ["{{service}}", "{{location}}"] }),
    ["features", { heading: "What you get", eyebrow: "{{service}}", items: [{ title: "Built for local search", text: "Pages and content aimed at what people in {{city}} search for." }, { title: "A clear path to enquiries", text: "Click-to-call, short forms and booking links on every page." }, { title: "Fast on every device", text: "Mobile-first builds that load quickly." }] }],
    ["steps", { heading: "How we work with businesses in {{city}}", eyebrow: "Process", items: [{ title: "Free consultation", text: "We learn your services, your area and your competitors." }, { title: "Plan", text: "Pages, message and timeline agreed in writing." }, { title: "Build", text: "Design, copy and development with your feedback." }, { title: "Launch and grow", text: "We go live, then help you rank and get enquiries." }] }],
    ["pricing", { heading: "Pricing", teaser: true }],
    ["faq", { heading: "Questions from {{city}} businesses", source: "manual", items: [{ q: "Do you work with businesses in {{location}}?", a: "Yes. We work remotely with clients in {{location}} and across time zones." }, { q: "How do we get started?", a: "Book a free consultation. We reply within one business day." }] }],
    cta("Let us grow your business in {{city}}", "Tell us about your project and we will reply within one business day."),
  ] },
];

export const SAMPLE_LOCATIONS: { template: "template-service-industry-location" | "template-service-location"; service: string; industry?: string; location: string; facts?: string }[] = [
  { template: "template-service-industry-location", service: "Website design", industry: "plumber", location: "Houston, TX" },
  { template: "template-service-industry-location", service: "Local SEO", industry: "dental clinic", location: "New Jersey" },
  { template: "template-service-location", service: "Web development", location: "Austin, TX" },
];

/* ---------------- sample modules ---------------- */
export const MODULES = [
  { slug: "callout-banner", title: "Callout banner", description: "A bold banner with a label, heading, text and one button.",
    fields: [{ name: "eyebrow", label: "Small label", type: "text" }, { name: "heading", label: "Heading", type: "text" }, { name: "text", label: "Text", type: "textarea" }, { name: "buttonLabel", label: "Button label", type: "text" }, { name: "buttonUrl", label: "Button link", type: "url" }],
    html: '<div class="cb"><p class="cb-eyebrow">{{eyebrow}}</p><h2>{{heading}}</h2>{{#if text}}<p class="cb-text">{{text}}</p>{{/if}}{{#if buttonLabel}}<a class="cb-btn" href="{{buttonUrl}}">{{buttonLabel}} <span aria-hidden="true">→</span></a>{{/if}}</div>',
    css: '.cb{padding:clamp(2rem,6vw,5rem);border:1px solid rgb(var(--c-line));border-radius:var(--r-xl);background:radial-gradient(70% 120% at 0% 0%,rgb(var(--c-accent)/.2),transparent 60%),radial-gradient(60% 100% at 100% 100%,rgb(var(--c-accent2)/.14),transparent 60%),rgb(var(--c-surface))}.cb-eyebrow{font-family:var(--font-mono);font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:rgb(var(--c-accent))}.cb h2{font-size:clamp(2rem,5vw,4rem);margin:.6rem 0 1rem;max-width:20ch}.cb-text{color:rgb(var(--c-fg2));max-width:56ch;font-size:1.15rem}.cb-btn{display:inline-block;margin-top:1.75rem;padding:.9rem 1.6rem;border-radius:var(--r-btn);background:rgb(var(--c-accent));color:rgb(var(--c-onaccent));font-weight:600;text-decoration:none}' },
  { slug: "icon-list", title: "Icon list", description: "A heading with a grid of short items, each with a symbol, title and text.",
    fields: [{ name: "heading", label: "Heading", type: "text" }, { name: "items", label: "Items", type: "list", subfields: "icon, title, text" }],
    html: '<div class="il"><h2>{{heading}}</h2><div class="il-grid">{{#each items}}<div class="il-item"><span class="il-icon">{{icon}}</span><h3>{{title}}</h3><p>{{text}}</p></div>{{/each}}</div></div>',
    css: '.il h2{font-size:clamp(2rem,4.5vw,3.6rem);margin-bottom:2.5rem;max-width:20ch}.il-grid{display:grid;gap:1rem;grid-template-columns:1fr}@media(min-width:760px){.il-grid{grid-template-columns:repeat(3,1fr)}}.il-item{padding:1.75rem;border:1px solid rgb(var(--c-line));border-radius:var(--r-lg);background:rgb(var(--c-surface)/.6)}.il-icon{display:grid;place-items:center;width:2.75rem;height:2.75rem;border-radius:999px;border:1px solid rgb(var(--c-line));color:rgb(var(--c-accent));font-family:var(--font-mono)}.il-item h3{font-size:1.35rem;margin:1.5rem 0 .5rem}.il-item p{color:rgb(var(--c-fg2))}' },
];

export const FORM = {
  title: "Contact", slug: "contact",
  data: { fields: [
    { name: "name", label: "Your name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone or WhatsApp", type: "tel" }, { name: "website", label: "Website (if you have one)", type: "text" },
    { name: "service", label: "What do you need?", type: "select", options: "Web development | SEO | Digital marketing | Video editing | AI automation | Website care | Not sure yet" },
    { name: "budget", label: "Budget", type: "select", options: "Under $1,000 | $1,000 to $3,000 | $3,000 to $10,000 | $10,000+ | Not sure yet" },
    { name: "message", label: "Tell us about your project", type: "textarea", required: true }],
    successMessage: "Thanks! We got your message and will reply within one business day.", createLead: true },
};
