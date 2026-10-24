"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Field } from "@/lib/fields";
import { apiFetch, fmt, PageHead, Spinner, Tabs, Toggle, toast } from "./ui";
import { FieldInput } from "./FieldInput";
import { ItemProvider } from "./context";
import { CHAT_ICONS, ChatIcon } from "@/components/site/chat-icons";

export function useSetting<T = any>(key: string) {
  const [value, setValue] = useState<T | null>(null); const [saving, setSaving] = useState(false); const router = useRouter();
  useEffect(() => { apiFetch(`/api/admin/settings/${key}`).then((r) => setValue(r.value)).catch((e) => toast(e.message, "error")); }, [key]);
  async function save(v = value) {
    setSaving(true);
    try { const r = await apiFetch(`/api/admin/settings/${key}`, { method: "PUT", json: { value: v } }); if (key !== "ai") setValue(r.value); toast("Settings saved. The site is updated."); router.refresh(); } catch (e: any) { toast(e.message, "error"); }
    setSaving(false);
  }
  return { value, setValue, save, saving };
}

export function SettingsSection({ k, fields, title, children }: { k: string; fields: (Field & { path?: string })[]; title?: string; children?: (v: any, set: (v: any) => void) => ReactNode }) {
  const { value, setValue, save, saving } = useSetting<any>(k);
  if (!value) return <p className="flex items-center gap-2 text-fg2"><Spinner /> Loading…</p>;
  const get = (p: string) => p.split(".").reduce((o, x) => o?.[x], value);
  const set = (p: string, v: any) => { const parts = p.split("."); const n = structuredClone(value); let o = n; parts.slice(0, -1).forEach((x) => (o = o[x] ??= {})); o[parts.at(-1)!] = v; setValue(n); };
  return (
    <ItemProvider value={{ collection: "settings", item: { title: title || k, data: value } }}>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => {
          const p = f.path || f.name;
          if (f.type === "toggle") return <div key={p}><Toggle label={f.label} help={f.help} checked={!!get(p)} onChange={(v) => set(p, v)} /></div>;
          return <div key={p} className={["textarea", "markdown", "image", "list", "tags"].includes(f.type) ? "sm:col-span-2" : ""}><FieldInput field={f} value={get(p)} onChange={(v) => set(p, f.type === "image" && typeof v === "object" ? v?.url || "" : v)} /></div>;
        })}
      </div>
      {children?.(value, setValue)}
      <button className="btn btn-primary mt-6" disabled={saving} onClick={() => save()}>{saving ? <Spinner /> : "Save settings"}</button>
    </ItemProvider>
  );
}

/** Facts the AI must never make up (contact details, legal names, hours) stay manual; everything written in words gets the AI button. */
const FACTUAL = /^(address|hours|replyTime|legalName|registration|availability|shortName|fromName|replyTo|bigText|copyright|chatBotName|defaultCurrency|ctaHref|domain|phone|emails|twilioSid|twilioToken|twilioFrom|callmebotKey)$/;
const t = (name: string, label: string, type: Field["type"] = "text", extra: Partial<Field> = {}): Field & { path?: string } => ({ name, label, type, ...(FACTUAL.test(name) ? { ai: false } : {}), ...extra });

