import { IDENTITY, NAVIGATION } from "./content-pack/services";
export const SETTING_DEFAULTS = {
  identity: {
    name: "Your Agency", shortName: "YA", tagline: IDENTITY.tagline,
    description: IDENTITY.description,
    longDescription: IDENTITY.longDescription,
    logo: "", logoDark: "", favicon: "", domain: "",
    email: "hello@example.com", phone: "", whatsapp: "", whatsappOn: true, whatsappCountryCode: "", whatsappMessage: "Hi, I found you on your website and would like to talk.", whatsappFloat: false, whatsappFloatText: "Chat on WhatsApp", whatsappFloatSide: "left", address: "", hours: "Sun to Thu, 10am to 7pm", replyTime: "within one business day",
    socials: { linkedin: "", x: "", instagram: "", facebook: "", youtube: "", dribbble: "", github: "" },
    legalName: "", registration: "", availability: "Open for new projects", ctaLabel: "Book a free consultation", ctaHref: "/contact", logoAlt: "",
  },
  seo: { titleTemplate: "%s | {name}", defaultDescription: "", ogImage: "", twitterHandle: "", twitterCard: "summary_large_image", localBusiness: false },
  navigation: NAVIGATION,
  appearance: { ui: null as null | Record<string, any>, activeTheme: "signal", defaultMode: "system", modeToggle: true, accentPicker: true, intro: true, cursor: true, smoothScroll: true, ambient: true },
  integrations: {
    gaId: "", googleAdsId: "", gtmId: "", metaPixelId: "", tiktokPixelId: "", linkedinId: "", clarityId: "", hotjarId: "", googleVerification: "", bingVerification: "", pinterestVerification: "", facebookVerification: "", headCode: "",
    chatWhatsapp: true, chatWhatsappText: "Can't reach us here?",
    chatMode: "builtin", chatPosition: "right", chatGreeting: "Hi! Ask us anything about our services.",
    chatScript: "", backToTopPosition: "right", chatBotName: "", chatSuggestions: [] as string[], chatLeadCapture: true, chatSound: true, chatIcon: "bubble", chatIconImage: "",
  },
  payments: { currencies: ["USD", "BDT"], defaultCurrency: "USD", methods: ["Card (Stripe)", "bKash", "Bank transfer"], note: "We accept card payments and local methods. Custom quotes are always available." },
  features: { pricing: true, blog: true, caseStudies: true, team: true, helpCenter: true, chat: true, backToTop: true, announcement: true },
  ai: { keys: { gemini: "", groq: "", openrouter: "", openai: "", anthropic: "" }, order: ["gemini", "groq", "openrouter", "openai", "anthropic"] },
  email: {
    autoReply: true, chatAutoReply: true, verifyEmail: true, fromName: "", replyTo: "", brandColor: "",
    subject: "We received your message", heading: "Thank you, {{firstName}}",
    intro: "Thank you for contacting us. We have received your message and will get back to you very shortly.",
    body: "A member of our team is reading it now. We usually reply {{replyTime}}.",
    signature: "The {{siteName}} team", showSummary: true, footerNote: "", unsubscribeNote: "You are receiving this email because you contacted {{siteName}}.",
  },
  footer: {
    heading: "", email: "", phone: "", whatsapp: "", address: "", hours: "", bigText: "", showBigName: true, showLocalTime: true,
    copyright: "", note: "",
  },
  portfolio: {
    label: "Work", base: "work",
    categories: [
      { name: "Web development", color: "#3B82F6" }, { name: "AI automation", color: "#8B5CF6" }, { name: "SEO", color: "#10B981" },
      { name: "Digital marketing", color: "#F59E0B" }, { name: "Video production", color: "#EF4444" }, { name: "SaaS marketing", color: "#06B6D4" },
    ] as { name: string; color: string }[],
  },
  notify: {
    chatRequests: true, formSubmissions: false, emails: "", channel: "off", phone: "",
    callmebotKey: "", twilioSid: "", twilioToken: "", twilioFrom: "", twilioMode: "whatsapp",
  },
  general: { trashDays: 30, notifyEmail: "", packVersion: 0 },
};
export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = { [K in SettingKey]: (typeof SETTING_DEFAULTS)[K] };

