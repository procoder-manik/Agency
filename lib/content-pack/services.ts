/** Bump when the starter content changes, so the dashboard can tell you an update is available. */
export const PACK_VERSION = 2;

export const IDENTITY = {
  tagline: "Websites, SEO and AI automation that bring in customers",
  description: "We build fast websites on Next.js, Laravel, WordPress, Shopify, Squarespace and Wix, get them found on Google, run the marketing around them, edit your videos and automate the busywork.",
  longDescription: "We are a small, senior team covering web development, SEO, digital marketing, video editing and AI automation. One team means one plan: the site we build is made to rank, the marketing we run points at pages that convert, and the repetitive work behind it is automated.",
};

export const NAVIGATION = {
  header: [
    { label: "Services", href: "/services" }, { label: "Platforms", href: "/platforms" }, { label: "Work", href: "/work" },
    { label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }, { label: "About", href: "/about" },
  ],
  footer: [
    { title: "Services", links: [{ label: "Web development", href: "/services/web-development" }, { label: "SEO", href: "/services/seo" }, { label: "Digital marketing", href: "/services/digital-marketing" }, { label: "Video editing", href: "/services/video-editing" }, { label: "AI automation", href: "/services/ai-automation" }, { label: "Website care", href: "/services/website-care" }] },
    { title: "Platforms", links: [{ label: "Next.js", href: "/nextjs-development" }, { label: "Laravel", href: "/laravel-development" }, { label: "WordPress", href: "/wordpress-development" }, { label: "Shopify", href: "/shopify-development" }, { label: "Squarespace", href: "/squarespace-design" }, { label: "Wix", href: "/wix-design" }] },
    { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Work", href: "/work" }, { label: "Blog", href: "/blog" }, { label: "FAQ", href: "/faq" }, { label: "Help center", href: "/help" }, { label: "Areas we serve", href: "/areas-we-serve" }, { label: "Contact", href: "/contact" }] },
    { title: "Legal", links: [{ label: "Privacy policy", href: "/privacy" }, { label: "Terms of service", href: "/terms" }] },
  ],
};

interface Svc { slug: string; title: string; icon: string; summary: string; description: string; includes: string[]; steps: [string, string][]; faq: [string, string][] }

export const SERVICES: Svc[] = [
  {
    slug: "web-development", title: "Web development", icon: "◆",
    summary: "Business sites, service sites, local sites and online stores, built on the platform that fits your team: Next.js, Laravel, WordPress, Shopify, Squarespace or Wix.",
    description: "A website is only worth what it does for the business. We design and build sites that load fast, rank well, work on every screen and make it obvious what a visitor should do next.\n\nWe are platform-flexible on purpose. If you need full control and speed, we build on **Next.js** or **Laravel**. If your team wants to edit pages without a developer, we build on **WordPress**, **Shopify**, **Squarespace** or **Wix** and set it up properly. We tell you which one fits before you spend anything.\n\nEvery build includes technical SEO, analytics, accessibility basics and a handover session, so you are never left guessing how to use what you paid for.",
    includes: ["Custom design with a clear page structure", "Next.js and Laravel builds for speed and control", "WordPress and WooCommerce sites", "Shopify stores with products, collections and checkout", "Squarespace and Wix sites for fast, editable launches", "Business portfolio, service and local-business websites", "Technical SEO, schema and redirects from day one", "Forms, analytics and CRM connections", "Training and a written handover"],
    steps: [["Discovery call", "Goals, audience, competitors and the one action the site must drive."], ["Plan and wireframe", "Sitemap, page layouts and a content outline, agreed before any design."], ["Design and build", "Responsive pages, forms, tracking and SEO foundations."], ["Test and launch", "Speed, accessibility and device checks, redirects and go-live support."], ["Handover and care", "Training, documentation and optional monthly care."]],
    faq: [["Which platform should I choose?", "It depends on who edits the site and what it needs to do. WordPress suits content-heavy sites, Shopify suits stores, Squarespace and Wix suit simple sites you want to manage yourself, and Next.js or Laravel suit custom features and top performance. We recommend one after a short call, and we will tell you if the cheaper option is enough."], ["How long does a website take?", "A simple brochure site often takes a few weeks. Stores and custom builds take longer. After the discovery call we give you a firm timeline in writing."], ["Can I edit the site myself?", "Yes, unless you ask for a developer-only setup. We train you on the editor and leave a short written guide for your team."]],
  },
  {
    slug: "seo", title: "SEO", icon: "◎",
    summary: "Technical fixes, on-page work, local SEO and content that earn rankings and enquiries, with plain-English reports.",
    description: "SEO is how the right people find you when they are ready to buy. We start with a technical audit, fix what is holding the site back, then build the pages and content that match what your customers actually search for.\n\nWe cover traditional Google results, the local map pack and the new places buyers ask for recommendations, such as AI answers. Everything is tied to enquiries and sales, not vanity metrics.\n\nNo guarantees of rankings, because nobody can honestly promise that. What we promise is clear work, clear reports and no lock-in contracts.",
    includes: ["Technical SEO audit and a prioritised fix list", "Keyword and search-intent research", "On-page optimisation and internal linking", "Local SEO: Google Business Profile, citations and reviews", "Content plans and article writing", "Ecommerce SEO for collections and products", "Schema markup and structured data", "Ethical link building and digital PR", "Monthly reports tied to leads and revenue"],
    steps: [["Audit", "We check technical health, content, links and competitors."], ["Plan", "A prioritised roadmap, agreed with you."], ["Fix and build", "Technical fixes, page updates and new content."], ["Publish and promote", "Content goes live and earns links and mentions."], ["Report and refine", "Monthly reporting and next steps."]],
    faq: [["How long until I see results?", "Early movement can appear within weeks, but meaningful growth usually takes a few months and depends on competition and the starting point. We set expectations in the first call."], ["Do you guarantee rankings?", "No, and be careful with anyone who does. We guarantee the work we do and the transparency of our reporting."], ["Can you work on a site you did not build?", "Yes. We audit it first and tell you honestly whether to improve it or rebuild."]],
  },
  {
    slug: "digital-marketing", title: "Digital marketing", icon: "✦",
    summary: "Paid ads, email, social media and conversion work that turn traffic into customers, with tracking you can trust.",
    description: "Traffic is only useful if it turns into enquiries. We plan campaigns from the offer backwards: who you want, what they need to hear, where they are, and what the landing page must do.\n\nWe run Google Ads and Meta Ads, build email flows, manage social channels and improve landing pages. Analytics and conversion tracking are set up first, so every decision is based on real numbers.\n\nYou own every ad account and tool we set up. We work in your accounts, so you can leave any time without losing your data.",
    includes: ["Google Ads and Meta Ads management", "Landing pages and conversion rate optimisation", "Email marketing and automation flows", "Social media management and content calendars", "GA4, Tag Manager and conversion tracking setup", "Remarketing and audience building", "A/B testing of ads and pages", "Monthly performance reports"],
    steps: [["Goals and tracking", "We agree the target action and set up measurement."], ["Offer and audience", "We define who we are talking to and what we promise."], ["Launch", "Campaigns and landing pages go live."], ["Test and optimise", "We improve what works and stop what does not."], ["Report", "A clear monthly report with next steps."]],
    faq: [["Do I need a big ad budget?", "No. We start with a budget you are comfortable with, test, and scale only what is working. Ad spend is paid directly to the platform from your account."], ["Who owns the ad accounts?", "You do. We are added as managers, so you keep full access and control."], ["What results can I expect?", "It depends on your market, offer and budget. We set measurable targets in the first month and review them honestly every month."]],
  },
  {
    slug: "video-editing", title: "Video editing", icon: "▶",
    summary: "Short-form, YouTube and promo video editing with fast turnaround, captions and clean sound, ready to post.",
    description: "Good editing keeps people watching. We cut your raw footage into clear, well-paced videos with clean audio, captions and the right framing for each platform.\n\nWe edit Reels, TikToks and Shorts, YouTube videos, promo and ad videos, explainers and screen-recording tutorials. Send the footage, a short brief and a few references, and we handle the rest.\n\nWe can work in your style, or help you build a repeatable format so every video feels like part of the same brand.",
    includes: ["Reels, TikTok and YouTube Shorts editing", "YouTube long-form editing", "Promo, ad and product videos", "Explainers and screen-recording tutorials", "Captions, subtitles and translations", "Colour correction and audio cleanup", "Motion titles and lower thirds", "Cut-downs: turn one long video into many clips"],
    steps: [["Brief and references", "Goal, audience, style and examples you like."], ["Upload footage", "Share raw files through a link."], ["First cut", "A complete edit for you to review."], ["Revisions", "We refine based on your notes."], ["Final delivery", "Exports in every size you need."]],
    faq: [["What do you need from me?", "Your raw footage, a short brief, and a few videos you like for reference. Brand fonts and colours help if you have them."], ["How many revisions are included?", "Each package states its revision rounds. We keep feedback simple so you reach the final cut quickly."], ["What formats do you deliver?", "Vertical, square and widescreen exports, with captions burned in or as a separate file, depending on the platform."]],
  },
  {
    slug: "ai-automation", title: "AI automation", icon: "⟳",
    summary: "Workflows and AI assistants that capture leads, follow up, update your CRM and report, so repetitive work runs by itself.",
    description: "Most small teams lose hours every week to copy and paste: forms into spreadsheets, leads into the CRM, reminders into email. We replace that with workflows that run on their own.\n\nWe build with **n8n**, **Make**, **Zapier** and direct API integrations, and add AI steps where they help: sorting enquiries, drafting replies, summarising documents and answering common questions from your own content.\n\nWe start with one workflow that saves real time, prove it works, then expand. Anything important keeps a human approval step, so automation never speaks for you without your say.",
    includes: ["Lead capture to CRM with instant follow-up", "AI chatbots trained on your own content", "Email and WhatsApp follow-up sequences", "Appointment booking and reminders", "Document, invoice and data extraction", "Reporting dashboards and weekly summaries", "Integrations with n8n, Make, Zapier and custom APIs", "Human approval steps for anything important"],
    steps: [["Map the process", "We find the repetitive work that costs you the most time."], ["Pick the first workflow", "One clear win, with a measurable result."], ["Build and test", "We build it, test it with real cases and fix edge cases."], ["Launch with monitoring", "It runs, and we watch it for the first weeks."], ["Expand", "Add the next workflow once the first one is proven."]],
    faq: [["What should I automate first?", "The task you repeat every day that does not need judgement. Lead capture and follow-up is usually the best first workflow because it saves time and stops enquiries from going cold."], ["Is my data safe?", "We use your own accounts, limit access to what each workflow needs and avoid sending sensitive data to AI tools unless you approve it."], ["Will this replace my team?", "No. It removes the boring work so your team can spend time on customers. Important actions keep a human approval step."]],
  },
  {
    slug: "website-care", title: "Website care", icon: "✚",
    summary: "Updates, backups, uptime and speed checks, security fixes and small changes, handled every month.",
    description: "Websites need ongoing care: updates, backups, security checks and small changes. Without it, sites slow down, break or get hacked.\n\nOur care plans cover the technical upkeep so you can focus on the business, and they include a small amount of time each month for changes you request.\n\nWe work on sites we built and on sites other people built.",
    includes: ["Core, plugin and dependency updates", "Regular backups and restore tests", "Uptime and speed monitoring", "Security scans and fixes", "Small content and design changes each month", "A short monthly health report"],
    steps: [["Health check", "We review the site and fix urgent problems."], ["Set up monitoring", "Backups, uptime and security checks go live."], ["Monthly maintenance", "Updates and your requested changes."], ["Report", "A short summary of what we did."]],
    faq: [["What is covered?", "Updates, backups, monitoring, security fixes and a set amount of change requests. Each plan lists exactly what is included."], ["Can I cancel?", "Yes. Care plans run month to month with no long contract."]],
  },
];

interface Pkg { service: string; title: string; price: number; priceMax?: number; billing: "one-time" | "monthly"; delivery: string; summary: string; features: string[]; highlight?: boolean }
export const PACKAGES: Pkg[] = [
  { service: "web-development", title: "Starter site", price: 900, billing: "one-time", delivery: "2 to 3 weeks", summary: "A clean, fast site on WordPress, Wix or Squarespace for a new or small business.", features: ["Up to 5 pages", "Mobile-first design", "Contact form", "Basic on-page SEO", "Training session"] },
  { service: "web-development", title: "Business site", price: 2400, priceMax: 3500, billing: "one-time", delivery: "4 to 6 weeks", summary: "A custom-designed site for businesses that rely on the website for leads.", features: ["Up to 15 pages", "Custom design", "Blog and case study setup", "Analytics and CRM connection", "Technical SEO foundations"], highlight: true },
  { service: "web-development", title: "Online store", price: 2800, priceMax: 4500, billing: "one-time", delivery: "4 to 7 weeks", summary: "A Shopify or WooCommerce store ready to take orders.", features: ["Product and collection setup", "Payments and shipping", "Store design", "Email capture", "Training session"] },
  { service: "web-development", title: "Custom build", price: 6000, billing: "one-time", delivery: "Scoped after discovery", summary: "A Next.js or Laravel build with custom features, integrations or a web app.", features: ["Custom functionality", "API and CRM integrations", "Performance budget", "Admin panel", "Documentation"] },
  { service: "seo", title: "SEO audit", price: 450, billing: "one-time", delivery: "About 1 week", summary: "A complete technical and content audit with a prioritised fix list.", features: ["Technical crawl", "On-page review", "Competitor snapshot", "Prioritised action plan", "Walkthrough call"] },
  { service: "seo", title: "Local SEO", price: 450, billing: "monthly", delivery: "Ongoing", summary: "For businesses that serve customers in a specific area.", features: ["Google Business Profile management", "Citations and listings cleanup", "Local content", "Review requests", "Monthly report"], highlight: true },
  { service: "seo", title: "Growth SEO", price: 950, billing: "monthly", delivery: "Ongoing", summary: "Technical, content and links working together for steady growth.", features: ["Technical fixes", "Monthly content", "Link building", "Conversion improvements", "Monthly strategy call"] },
  { service: "digital-marketing", title: "Ads management", price: 500, billing: "monthly", delivery: "Ongoing", summary: "Google Ads or Meta Ads management. Ad spend is paid to the platform separately.", features: ["Campaign setup", "Conversion tracking", "Weekly optimisation", "Landing page advice", "Monthly report"], highlight: true },
  { service: "digital-marketing", title: "Social and email", price: 600, billing: "monthly", delivery: "Ongoing", summary: "Consistent social posting and email campaigns for steady engagement.", features: ["Content calendar", "Posts and captions", "Monthly email campaign", "Community replies", "Monthly report"] },
  { service: "video-editing", title: "Short-form pack", price: 240, billing: "one-time", delivery: "3 to 5 days", summary: "Eight short vertical videos edited and captioned.", features: ["8 Reels, TikToks or Shorts", "Captions", "Music and sound cleanup", "2 revision rounds", "All export sizes"] },
  { service: "video-editing", title: "YouTube monthly", price: 420, billing: "monthly", delivery: "Ongoing", summary: "A steady editing partner for your channel.", features: ["4 edited videos a month", "Hooks, pacing and captions", "Basic motion titles", "Thumbnail brief", "2 revision rounds"], highlight: true },
  { service: "video-editing", title: "Promo video", price: 300, billing: "one-time", delivery: "1 to 2 weeks", summary: "A polished promo, ad or product video.", features: ["One edited video up to 90 seconds", "Colour and audio finish", "Captions", "Motion titles", "Square and vertical cut-downs"] },
  { service: "ai-automation", title: "Automation sprint", price: 600, billing: "one-time", delivery: "About 1 week", summary: "One workflow built, tested and documented.", features: ["One workflow, up to 6 steps", "n8n, Make or Zapier", "Testing with real cases", "Short video walkthrough", "30 days of fixes"] },
  { service: "ai-automation", title: "AI chatbot", price: 900, billing: "one-time", delivery: "About 2 weeks", summary: "A website assistant trained on your own content, with lead capture.", features: ["Content ingestion", "Lead capture and handover", "Branding", "Testing", "30 days of fixes"], highlight: true },
  { service: "ai-automation", title: "Automation retainer", price: 700, billing: "monthly", delivery: "Ongoing", summary: "New workflows and improvements every month.", features: ["Monthly build time", "Monitoring and fixes", "Reporting dashboard", "Priority support", "Quarterly review"] },
  { service: "website-care", title: "Care basic", price: 49, billing: "monthly", delivery: "Ongoing", summary: "Essential upkeep for small sites.", features: ["Updates", "Backups", "Uptime monitoring", "Security scans"] },
  { service: "website-care", title: "Care plus", price: 129, billing: "monthly", delivery: "Ongoing", summary: "Upkeep plus time for changes.", features: ["Everything in Basic", "Speed checks", "Up to 2 hours of changes a month", "Monthly report"], highlight: true },
];

export const CATEGORIES: [string, string, string][] = [
  ["web-development", "Web development", "Choosing platforms, planning and launching websites."],
  ["seo", "SEO", "Search, local SEO and getting found."],
  ["marketing", "Marketing", "Ads, email and social that convert."],
  ["ai-automation", "AI automation", "Workflows and assistants that save time."],
  ["video", "Video", "Briefing and editing video content."],
];

export const FAQS: [string, string, string, boolean][] = [
  // [question, answer, group, showInHelp]
  ["What does your agency do?", "We cover web development, SEO, digital marketing, video editing and AI automation. One team handles the website, the traffic to it and the systems behind it.", "General", true],
  ["Who do you work with?", "Small and mid-sized businesses, service businesses, local businesses, online stores and creators. If you need to be found online and turn visitors into customers, we can help.", "General", false],
  ["Do you work with clients in other countries?", "Yes. We work remotely with clients across time zones, using video calls, shared documents and clear written updates.", "General", true],
  ["How do we get started?", "Book a free consultation. We learn about your business, tell you honestly what we would do, and send a written proposal with scope, timeline and price.", "General", true],
  ["How much does a website cost?", "It depends on the platform and the number of pages. Simple sites start from the Starter site package, business sites and stores cost more, and custom builds are quoted after discovery. See the pricing page for current packages.", "Pricing", true],
  ["Do you offer payment plans?", "Yes. Larger projects are split into stages, usually a deposit, a mid-project payment and a final payment on launch. Monthly services are billed monthly.", "Pricing", true],
  ["Which payment methods do you accept?", "Card, bank transfer and local payment methods. The exact options are listed on the pricing page.", "Pricing", false],
  ["Are there any hidden costs?", "No. Third-party costs such as domains, hosting, plugins, premium themes and ad spend are listed in the proposal before you commit.", "Pricing", false],
  ["Which website platform is best for my business?", "WordPress for content and flexibility, Shopify for stores, Squarespace or Wix for simple sites you edit yourself, Next.js or Laravel for custom features and speed. We recommend one on the first call.", "Web development", true],
  ["Can I edit my website myself?", "Yes. We train you and give you a short guide. If you prefer, we can handle updates through a care plan.", "Web development", true],
  ["Do you build online stores?", "Yes, mostly on Shopify and WooCommerce. We set up products, payments, shipping, taxes and the checkout experience.", "Web development", false],
  ["Can you redesign my existing website without losing my rankings?", "Yes. We map every existing URL, set up redirects, keep the content that performs and check search performance after launch.", "Web development", true],
  ["Who owns the website and domain?", "You do. We register accounts in your name or transfer them to you at handover.", "Web development", true],
  ["How long does SEO take to work?", "Early signals can appear within weeks. Real growth usually takes a few months. It depends on your competition, your site and how much we can publish.", "SEO", true],
  ["Do you guarantee first-page rankings?", "No. Nobody can honestly promise that. We guarantee transparent work, regular reporting and no lock-in contracts.", "SEO", false],
  ["What is local SEO?", "Local SEO helps you appear when people search for a service near them, in Google Maps and local results. It focuses on your Google Business Profile, local pages, reviews and consistent listings.", "SEO", true],
  ["Can you create location pages for my services?", "Yes. We build location and industry landing pages, such as a service page for plumbers in Houston, with unique content for each page and sensible internal links.", "SEO", false],
  ["Do I need a big budget for ads?", "No. We start small, test, and scale only what works. Ad spend is paid to the ad platform from your own account.", "Digital marketing", true],
  ["Which marketing channels do you recommend?", "It depends on how your customers buy. Search and local channels work well for people who already want a service. Social and email work well for awareness and repeat sales.", "Digital marketing", false],
  ["What do you need to start a video editing project?", "Your raw footage, a short brief, and a few reference videos you like. Brand fonts and colours are helpful.", "Video editing", true],
  ["How fast is your video turnaround?", "Short-form edits usually take a few days. Longer videos and promos take longer. We confirm the date when you send the footage.", "Video editing", false],
  ["What can AI automation do for a small business?", "It can capture leads, send follow-ups, update your CRM, book appointments, answer common questions and create reports automatically.", "AI automation", true],
  ["Which tools do you use for automation?", "n8n, Make and Zapier for workflows, plus direct API integrations and AI models where they help. We pick the tool that fits your budget and needs.", "AI automation", false],
  ["Is it safe to use AI with my business data?", "We use your own accounts, limit what each workflow can access and avoid sending sensitive information to AI tools unless you approve it.", "AI automation", true],
  ["Do you offer support after launch?", "Yes. Every project includes a short support window, and ongoing care plans cover updates, backups, monitoring and changes.", "Support", true],
  ["How do I contact you?", "Use the contact form, the chat on this site or the email address in the footer. We reply within one business day.", "Support", true],
];