export function SiteSettings() {
  const [tab, setTab] = useState("Site identity");
  const tabs = ["Site identity", "Contact & social", "Payments", "Integrations", "Notifications", "Email", "Portfolio", "Features", "General", "Starter content"];
  return (
    <>
      <PageHead title="Site settings" sub="Everything here is read by every page, email and schema block. Nothing is hard-coded." />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="glass mt-4 p-5 sm:p-6" key={tab}>
        {tab === "Site identity" && <SettingsSection k="identity" fields={[
          t("name", "Agency name"), t("shortName", "Short name / initials", "text", { help: "Used for the generated logo mark and favicon." }),
          t("tagline", "Tagline", "text", { ai: true }), t("ctaLabel", "Main call to action label"), t("description", "One-line description", "textarea", { ai: true }),
          t("longDescription", "Long description", "textarea", { ai: true }), t("logo", "Logo for light mode (dark logo on a light background)", "image", { size: "400 × 120", help: "Leave empty to use the generated mark. Also used in emails." }), t("logoDark", "Logo for dark mode (light or white logo)", "image", { size: "400 × 120", help: "Optional. If empty, the light-mode logo is used in both modes." }), t("logoAlt", "Logo alt text"), t("favicon", "Favicon (the small icon in the browser tab)", "image", { size: "512 × 512 (square PNG)", help: "Upload a square PNG, at least 512 × 512. Leave empty to use an icon generated from your name." }),
          t("ctaHref", "Main call to action link"), t("domain", "Primary domain", "url", { help: "e.g. https://youragency.com, used for canonical URLs and the sitemap." }),
          t("legalName", "Legal business name"), t("registration", "Registration details"), t("availability", "Availability line shown on the home hero", "text", { help: "A small status pill with a pulsing dot. Leave empty to hide it. Keep it true." }),
        ]} />}
        {tab === "Contact & social" && <SettingsSection k="identity" fields={[
          t("email", "Contact email"), t("phone", "Phone"), t("whatsapp", "WhatsApp number"), t("address", "Address (optional)"), t("hours", "Business hours"), t("replyTime", "Typical reply time", "text", { placeholder: "within one business day" }),
          ...["linkedin", "x", "instagram", "facebook", "youtube", "dribbble", "github"].map((s) => ({ ...t(s, `${s === "x" ? "X" : s[0].toUpperCase() + s.slice(1)} URL`, "url"), path: `socials.${s}` })),
        ]} />}
        {tab === "Payments" && <SettingsSection k="payments" fields={[
          t("currencies", "Currencies you accept", "tags"), t("defaultCurrency", "Default currency"), t("methods", "Payment methods", "tags", { help: "e.g. Card (Stripe), bKash, Nagad, Bank transfer" }), t("note", "Payment note on the pricing page", "textarea"),
        ]} />}
        {tab === "Integrations" && <div className="space-y-8">
          <p className="max-w-3xl text-sm text-fg2">Connect your marketing and analytics tools by pasting their ID. Each ID is checked against that tool's format, and the tool only loads once it is filled in. Chat settings live under <a className="text-accent underline" href="/admin/chat/settings">Chatbot &gt; Settings</a>.</p>
          <SettingsSection k="integrations" fields={[
            t("gaId", "Google Analytics 4", "text", { placeholder: "G-XXXXXXXXXX", help: "Analytics > Admin > Data streams." }),
            t("gtmId", "Google Tag Manager", "text", { placeholder: "GTM-XXXXXXX", help: "If you use Tag Manager, you can add other tools there instead." }),
            t("googleAdsId", "Google Ads conversion tag", "text", { placeholder: "AW-1234567890" }),
            t("metaPixelId", "Facebook (Meta) Pixel", "text", { placeholder: "123456789012345", help: "Events Manager > Data sources. Sends PageView, and Lead when someone submits a form or the chat." }),
            t("tiktokPixelId", "TikTok Pixel", "text", { placeholder: "CXXXXXXXXXXXXXXXXXXX" }),
            t("linkedinId", "LinkedIn Insight Tag (partner ID)", "text", { placeholder: "1234567" }),
            t("clarityId", "Microsoft Clarity", "text", { placeholder: "abcdefghij", help: "Free heatmaps and session recordings." }),
            t("hotjarId", "Hotjar site ID", "text", { placeholder: "1234567" }),
            t("googleVerification", "Google Search Console verification code", "text", { help: "Only the code from the verification meta tag (content=\"...\")." }),
            t("bingVerification", "Bing Webmaster verification code", "text"),
            t("pinterestVerification", "Pinterest domain verification code", "text"),
            t("facebookVerification", "Facebook domain verification code", "text"),
            t("headCode", "Other tracking code (advanced)", "textarea", { mono: true, rows: 6, help: "Paste any other script or tag, such as a booking widget or another pixel. It is added to every public page. Only paste code you trust." }),
          ]} />
        </div>}
        {tab === "Notifications" && <NotificationsSettings />}
        {tab === "Portfolio" && <SettingsSection k="portfolio" fields={[
          t("label", "Name used on the site", "text", { ai: false, help: "Shown in breadcrumbs and headings, for example Work, Portfolio or Projects. Change the menu link in Menus, header and footer." }),
          t("base", "Web address name", "text", { ai: false, placeholder: "work", help: "The part of the address after your domain: yourdomain.com/work/project-name. Lowercase letters, numbers and hyphens only. When you change it, the portfolio page is renamed to match and the old address redirects. Remember to update the menu link too." }),
        ]} />}
        {tab === "Email" && <SettingsSection k="email" fields={[
          t("autoReply", "Send an automatic thank-you email to everyone who submits a form", "toggle"),
          t("chatAutoReply", "Also send it to people who leave their details in the chat", "toggle"),
          t("verifyEmail", "Include a “Confirm my email” button (confirmed emails can receive campaigns)", "toggle"),
          t("showSummary", "Show a copy of their message in the email", "toggle"),
          t("fromName", "Sender name (blank = your agency name)"), t("replyTo", "Reply-to address (blank = contact email)", "text"),
          t("subject", "Subject"), t("heading", "Heading", "text", { help: "Variables: {{firstName}}, {{name}}, {{siteName}}, {{replyTime}}" }),
          t("intro", "Main message", "textarea"), t("body", "Second paragraph", "textarea"), t("signature", "Sign-off"),
          t("unsubscribeNote", "Footer line above the unsubscribe link", "textarea"), t("footerNote", "Extra footer note (optional)", "textarea"),
          t("brandColor", "Button and accent colour (blank = from your theme)", "text", { placeholder: "#1E5CF2", help: "A hex colour. Emails always use a white background for the best inbox display." }),
        ]} />}
        {tab === "Features" && <SettingsSection k="features" fields={[
          t("pricing", "Public pricing pages and tables", "toggle", { help: "Turn off to work by custom quote only." }), t("blog", "Blog", "toggle"), t("caseStudies", "Case studies", "toggle"),
          t("team", "Team sections", "toggle"), t("helpCenter", "Help center", "toggle"), t("chat", "Chat widget", "toggle"), t("backToTop", "Back-to-top button", "toggle"), t("announcement", "Announcement bar and popups", "toggle"),
        ]} />}
        {tab === "Starter content" && <StarterContent />}
        {tab === "General" && <SettingsSection k="general" fields={[t("trashDays", "Days to keep items in the trash", "number"), t("notifyEmail", "Send form notifications to (blank = contact email)")]} />}
      </div>
    </>
  );
}


