import { Field, opts } from "./fields";

export interface CollectionDef {
  key: string;
  label: string;
  singular: string;
  titleLabel: string;
  hasSlug: boolean;
  publicPath?: (slug: string) => string; // public URL of one item
  fields: Field[];
  tabs: Record<string, string[]>; // tab -> field names (Content/Images/Details)
  seo: boolean;
  defaultSchema?: string;
  ogLabel?: string;
  group: "Content" | "Marketing" | "Design";
  roles?: ("admin" | "editor")[];
}

const IMG_COVER = "1600 × 900 (16:9)";
const IMG_SQUARE = "800 × 800 (1:1)";

export const COLLECTIONS: CollectionDef[] = [
  {
    key: "pages", label: "Pages", singular: "Page", titleLabel: "Title", hasSlug: true, seo: true, group: "Content",
    publicPath: (s) => (s === "home" ? "/" : `/${s}`), defaultSchema: "WebPage", ogLabel: "Page",
    fields: [
      { name: "cover", label: "Social / cover image", type: "image", size: "1200 × 630 (1.91:1)" },
      { name: "blocks", label: "Sections", type: "list", fields: [] }, // rendered by the page-builder editor
    ],
    tabs: { Sections: ["blocks"], Images: ["cover"] },
  },
  {
    key: "services", label: "Services", singular: "Service", titleLabel: "Service name", hasSlug: true, seo: true, group: "Content",
    publicPath: (s) => `/services/${s}`, defaultSchema: "Service", ogLabel: "Service",
    fields: [
      { name: "icon", label: "Icon (emoji or short symbol)", type: "text", placeholder: "◆" },
      { name: "summary", label: "Short summary", type: "textarea" },
      { name: "description", label: "Long description", type: "markdown" },
      { name: "includes", label: "What's included", type: "list", fields: [{ name: "title", label: "Item", type: "text" }, { name: "text", label: "Detail", type: "textarea" }] },
      { name: "steps", label: "Process steps", type: "list", fields: [{ name: "title", label: "Step", type: "text" }, { name: "text", label: "Description", type: "textarea" }] },
      { name: "faq", label: "Service FAQ", type: "list", fields: [{ name: "q", label: "Question", type: "text" }, { name: "a", label: "Answer", type: "textarea" }] },
      { name: "relatedWork", label: "Related work", type: "relation", collection: "projects", multiple: true },
      { name: "cover", label: "Cover image", type: "image", size: IMG_COVER },
      { name: "media", label: "Feature media (image, GIF, video or Lottie)", type: "media", size: IMG_COVER },
    ],
    tabs: { Content: ["icon", "summary", "description", "includes"], Details: ["steps", "faq", "relatedWork"], Images: ["cover", "media"] },
  },
  {
    key: "packages", label: "Packages", singular: "Package", titleLabel: "Package name", hasSlug: false, seo: false, group: "Content",
    fields: [
      { name: "service", label: "Service", type: "relation", collection: "services" },
      { name: "price", label: "Price", type: "number" },
      { name: "priceMax", label: "Price range upper bound (optional)", type: "number" },
      { name: "currency", label: "Currency", type: "select", options: opts("USD", "BDT", "EUR", "GBP", "CAD", "AUD", "INR") },
      { name: "billing", label: "Billing", type: "select", options: opts("one-time|One-time", "monthly|Monthly", "yearly|Yearly") },
      { name: "delivery", label: "Delivery time", type: "text", placeholder: "2 to 3 weeks" },
      { name: "summary", label: "Who it's for", type: "textarea" },
      { name: "features", label: "Features", type: "tags", help: "Press Enter after each feature" },
      { name: "highlight", label: "Highlight as recommended", type: "toggle" },
    ],
    tabs: { Content: ["service", "summary", "features", "highlight"], Details: ["price", "priceMax", "currency", "billing", "delivery"] },
  },
  {
    key: "team", label: "Team", singular: "Team member", titleLabel: "Name", hasSlug: true, seo: false, group: "Content",
    fields: [
      { name: "role", label: "Role / title", type: "text" },
      { name: "photo", label: "Photo", type: "image", size: IMG_SQUARE },
      { name: "bio", label: "Short bio", type: "textarea" },
      { name: "longBio", label: "Long bio", type: "markdown" },
      { name: "skills", label: "Skills", type: "tags" },
      { name: "socials", label: "Social links", type: "list", fields: [{ name: "label", label: "Network", type: "text" }, { name: "url", label: "URL", type: "url" }] },
    ],
    tabs: { Content: ["role", "bio", "longBio", "skills"], Images: ["photo"], Details: ["socials"] },
  },
  {
    key: "projects", label: "Work", singular: "Project", titleLabel: "Project title", hasSlug: true, seo: true, group: "Content",
    publicPath: (s) => `/work/${s}`, defaultSchema: "CreativeWork", ogLabel: "Work",
    fields: [
      { name: "client", label: "Client", type: "text" },
      { name: "industry", label: "Industry", type: "text" },
      { name: "liveUrl", label: "Live URL", type: "url" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "body", label: "Full write-up", type: "markdown" },
      { name: "cover", label: "Cover / banner image", type: "image", size: IMG_COVER },
      { name: "screenshot", label: "Screenshot (used on cards)", type: "media", size: "1440 × 900 (16:10)" },
      { name: "gallery", label: "Gallery", type: "list", fields: [{ name: "image", label: "Image", type: "media", size: "1600 × 1000" }, { name: "caption", label: "Caption", type: "text" }] },
      { name: "services", label: "Services used", type: "relation", collection: "services", multiple: true },
      { name: "technologies", label: "Technologies", type: "tags" },
      { name: "platform", label: "Platform / CMS", type: "text" },
      { name: "workStatus", label: "Work status", type: "select", options: opts("completed|Completed", "ongoing|Still building", "care|Ongoing care") },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "accent", label: "Accent colour", type: "color" },
    ],
    tabs: { Content: ["client", "summary", "body"], Images: ["cover", "screenshot", "gallery"], Details: ["industry", "liveUrl", "services", "technologies", "platform", "workStatus", "startDate", "endDate", "accent"] },
  },
  {
    key: "caseStudies", label: "Case studies", singular: "Case study", titleLabel: "Headline", hasSlug: true, seo: true, group: "Content",
    publicPath: (s) => `/case-studies/${s}`, defaultSchema: "Article", ogLabel: "Case Study",
    fields: [
      { name: "client", label: "Client", type: "text" },
      { name: "industry", label: "Industry", type: "text" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "overview", label: "Overview", type: "markdown" },
      { name: "challenges", label: "Challenges", type: "list", fields: [{ name: "title", label: "Challenge", type: "text" }, { name: "text", label: "Detail", type: "textarea" }] },
      { name: "approach", label: "Approach (steps)", type: "list", fields: [{ name: "title", label: "Step", type: "text" }, { name: "text", label: "Detail", type: "textarea" }] },
      { name: "results", label: "Results (real metrics only)", type: "list", fields: [{ name: "value", label: "Metric", type: "text", ai: false }, { name: "label", label: "Label", type: "text" }] },
      { name: "resultsText", label: "Results narrative", type: "markdown" },
      { name: "cover", label: "Cover image", type: "image", size: "1200 × 1500 (4:5)" },
      { name: "media", label: "Highlight media (image, GIF, video or Lottie)", type: "media", size: IMG_COVER },
      { name: "project", label: "Linked work entry", type: "relation", collection: "projects" },
      { name: "services", label: "Services", type: "relation", collection: "services", multiple: true },
      { name: "technologies", label: "Technologies", type: "tags" },
    ],
    tabs: { Content: ["client", "summary", "overview", "challenges", "approach", "results", "resultsText"], Images: ["cover", "media"], Details: ["industry", "project", "services", "technologies"] },
  },
  {
    key: "testimonials", label: "Testimonials", singular: "Testimonial", titleLabel: "Client name", hasSlug: false, seo: false, group: "Content",
    fields: [
      { name: "role", label: "Role", type: "text" }, { name: "company", label: "Company", type: "text" },
      { name: "quote", label: "Quote", type: "textarea", ai: false, help: "Use the client's real words only." },
      { name: "photo", label: "Photo or logo", type: "image", size: "200 × 200 (1:1)" },
      { name: "project", label: "Linked project", type: "relation", collection: "projects" },
    ],
    tabs: { Content: ["quote", "role", "company"], Images: ["photo"], Details: ["project"] },
  },
  {
    key: "posts", label: "Blog posts", singular: "Post", titleLabel: "Title", hasSlug: true, seo: true, group: "Content",
    publicPath: (s) => `/blog/${s}`, defaultSchema: "BlogPosting", ogLabel: "Article",
    fields: [
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Body", type: "markdown" },
      { name: "cover", label: "Cover image", type: "image", size: "1600 × 900 (16:9)" },
      { name: "category", label: "Category", type: "relation", collection: "categories" },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "author", label: "Authors (shown in the author box with photo and bio)", type: "relation", collection: "team", multiple: true },
      { name: "ctaTitle", label: "Sidebar call to action: title (optional)", type: "text" },
      { name: "ctaText", label: "Sidebar call to action: text (optional)", type: "textarea" },
      { name: "ctaLabel", label: "Sidebar call to action: button label (optional)", type: "text" },
      { name: "ctaHref", label: "Sidebar call to action: button link (optional)", type: "url" },
      { name: "kind", label: "Type", type: "select", options: opts("article|Article", "update|Short update") },
    ],
    tabs: { Content: ["excerpt", "body"], Images: ["cover"], Details: ["author", "category", "tags", "kind", "ctaTitle", "ctaText", "ctaLabel", "ctaHref"] },
  },
  {
    key: "categories", label: "Categories", singular: "Category", titleLabel: "Name", hasSlug: true, seo: false, group: "Content",
    fields: [
      { name: "description", label: "Description", type: "textarea" },
      { name: "color", label: "Category colour (optional)", type: "color", help: "Used for this category's badge and the colour theme of posts in it. Leave empty for an automatic colour." },
    ],
    tabs: { Content: ["description", "color"] },
  },
  {
    key: "faqs", label: "FAQ & help", singular: "Question", titleLabel: "Question", hasSlug: true, seo: false, group: "Content",
    fields: [
      { name: "answer", label: "Answer", type: "markdown" },
      { name: "category", label: "Group (service or topic)", type: "text" },
      { name: "showOnFaq", label: "Show on FAQ page", type: "toggle" },
      { name: "showInHelp", label: "Show in help center", type: "toggle" },
    ],
    tabs: { Content: ["answer", "category", "showOnFaq", "showInHelp"] },
  },
  {
    key: "forms", label: "Forms", singular: "Form", titleLabel: "Form name", hasSlug: true, seo: false, group: "Marketing",
    fields: [
      { name: "fields", label: "Fields", type: "list", fields: [
        { name: "name", label: "Key", type: "text", ai: false }, { name: "label", label: "Label", type: "text" },
        { name: "type", label: "Type", type: "select", options: opts("text", "email", "tel", "textarea", "select", "number") },
        { name: "options", label: "Options (for dropdowns: separate with | or a new line, e.g. Under $1,000 | $1,000 to $3,000)", type: "textarea", rows: 3, ai: false },
        { name: "placeholder", label: "Placeholder text", type: "text" },
        { name: "width", label: "Width", type: "select", options: opts("auto|Automatic", "half|Half width", "full|Full width") },
        { name: "required", label: "Required", type: "toggle" },
      ] },
      { name: "submitLabel", label: "Submit button text", type: "text", placeholder: "Send message" },
      { name: "style", label: "Field style for this form", type: "select", options: opts("inherit|Same as the site", "boxed|Boxed", "underline|Underline only", "filled|Filled", "rounded|Rounded pill"), help: "Lets you give a location or campaign form its own look. The site-wide default is set in Themes." },
      { name: "layout", label: "Layout", type: "select", options: opts("double|Two columns", "single|One column") },
      { name: "successMessage", label: "Success message", type: "textarea" },
      { name: "autoReplyMessage", label: "Confirmation email message (blank = the default in Site settings > Email)", type: "textarea", ai: true },
      { name: "notifyEmail", label: "Notification email (blank = site contact email)", type: "text", ai: false },
      { name: "createLead", label: "Create a lead from each submission", type: "toggle" },
    ],
    tabs: { Content: ["fields", "successMessage"], Design: ["style", "layout", "submitLabel"], Details: ["notifyEmail", "createLead", "autoReplyMessage"] },
  },
  {
    key: "popups", label: "Announcements & popups", singular: "Announcement", titleLabel: "Internal name", hasSlug: false, seo: false, group: "Marketing",
    fields: [
      { name: "kind", label: "Kind", type: "select", options: opts("bar|Announcement bar", "popup|Popup") },
      { name: "content", label: "Message", type: "textarea" },
      { name: "linkLabel", label: "Link label", type: "text" }, { name: "linkHref", label: "Link", type: "url" },
      { name: "trigger", label: "Popup trigger", type: "select", options: opts("delay|After a delay", "scroll|After scrolling halfway", "exit|On exit intent") },
      { name: "delay", label: "Delay (seconds)", type: "number" },
      { name: "paths", label: "Only on paths (comma-separated, blank = all)", type: "text", ai: false },
    ],
    tabs: { Content: ["kind", "content", "linkLabel", "linkHref"], Details: ["trigger", "delay", "paths"] },
  },
];

