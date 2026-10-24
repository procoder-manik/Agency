export const dynamic = "force-dynamic";
import { api, requireApi } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";
import { sendPhone } from "@/lib/notify";
import { sendMail, smtpReady } from "@/lib/email";

/** "Send a test" button in Settings > Notifications. */
export const POST = api(async () => {
  await requireApi("admin");
  const s = await getAllSettings();
  const phone = await sendPhone(`Test message from ${s.identity.name}. If you can read this, chat notifications work.`);
  const to = s.general.notifyEmail || s.identity.email;
  const email = !smtpReady() ? { ok: false, error: "SMTP is not set up." } : { ok: await sendMail(to, `Test notification from ${s.identity.name}`, "If you can read this, email notifications work.") };
  return { phone, email, emailTo: to };
});