/* ---------------- Header menu editor: links, dropdowns and mega menus ---------------- */
function HeaderMenuEditor({ list, onChange }: { list: any[]; onChange: (l: any[]) => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const upd = (i: number, patch: any) => onChange(list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => { const n = [...list]; [n[i + d], n[i]] = [n[i], n[i + d]]; onChange(n); };
  const setType = (i: number, type: string) => { const cur = list[i]; upd(i, { type, columns: type === "link" ? undefined : cur.columns?.length ? cur.columns : [{ title: "", links: [{ label: "", href: "/", description: "" }] }], ...(type === "link" ? { promo: undefined } : {}) }); if (type !== "link") setOpenIdx(i); };
  return (
    <div className="space-y-3">
      {list.map((l, i) => {
        const type = l.type === "dropdown" || l.type === "mega" ? l.type : "link"; const cols: any[] = l.columns || [];
        const setCols = (c: any[]) => upd(i, { columns: c });
        return (
          <div key={i} className="rounded-[var(--r-md)] border border-line p-3">
            <div className="flex flex-wrap items-center gap-2">
              <input className="input !w-40 flex-1" value={l.label} placeholder="Label" aria-label="Label" onChange={(e) => upd(i, { label: e.target.value })} />
              <input className="input flex-[2] font-mono text-sm" value={l.href} placeholder={type === "link" ? "/page or https://" : "Optional link for the label"} aria-label="Link" onChange={(e) => upd(i, { href: e.target.value })} />
              <select className="input !w-auto" value={type} aria-label="Menu type" onChange={(e) => setType(i, e.target.value)}><option value="link">Simple link</option><option value="dropdown">Dropdown</option><option value="mega">Mega menu</option></select>
              {type !== "link" && <button className="text-sm text-accent hover:underline" onClick={() => setOpenIdx(openIdx === i ? null : i)}>{openIdx === i ? "Hide items" : "Edit items"}</button>}
              <button className="px-1 text-fg2 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button className="px-1 text-fg2 disabled:opacity-30" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button className="px-1 text-danger" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
            </div>
            {type !== "link" && openIdx === i && (
              <div className="mt-4 space-y-4 border-t border-line pt-4">
                <p className="text-xs text-muted">{type === "mega" ? "A mega menu shows up to 4 columns of links with short descriptions, and an optional highlight card. Use it for service areas or service groups." : "A dropdown shows one simple list of links under this item."}</p>
                <div className={`grid gap-4 ${type === "mega" ? "md:grid-cols-2" : ""}`}>
                  {(type === "mega" ? cols : cols.slice(0, 1)).map((c, ci) => (
                    <div key={ci} className="rounded-[var(--r-md)] bg-raised/40 p-3">
                      {type === "mega" && <div className="mb-3 flex gap-2"><input className="input font-semibold" value={c.title || ""} placeholder="Column title (e.g. Houston services)" aria-label="Column title" onChange={(e) => setCols(cols.map((x, j) => (j === ci ? { ...x, title: e.target.value } : x)))} /><button className="text-sm text-danger" onClick={() => setCols(cols.filter((_, j) => j !== ci))}>Remove</button></div>}
                      <div className="space-y-2">{(c.links || []).map((x: any, xi: number) => {
                        const setLinks = (nl: any[]) => setCols(cols.map((y, j) => (j === ci ? { ...y, links: nl } : y)));
                        return (
                          <div key={xi} className="flex flex-wrap items-center gap-2">
                            <input className="input !w-36 flex-1 !py-2" value={x.label} placeholder="Label" aria-label="Item label" onChange={(e) => setLinks(c.links.map((y: any, j: number) => (j === xi ? { ...y, label: e.target.value } : y)))} />
                            <input className="input flex-[2] !py-2 font-mono text-sm" value={x.href} placeholder="/page" aria-label="Item link" onChange={(e) => setLinks(c.links.map((y: any, j: number) => (j === xi ? { ...y, href: e.target.value } : y)))} />
                            <input className="input basis-full !py-2 text-sm" value={x.description || ""} placeholder="Short description (optional)" aria-label="Item description" onChange={(e) => setLinks(c.links.map((y: any, j: number) => (j === xi ? { ...y, description: e.target.value } : y)))} />
                            <button className="px-1 text-xs text-fg2 disabled:opacity-30" disabled={xi === 0} onClick={() => { const n = [...c.links]; [n[xi - 1], n[xi]] = [n[xi], n[xi - 1]]; setLinks(n); }}>↑</button>
                            <button className="px-1 text-xs text-fg2 disabled:opacity-30" disabled={xi === c.links.length - 1} onClick={() => { const n = [...c.links]; [n[xi + 1], n[xi]] = [n[xi], n[xi + 1]]; setLinks(n); }}>↓</button>
                            <button className="px-1 text-xs text-danger" onClick={() => setLinks(c.links.filter((_: any, j: number) => j !== xi))}>✕</button>
                          </div>);
                      })}</div>
                      <button className="mt-2 text-sm text-accent hover:underline" onClick={() => setCols(cols.map((y, j) => (j === ci ? { ...y, links: [...(y.links || []), { label: "", href: "/", description: "" }] } : y)))}>Add link</button>
                    </div>
                  ))}
                </div>
                {type === "mega" && cols.length < 4 && <button className="text-sm text-accent hover:underline" onClick={() => setCols([...cols, { title: "", links: [{ label: "", href: "/", description: "" }] }])}>Add column</button>}
                {type === "mega" && (
                  <div className="rounded-[var(--r-md)] border border-dashed border-line p-3">
                    <p className="mb-2 text-sm font-medium">Highlight card (optional)</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {([["title", "Title"], ["text", "Short text"], ["href", "Link"], ["label", "Button text"]] as const).map(([k, ph]) => <input key={k} className="input !py-2 text-sm" placeholder={ph} aria-label={ph} value={l.promo?.[k] || ""} onChange={(e) => upd(i, { promo: { title: "", text: "", href: "", label: "", ...(l.promo || {}), [k]: e.target.value } })} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button className="text-sm text-accent hover:underline" onClick={() => onChange([...list, { label: "", href: "/" }])}>Add menu item</button>
    </div>
  );
}


/* ---------------- Chat icon picker ---------------- */
function ChatIconPicker({ value, custom, onChange }: { value: string; custom: boolean; onChange: (id: string) => void }) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-medium text-fg2">Chat button icon</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {CHAT_ICONS.map((i) => (
          <button key={i.id} type="button" onClick={() => onChange(i.id)} aria-pressed={value === i.id && !custom} title={i.label} className={`grid h-14 place-items-center rounded-[var(--r-md)] border transition-colors ${value === i.id && !custom ? "border-accent bg-accent/10 text-accent" : "border-line text-fg2 hover:border-accent hover:text-fg"}`}>
            <ChatIcon id={i.id} size={24} /><span className="sr-only">{i.label}</span>
          </button>
        ))}
      </div>
      {custom && <p className="mt-2 text-xs text-warning">Your own image is set above, so it is used instead of these icons. Remove it to use a built-in icon.</p>}
    </div>
  );
}

/* ---------------- Notifications: tell the owner when someone wants to talk ---------------- */
function NotificationsSettings() {
  const [test, setTest] = useState<any>(null); const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true); setTest(null);
    try { setTest(await apiFetch("/api/admin/notify-test", { method: "POST" })); } catch (e: any) { toast(e.message, "error"); } finally { setBusy(false); }
  }
  return (
    <div>
      <p className="mb-5 text-sm text-fg2">When a visitor asks the chat for a human, or sends a message, you get a short message here. Save your settings first, then press Send a test.</p>
      <SettingsSection k="notify" fields={[
        t("chatRequests", "Tell me when someone asks to talk in the chat", "toggle"),
        t("formSubmissions", "Also tell me about contact form messages", "toggle"),
        t("emails", "Extra email addresses to notify", "text", { placeholder: "sales@yourdomain.com, manager@yourdomain.com", help: "Comma separated. The main notification email is set in Settings > General." }),
        t("channel", "Phone message", "select", { options: [{ value: "off", label: "Off" }, { value: "callmebot", label: "WhatsApp through CallMeBot (free, for your own number)" }, { value: "twilio", label: "WhatsApp or SMS through Twilio (paid, most reliable)" }] }),
        t("phone", "Your WhatsApp or mobile number", "text", { placeholder: "+8801XXXXXXXXX", help: "With the country code. This is where the message is sent." }),
        t("callmebotKey", "CallMeBot API key", "text", { help: "Only for CallMeBot. You get the key by activating your own number once on callmebot.com (search for the WhatsApp API there)." }),
        t("twilioSid", "Twilio Account SID", "text", { help: "Only for Twilio." }), t("twilioToken", "Twilio Auth Token", "text"),
        t("twilioFrom", "Twilio sender number", "text", { placeholder: "+14155238886", help: "Your Twilio WhatsApp-enabled number, or an SMS-capable number." }),
        t("twilioMode", "Twilio message type", "select", { options: [{ value: "whatsapp", label: "WhatsApp" }, { value: "sms", label: "SMS" }] }),
      ]}>{() => (
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button type="button" className="btn btn-ghost !py-2 text-sm" disabled={busy} onClick={run}>{busy ? <Spinner /> : "Send a test"}</button>
          {test && <div className="text-sm"><p className={test.phone.ok ? "text-success" : test.phone.channel === "off" ? "text-muted" : "text-danger"}>Phone: {test.phone.ok ? `sent by ${test.phone.channel}. Check your phone.` : test.phone.error}</p><p className={test.email.ok ? "text-success" : "text-danger"}>Email to {test.emailTo}: {test.email.ok ? "sent." : test.email.error || "could not be sent."}</p></div>}
        </div>
      )}</SettingsSection>
      <p className="mt-4 text-xs text-muted">Messages are sent only when a visitor submits their details, so you never get a message without a name and email to reply to. At most 30 notifications per hour are sent.</p>
    </div>
  );
}

/* ---------------- Chatbot > Settings ---------------- */
export function ChatSettings() {
  return (
    <div>
      <p className="mb-5 max-w-3xl text-sm text-fg2">How the chat looks and behaves on your site. Teach it new things under <a className="text-accent underline" href="/admin/chat">Training</a>, and set who gets notified under <a className="text-accent underline" href="/admin/chat/notifications">Notifications</a>.</p>
      <SettingsSection k="integrations" fields={[
        t("chatMode", "Chat widget", "select", { options: [{ value: "builtin", label: "Built-in assistant (answers from your content)" }, { value: "thirdparty", label: "Third-party chat script" }, { value: "off", label: "Off" }] }),
        t("chatPosition", "Chat position", "select", { options: [{ value: "right", label: "Right" }, { value: "left", label: "Left" }] }),
        t("backToTopPosition", "Back-to-top button position", "select", { options: [{ value: "right", label: "Right" }, { value: "left", label: "Left" }], help: "If it shares a side with the chat button, it moves up automatically." }),
        t("chatBotName", "Assistant name (blank = your agency name)"), t("chatGreeting", "Chat greeting", "textarea"),
        t("chatSuggestions", "Quick-reply buttons (blank = automatic)", "tags", { help: "Short questions visitors can tap. Example: How much does it cost?" }),
        t("chatLeadCapture", "Let the chat collect name and email for a human follow-up", "toggle"),
        t("chatSound", "Chat sounds (typing tick, send and reply chime)", "toggle"),
        t("chatWhatsapp", "Show a WhatsApp link in the chat", "toggle", { help: "A small text link under the message box, and again after someone leaves their details, so they can reach you directly. Uses the WhatsApp number from Site settings > Contact and social." }),
        t("chatWhatsappText", "Text before the WhatsApp link", "text", { ai: true, placeholder: "Can't reach us here?" }),
        t("chatWhatsappMessage", "Message that WhatsApp pre-fills for the visitor", "text", { ai: true }),
        t("chatIconImage", "Or use your own chat icon image", "image", { size: "128 × 128 (square, transparent PNG)", help: "If set, this image replaces the icon chosen below, on the chat button and in the chat header." }),
        t("chatScript", "Third-party chat script", "textarea", { mono: true, rows: 4, help: "Only used when the chat widget above is set to Third-party." }),
      ]}>{(v, set) => <ChatIconPicker value={v.chatIcon || "bubble"} custom={!!v.chatIconImage} onChange={(id) => set({ ...v, chatIcon: id })} />}</SettingsSection>
    </div>
  );
}
export { NotificationsSettings };

/* ---------------- Header button and footer content ---------------- */
export function FooterContent() {
  return (
    <div className="mt-8 space-y-5">
      <div className="glass p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-semibold">Header button</h2>
        <p className="mb-5 text-sm text-fg2">The call-to-action button at the right of the header.</p>
        <SettingsSection k="identity" fields={[t("ctaLabel", "Button text"), t("ctaHref", "Button link", "text", { placeholder: "/contact or #chat" })]} />
      </div>
      <div className="glass p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-semibold">Footer content</h2>
        <p className="mb-5 text-sm text-fg2">Everything shown in the footer. Leave a field empty to use the matching value from Site settings (tagline, contact details).</p>
        <SettingsSection k="footer" fields={[
          t("heading", "Footer headline", "text", { help: "The large line at the top left. Empty = your tagline." }),
          t("email", "Footer email", "text", { help: "The big email link. Empty = the contact email in Site settings." }),
          t("phone", "Footer phone"), t("whatsapp", "Footer WhatsApp number"), t("address", "Footer address"), t("hours", "Footer business hours"),
          t("bigText", "Large outlined word at the bottom", "text", { help: "Empty = your agency name." }),
          t("showBigName", "Show the large outlined word", "toggle"), t("showLocalTime", "Show the local time", "toggle"),
          t("copyright", "Copyright name", "text", { help: "Shown after the © year. Empty = legal name or agency name." }),
          t("note", "Extra line in the bottom bar (optional)"),
        ]} />
      </div>
    </div>
  );
}

/* ---------------- Navigation ---------------- */
export function NavigationEditor() {
  const { value, setValue, save, saving } = useSetting<any>("navigation");
  if (!value) return <p className="text-fg2">Loading…</p>;
  const links = (list: any[], onChange: (l: any[]) => void) => (
    <div className="space-y-2">
      {list.map((l, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <input className="input !w-40 flex-1" value={l.label} placeholder="Label" aria-label="Label" onChange={(e) => onChange(list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
          <input className="input flex-[2] font-mono text-sm" value={l.href} placeholder="/page or https://" aria-label="Link" onChange={(e) => onChange(list.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
          <button className="px-1 text-fg2 disabled:opacity-30" disabled={i === 0} onClick={() => { const n = [...list]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }} aria-label="Move up">↑</button>
          <button className="px-1 text-fg2 disabled:opacity-30" disabled={i === list.length - 1} onClick={() => { const n = [...list]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n); }} aria-label="Move down">↓</button>
          <button className="px-1 text-danger" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
        </div>
      ))}
      <button className="text-sm text-accent hover:underline" onClick={() => onChange([...list, { label: "", href: "/" }])}>Add link</button>
    </div>
  );
  return (
    <>
      <PageHead title="Navigation" sub="The one source of truth for menus. Page editors' “show in menu” switches edit these same lists." />
      <div className="glass p-5"><h2 className="mb-1 font-semibold">Header menu</h2><p className="mb-4 text-xs text-muted">Each item can be a simple link, a dropdown, or a mega menu. Add as many items as you need.</p><HeaderMenuEditor list={value.header} onChange={(h) => setValue({ ...value, header: h })} /></div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {value.footer.map((c: any, ci: number) => (
          <div key={ci} className="glass p-5">
            <div className="mb-3 flex gap-2"><input className="input font-semibold" value={c.title} aria-label="Column title" onChange={(e) => setValue({ ...value, footer: value.footer.map((x: any, j: number) => (j === ci ? { ...x, title: e.target.value } : x)) })} />
              <button className="text-sm text-danger" onClick={() => confirm("Remove this column?") && setValue({ ...value, footer: value.footer.filter((_: any, j: number) => j !== ci) })}>Remove</button></div>
            {links(c.links, (l) => setValue({ ...value, footer: value.footer.map((x: any, j: number) => (j === ci ? { ...x, links: l } : x)) }))}
          </div>
        ))}
        <button className="glass grid min-h-[120px] place-items-center p-5 text-fg2 hover:text-accent" onClick={() => setValue({ ...value, footer: [...value.footer, { title: "New column", links: [] }] })}>Add footer column</button>
      </div>
      <button className="btn btn-primary mt-6" disabled={saving} onClick={() => save()}>{saving ? <Spinner /> : "Save menus"}</button>
      <p className="mt-2 text-xs text-muted">Footer columns: add, remove and rename them freely; the footer adapts to the number of columns. Links to unpublished pages or switched-off features are hidden on the site automatically.</p>
    </>
  );
}

/* ---------------- SEO ---------------- */
export function SeoAdmin() {
  const [tab, setTab] = useState("Sitewide");
  const [redirects, setRedirects] = useState<any[]>([]); const [nf, setNf] = useState<any[]>([]); const [r, setR] = useState({ from: "", to: "", type: 301 });
  const load = () => { apiFetch("/api/admin/redirects").then((x) => setRedirects(x.items)).catch(() => {}); apiFetch("/api/admin/notfound").then((x) => setNf(x.items)).catch(() => {}); };
  useEffect(load, []);
  async function addRedirect(from = r.from, to = r.to) { try { await apiFetch("/api/admin/redirects", { method: "POST", json: { from, to, type: r.type } }); toast("Redirect saved."); setR({ from: "", to: "", type: 301 }); load(); } catch (e: any) { toast(e.message, "error"); } }
  return (
    <>
      <PageHead title="SEO" sub="Sitewide defaults, redirects and broken links." />
      <Tabs tabs={["Sitewide", `Redirects (${redirects.length})`, `404 log (${nf.length})`]} active={tab.startsWith("Redirects") ? `Redirects (${redirects.length})` : tab.startsWith("404") ? `404 log (${nf.length})` : tab} onChange={setTab} />
      <div className="glass mt-4 p-5 sm:p-6">
        {tab === "Sitewide" && <SettingsSection k="seo" fields={[
          t("titleTemplate", "Title template", "text", { help: "%s is the page title, {name} is the agency name. Example: %s | {name}" }),
          t("twitterHandle", "X / Twitter handle", "text", { placeholder: "@youragency" }), t("defaultDescription", "Default meta description", "textarea", { ai: true }),
          t("ogImage", "Default social image (blank = automatic branded image)", "image", { size: "1200 × 630 (1.91:1)" }),
          t("twitterCard", "Default card type", "select", { options: [{ value: "summary_large_image", label: "Large image" }, { value: "summary", label: "Small image" }] }),
          t("localBusiness", "Mark up as LocalBusiness (only if you serve customers at a real address)", "toggle"),
        ]} />}
        {tab.startsWith("Redirects") && (
          <div>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto]">
              <input className="input font-mono text-sm" placeholder="/old-path" value={r.from} onChange={(e) => setR({ ...r, from: e.target.value })} aria-label="From" />
              <input className="input font-mono text-sm" placeholder="/new-path" value={r.to} onChange={(e) => setR({ ...r, to: e.target.value })} aria-label="To" />
              <select className="input" value={r.type} onChange={(e) => setR({ ...r, type: Number(e.target.value) })} aria-label="Type"><option value={301}>301 permanent</option><option value={302}>302 temporary</option></select>
              <button className="btn btn-primary" onClick={() => addRedirect()}>Add redirect</button>
            </div>
            <table className="mt-5 w-full text-sm"><tbody className="divide-y divide-line">
              {redirects.map((x) => <tr key={x.id}><td className="py-2 font-mono">{x.fromPath}</td><td className="font-mono text-fg2">→ {x.toPath}</td><td className="text-muted">{x.type}</td><td className="text-right"><button className="text-danger" onClick={async () => { await apiFetch(`/api/admin/redirects?id=${x.id}`, { method: "DELETE" }); load(); }}>Delete</button></td></tr>)}
            </tbody></table>
            {!redirects.length && <p className="mt-4 text-fg2">No redirects yet.</p>}
          </div>
        )}
        {tab.startsWith("404") && (
          <div>
            {nf.length > 0 && <button className="mb-3 text-sm text-danger" onClick={async () => { await apiFetch("/api/admin/notfound?id=all", { method: "DELETE" }); load(); }}>Clear log</button>}
            <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="text-left text-fg2"><tr><th className="py-2">Path</th><th>Hits</th><th>Last seen</th><th>Fix</th></tr></thead><tbody className="divide-y divide-line">
              {nf.map((x) => <tr key={x.id}><td className="py-2 font-mono">{x.path}<div className="truncate text-xs text-muted">{x.referrer}</div></td><td>{x.hits}</td><td className="text-fg2">{fmt(x.lastSeen)}</td>
                <td><form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); const to = new FormData(e.currentTarget).get("to") as string; if (to) addRedirect(x.path, to); }}><input name="to" className="input !py-1 font-mono text-xs" placeholder="/redirect-to" /><button className="btn btn-ghost !px-2 !py-1 text-xs">Redirect</button></form></td></tr>)}
            </tbody></table></div>
            {!nf.length && <p className="text-fg2">No broken links recorded. 🎉</p>}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- AI ---------------- */
export function AiAdmin({ log }: { log: any[] }) {
  const { value, setValue, save, saving } = useSetting<any>("ai");
  const [status, setStatus] = useState<{ available: boolean; providers: string[] } | null>(null);
  useEffect(() => { apiFetch("/api/admin/ai").then(setStatus).catch(() => {}); }, [saving]);
  const P: [string, string, string][] = [["gemini", "Google Gemini", "https://aistudio.google.com/apikey"], ["groq", "Groq", "https://console.groq.com/keys"], ["openrouter", "OpenRouter (free models)", "https://openrouter.ai/keys"], ["openai", "OpenAI (paid)", "https://platform.openai.com/api-keys"], ["anthropic", "Anthropic Claude (paid)", "https://console.anthropic.com/"]];
  return (
    <>
      <PageHead title="AI tools" sub="Keys are optional. The site works without them; AI buttons stay disabled until at least one key is added." />
      <div className="glass p-5">
        <p className="mb-4 text-sm">{status?.available ? <span className="text-success">✓ AI is on. Order of use: {status.providers.join(" → ")}</span> : <span className="text-warning">AI is off. Gemini, Groq and OpenRouter all have free keys.</span>}</p>
        {value && <div className="space-y-3">{P.map(([k, label, url]) => (
          <div key={k} className="grid items-center gap-2 sm:grid-cols-[220px_1fr]">
            <label htmlFor={`k-${k}`} className="text-sm">{label} <a href={url} target="_blank" rel="noopener" className="text-xs text-accent hover:underline">get key</a></label>
            <input id={`k-${k}`} type="password" autoComplete="off" className="input font-mono text-sm" placeholder="Not set" value={value.keys[k] || ""} onChange={(e) => setValue({ ...value, keys: { ...value.keys, [k]: e.target.value } })} />
          </div>
        ))}
          <p className="text-xs text-muted">Keys can also come from environment variables (GEMINI_API_KEY, etc.). If one provider hits a rate limit, the next one is tried automatically.</p>
          <button className="btn btn-primary" disabled={saving} onClick={() => save()}>{saving ? <Spinner /> : "Save keys"}</button>
        </div>}
      </div>
      <div className="glass mt-5 p-5 text-sm text-fg2">
        <h2 className="mb-2 font-semibold text-fg">Where the AI tools live</h2>
        <p>“✦ AI” next to text fields writes, improves or shortens. Every SEO tab has “Write all SEO with AI”. Page sections have a ✦ button. Pages has “Write a page with AI” and “Location &amp; industry pages”. Services has “Create pages from services”. Case studies has a guided writer. Image fields have “Write image prompts”. Every list with SEO has bulk SEO writing.</p>
        <p className="mt-2">The AI only uses facts from your site and what you type. Numbers it wasn&apos;t given are removed automatically.</p>
      </div>
      <div className="glass mt-5 p-5">
        <h2 className="mb-3 font-semibold">Recent AI activity</h2>
        {!log.length ? <p className="text-sm text-fg2">No AI edits yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><tbody className="divide-y divide-line">{log.map((l) => <tr key={l.id}><td className="py-2 text-fg2">{fmt(l.createdAt)}</td><td>{l.userEmail}</td><td>{l.task}</td><td className="text-fg2">{l.ok ? `${l.provider} ${l.model}` : <span className="text-danger">failed</span>}</td><td className="max-w-xs truncate text-muted">{l.summary}</td></tr>)}</tbody></table></div>}
      </div>
    </>
  );
}

/* ---------------- Users ---------------- */
export function UsersAdmin({ me, isAdmin, meEmail = "", meName = "" }: { me: number; isAdmin: boolean; meEmail?: string; meName?: string }) {
  const [prof, setProf] = useState({ name: meName, email: meEmail, currentPassword: "" }); const [savingProf, setSavingProf] = useState(false);
  async function saveProfile() {
    setSavingProf(true);
    try {
      const r = await apiFetch("/api/admin/users", { method: "PUT", json: { id: me, name: prof.name, email: prof.email, currentPassword: prof.currentPassword } });
      if (r.relogin) { toast("Email changed. Please sign in again."); await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin/login"; return; }
      toast("Profile saved."); setProf({ ...prof, currentPassword: "" });
    } catch (e: any) { toast(e.message, "error"); } finally { setSavingProf(false); }
  }
  const [items, setItems] = useState<any[]>([]); const [nu, setNu] = useState({ email: "", name: "", role: "editor", password: "" }); const [pw, setPw] = useState("");
  const load = () => isAdmin && apiFetch("/api/admin/users").then((r) => setItems(r.items)).catch((e) => toast(e.message, "error"));
  useEffect(() => { load(); }, []); // eslint-disable-line
  const upd = async (body: any, msg: string) => { try { await apiFetch("/api/admin/users", { method: "PUT", json: body }); toast(msg); load(); } catch (e: any) { toast(e.message, "error"); } };
  return (
    <>
      <PageHead title={isAdmin ? "Users" : "My account"} sub={isAdmin ? "Admins can change everything. Editors can manage content but not settings or users." : undefined} />
      <div className="glass mb-5 p-5"><h2 className="mb-1 font-semibold">My profile</h2><p className="mb-3 text-xs text-muted">This is the email you sign in with. Changing it needs your current password and signs you out.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="pf-name">Name</label><input id="pf-name" className="input" value={prof.name} onChange={(e) => setProf({ ...prof, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="pf-email">Sign-in email</label><input id="pf-email" type="email" className="input" value={prof.email} onChange={(e) => setProf({ ...prof, email: e.target.value })} autoComplete="email" /></div>
          {prof.email.trim().toLowerCase() !== meEmail.toLowerCase() && <div className="sm:col-span-2"><label className="label" htmlFor="pf-pw">Current password (required to change the email)</label><input id="pf-pw" type="password" className="input max-w-sm" value={prof.currentPassword} onChange={(e) => setProf({ ...prof, currentPassword: e.target.value })} autoComplete="current-password" /></div>}
        </div>
        <button className="btn btn-primary mt-4" disabled={savingProf} onClick={saveProfile}>{savingProf ? <Spinner /> : "Save profile"}</button></div>
      <div className="glass mb-5 p-5"><h2 className="mb-3 font-semibold">Change my password</h2><div className="flex flex-wrap gap-2"><input type="password" className="input max-w-xs" placeholder="New password (10+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /><button className="btn btn-primary" onClick={() => { upd({ id: me, password: pw }, "Password changed."); setPw(""); }}>Update password</button></div></div>
      {isAdmin && <>
        <div className="glass overflow-x-auto p-5"><table className="w-full min-w-[560px] text-sm"><tbody className="divide-y divide-line">
          {items.map((u) => <tr key={u.id} className={u.deletedAt ? "opacity-50" : ""}><td className="py-2.5">{u.email}<div className="text-xs text-muted">{u.name}</div></td>
            <td><select className="input !w-auto !py-1" disabled={u.id === me} value={u.role} onChange={(e) => upd({ id: u.id, role: e.target.value }, "Role updated.")}><option value="admin">Admin</option><option value="editor">Editor</option></select></td>
            <td className="text-right">{u.id !== me && <button className="text-sm text-fg2 hover:text-danger" onClick={() => upd({ id: u.id, disabled: !u.deletedAt }, u.deletedAt ? "User re-enabled." : "User disabled.")}>{u.deletedAt ? "Enable" : "Disable"}</button>}</td></tr>)}
        </tbody></table></div>
        <div className="glass mt-5 p-5"><h2 className="mb-3 font-semibold">Add a user</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} />
            <input className="input" placeholder="Name" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} />
            <select className="input" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}><option value="editor">Editor</option><option value="admin">Admin</option></select>
            <input className="input" type="password" placeholder="Temporary password (10+ characters)" value={nu.password} autoComplete="new-password" onChange={(e) => setNu({ ...nu, password: e.target.value })} />
          </div>
          <button className="btn btn-primary mt-4" onClick={async () => { try { await apiFetch("/api/admin/users", { method: "POST", json: nu }); toast("User added."); setNu({ email: "", name: "", role: "editor", password: "" }); load(); } catch (e: any) { toast(e.message, "error"); } }}>Add user</button>
        </div>
      </>}
    </>
  );
}

/* ---------------- Starter content pack ---------------- */
export function StarterContent() {
  const [busy, setBusy] = useState(""); const [report, setReport] = useState<any>(null);
  const [sec, setSec] = useState<any>(null);
  async function addSections() {
    setBusy("sections");
    try { const r = await apiFetch("/api/admin/content-pack", { method: "POST", json: { mode: "sections" } }); setSec(r); toast(r.added.length || r.changed.length ? "Home page updated." : "The home page already has these sections."); } catch (e: any) { toast(e.message, "error"); }
    setBusy("");
  }
  async function run(mode: "missing" | "replace") {
    if (mode === "replace" && !confirm("Rewrite the built-in pages, platform pages, services, FAQs, posts and menus with the new starter pack? Pages you edited by hand are overwritten. Items you created yourself and your package prices are kept.")) return;
    setBusy(mode);
    try { const r = await apiFetch("/api/admin/content-pack", { method: "POST", json: { mode } }); setReport(r); toast("Starter content installed."); } catch (e: any) { toast(e.message, "error"); }
    setBusy("");
  }
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-fg2">The starter pack contains ready-to-edit content for web development, SEO, digital marketing, video editing and AI automation: 6 services, 17 packages, 26 FAQs, 6 blog posts, 14 core pages, 6 platform pages, 7 service topic pages, 2 location page templates, sample location pages (as drafts), and 2 custom modules. Every item can be edited or deleted in the admin.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-line p-5"><h3 className="font-semibold">Add what is missing</h3><p className="mt-1 text-sm text-fg2">Safe. Creates anything that does not exist yet and never changes what you already have.</p><button className="btn btn-ghost mt-4" disabled={!!busy} onClick={() => run("missing")}>{busy === "missing" ? <Spinner /> : "Add missing content"}</button></div>
        <div className="rounded border border-warning/40 p-5"><h3 className="font-semibold">Replace with the new pack</h3><p className="mt-1 text-sm text-fg2">Rewrites the built-in pages, platform and topic pages, services, FAQs, posts and menus. Old example items go to the trash. Your own items and package prices are kept.</p><button className="btn btn-primary mt-4" disabled={!!busy} onClick={() => run("replace")}>{busy === "replace" ? <Spinner /> : "Replace with new pack"}</button></div>
      </div>
      <div className="rounded border border-accent/40 p-5"><h3 className="font-semibold">Add the new home page sections</h3><p className="mt-1 max-w-3xl text-sm text-fg2">Adds stat counters and a Meet the team carousel to your existing home page and turns the Work section into a carousel. Nothing you wrote is changed or removed. Run "Add missing content" first to create the example team cards and example projects.</p>
        <button className="btn btn-ghost mt-4" disabled={!!busy} onClick={addSections}>{busy === "sections" ? <Spinner /> : "Add sections to the home page"}</button>
        {sec && <p className="mt-3 text-sm text-success">{[...sec.added.map((x: string) => `Added: ${x}`), ...sec.changed].join(". ") || "Already up to date."}</p>}</div>
      {report && <p className="text-sm text-success">Done: {report.created} created, {report.updated} updated, {report.skipped} left as they were, {report.trashed} moved to the trash.</p>}
      <p className="text-xs text-muted">Prices in the packages are examples. Change them in Packages to match your real prices. Testimonials and case studies are not included, because those must be real. The example team cards and example projects are placeholders: edit or delete them in Admin.</p>
    </div>
  );
}
