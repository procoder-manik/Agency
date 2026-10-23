import { IDENTITY, NAVIGATION } from "./content-pack/services";
export const SETTING_DEFAULTS = {
  identity: {
    name: "Your Agency", shortName: "YA", tagline: IDENTITY.tagline,
    description: IDENTITY.description,
    longDescription: IDENTITY.longDescription,
    logo: "", domain: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    email: "hello@example.com", phone: "", whatsapp: "", address: "", hours: "Sun to Thu, 10am to 7pm", replyTime: "within one business day",
    socials: { linkedin: "", x: "", instagram: "", facebook: "", youtube: "", dribbble: "", github: "" },
    legalName: "", registration: "", availability: "Open for new projects", ctaLabel: "Book a free consultation", ctaHref: "/contact", logoAlt: "",
  },
  seo: { titleTemplate: "%s | {name}", defaultDescription: "", ogImage: "", twitterHandle: "", twitterCard: "summary_large_image", localBusiness: false },
  navigation: NAVIGATION,
  appearance: { activeTheme: "signal", defaultMode: "system", modeToggle: true, accentPicker: true, intro: true, cursor: true, smoothScroll: true, ambient: true },
  integrations: {
    gaId: "", chatMode: "builtin", chatPosition: "right", chatGreeting: "Hi! Ask us anything about our services.",
    chatScript: "", backToTopPosition: "right", chatBotName: "", chatSuggestions: [] as string[], chatLeadCapture: true,
  },
  payments: { currencies: ["USD", "BDT"], defaultCurrency: "USD", methods: ["Card (Stripe)", "bKash", "Bank transfer"], note: "We accept card payments and local methods. Custom quotes are always available." },
  features: { pricing: true, blog: true, caseStudies: true, team: true, helpCenter: true, chat: true, backToTop: true, announcement: true },
  ai: { keys: { gemini: "", groq: "", openrouter: "", openai: "", anthropic: "" }, order: ["gemini", "groq", "openrouter", "openai", "anthropic"] },
  general: { trashDays: 30, notifyEmail: "", packVersion: 0 },
};
export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = { [K in SettingKey]: (typeof SETTING_DEFAULTS)[K] };

