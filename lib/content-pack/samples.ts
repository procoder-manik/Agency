/** Example team cards and example portfolio projects, so the home page and the Work page are not empty.
 *  They are clearly labelled as examples and meant to be replaced with real ones in Admin. */
export const SAMPLE_TEAM = [
  { slug: "manik-hossain", title: "Manik Hossain", role: "Team Lead and Web Developer", bio: "Leads delivery and builds the websites and web apps. Your first point of contact on every project.", skills: ["Web development", "WordPress", "Next.js", "SEO"] },
  { slug: "seo-lead", title: "SEO Lead", role: "Search and content", bio: "Plans keywords, fixes technical issues and writes the content that earns rankings. (Example card: replace with a real team member.)", skills: ["Technical SEO", "Content strategy", "Analytics"] },
  { slug: "marketing-lead", title: "Marketing Lead", role: "Campaigns and growth", bio: "Runs paid and organic campaigns for software and service businesses. (Example card: replace with a real team member.)", skills: ["SaaS marketing", "Paid ads", "Email"] },
  { slug: "automation-engineer", title: "AI Automation Engineer", role: "Workflows and AI tools", bio: "Connects your tools, builds AI assistants and automates follow-ups. (Example card: replace with a real team member.)", skills: ["AI automation", "n8n", "Chatbots"] },
];

export const SAMPLE_PROJECTS = [
  { slug: "example-law-firm-website", title: "Law firm lead website (example)", category: "Web development", color: "#3B82F6", industry: "Legal services", platform: "WordPress", technologies: ["WordPress", "Elementor", "PHP"], deliverables: ["Custom design", "Speed optimisation", "Lead forms and tracking", "On-page SEO"], summary: "An example of a fast, search-ready website for a professional services firm. Replace this with a real project." },
  { slug: "example-saas-funnel", title: "SaaS pricing and signup funnel (example)", category: "SaaS marketing", color: "#06B6D4", industry: "Software", platform: "Next.js", technologies: ["Next.js", "Tailwind CSS", "GA4"], deliverables: ["Pricing page", "Trial signup flow", "Conversion tracking", "A/B test plan"], summary: "An example of a marketing site and trial funnel for a software product. Replace this with a real project." },
  { slug: "example-online-store", title: "Online store on Shopify (example)", category: "Web development", color: "#3B82F6", industry: "Retail", platform: "Shopify", technologies: ["Shopify", "Liquid", "Klaviyo"], deliverables: ["Store design", "Product import", "Payments and shipping", "Launch support"], summary: "An example of an ecommerce build with checkout, payments and inventory handled. Replace this with a real project." },
  { slug: "example-ai-chatbot", title: "AI support assistant (example)", category: "AI automation", color: "#8B5CF6", industry: "Healthcare", platform: "Custom", technologies: ["OpenAI", "n8n", "Next.js"], deliverables: ["Assistant trained on your content", "Lead capture", "CRM hand-off", "Weekly reports"], summary: "An example of a website assistant that answers questions and hands leads to a human. Replace this with a real project." },
  { slug: "example-local-seo", title: "Local SEO growth campaign (example)", category: "SEO", color: "#10B981", industry: "Home services", platform: "WordPress", technologies: ["Google Business Profile", "Search Console", "Schema"], deliverables: ["Technical audit", "Location pages", "Citations and reviews", "Monthly reporting"], summary: "An example of a search campaign for a local business. Replace this with a real project." },
  { slug: "example-launch-video", title: "Product launch video series (example)", category: "Video production", color: "#EF4444", industry: "Technology", platform: "Premiere Pro", technologies: ["Premiere Pro", "After Effects", "DaVinci Resolve"], deliverables: ["Script and storyboard", "Editing and motion graphics", "Social cut-downs", "Captions"], summary: "An example of a launch video package with short edits for social channels. Replace this with a real project." },
];

/** Portfolio categories (with colours) created as real, editable entries under Portfolio > Categories. */
export const PROJECT_CATEGORIES = [
  { name: "Web development", color: "#3B82F6" }, { name: "AI automation", color: "#8B5CF6" }, { name: "SEO", color: "#10B981" },
  { name: "Digital marketing", color: "#F59E0B" }, { name: "Video production", color: "#EF4444" }, { name: "SaaS marketing", color: "#06B6D4" },
];
