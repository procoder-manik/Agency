/** One place that turns the WhatsApp number from Site settings into a click-to-chat link (wa.me).
 *  Clicking it opens WhatsApp on the visitor's phone, or WhatsApp Web on a computer, with your number and a ready message. */
export interface WaIdentity { whatsapp?: string; whatsappOn?: boolean; whatsappCountryCode?: string; whatsappMessage?: string }

/** Digits only, in international format. A local number such as 01XXXXXXXXX needs a country code (set in Site settings). */
export function waDigits(number: string | undefined, countryCode = ""): string {
  const raw = String(number || "").trim(); if (!raw) return "";
  const plus = raw.startsWith("+"); let d = raw.replace(/\D/g, "");
  if (!d) return "";
  if (!plus) {
    if (d.startsWith("00")) d = d.slice(2);
    else if (d.startsWith("0")) { const cc = countryCode.replace(/\D/g, ""); if (!cc) return ""; d = cc + d.slice(1); }
  }
  return d.length >= 8 && d.length <= 15 ? d : "";
}

/** The link, or "" when WhatsApp is switched off or the number cannot be used. */
export function waLink(id: WaIdentity, number?: string, message?: string): string {
  if (id.whatsappOn === false) return "";
  const d = waDigits(number ?? id.whatsapp, id.whatsappCountryCode); if (!d) return "";
  const m = message ?? id.whatsappMessage ?? "";
  return `https://wa.me/${d}${m ? `?text=${encodeURIComponent(m)}` : ""}`;
}
