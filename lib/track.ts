/** Tells the connected tools that a visitor became a lead (contact form or chat). Safe to call when nothing is installed. */
export function trackLead(source: "form" | "chat" = "form") {
  try {
    const w = window as any;
    w.fbq?.("track", "Lead", { content_name: source });
    w.gtag?.("event", "generate_lead", { event_category: source });
    w.ttq?.track?.("SubmitForm");
    w.dataLayer?.push({ event: "generate_lead", lead_source: source });
    w.clarity?.("event", "lead");
  } catch {}
}