COLLECTIONS.push({
  key: "modules", label: "Custom modules", singular: "Module", titleLabel: "Module name", hasSlug: true, seo: false, group: "Design", roles: ["admin"],
  fields: [
    { name: "description", label: "What is this module for?", type: "textarea" },
    { name: "fields", label: "Fields editors can fill in", type: "list", fields: [
      { name: "name", label: "Key (letters and numbers, no spaces)", type: "text", ai: false },
      { name: "label", label: "Label", type: "text", ai: false },
      { name: "type", label: "Type", type: "select", options: opts("text|Short text", "textarea|Long text", "markdown|Formatted text", "url|Link", "image|Image", "number|Number", "toggle|Switch", "tags|List of words", "list|Repeating group") },
      { name: "subfields", label: "For a repeating group: item keys, comma separated", type: "text", ai: false, help: "e.g. title, text, image" },
    ] },
    { name: "html", label: "HTML template", type: "textarea", mono: true, rows: 14, ai: false, help: "{{key}} inserts text safely, {{{key}}} inserts formatted text or HTML, {{#each key}}{{title}}{{/each}} repeats a group, {{#if key}}...{{/if}} shows something only when filled." },
    { name: "css", label: "CSS", type: "textarea", mono: true, rows: 10, ai: false, help: "Automatically scoped to this module. Use theme colours: rgb(var(--c-accent)), rgb(var(--c-fg)), rgb(var(--c-surface)), rgb(var(--c-line))." },
    { name: "__preview", label: "Live preview", type: "text" },
  ],
  tabs: { Template: ["description", "html", "css"], Fields: ["fields"], Preview: ["__preview"] },
});

export const getCollection = (k: string) => COLLECTIONS.find((c) => c.key === k);
export const allFieldsOf = (c: CollectionDef) => c.fields;
