export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { api, requireApi, HttpError } from "@/lib/auth";
import { sendBatch, sendOne } from "@/lib/campaigns";
import { smtpReady } from "@/lib/email";
import { EMAIL_RX } from "@/lib/leads";
import { newToken } from "@/lib/leads";

export const POST = api(async (req: Request) => {
  const u = await requireApi("admin");
  const b = await req.json();
  if (!smtpReady()) throw new HttpError(400, "Email sending is not set up. Add the SMTP_* values to your environment first.");
  if (b.action === "test") {
    const to = String(b.to || u.email).trim();
    if (!EMAIL_RX.test(to)) throw new HttpError(400, "Enter a valid test email address.");
    const ok = await sendOne({ subject: "[Test] " + String(b.subject || "(no subject)"), html: String(b.html || "") }, { name: "Alex Example", email: to, company: "Example Co", token: newToken() });
    if (!ok) throw new HttpError(500, "The test email could not be sent. Check your SMTP settings.");
    return { ok: true };
  }
  const c = await sendBatch(Number(b.id), 20);
  return { campaign: c };
});
