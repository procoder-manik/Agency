import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;
function transport() {
  if (!process.env.SMTP_HOST) return null;
  if (!cached) {
    cached = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return cached;
}

export const smtpReady = () => Boolean(process.env.SMTP_HOST);

/** "Agency <hello@x.com>" when SMTP_FROM is a bare address; leaves a full "Name <addr>" untouched. */
export function fromHeader(name?: string) {
  const raw = (process.env.SMTP_FROM || process.env.SMTP_USER || "").trim();
  if (!raw || raw.includes("<") || !name) return raw;
  return `"${name.replace(/["\r\n]/g, "")}" <${raw}>`;
}

export interface MailOptions { fromName?: string; replyTo?: string; headers?: Record<string, string> }

export async function sendMail(to: string, subject: string, text: string, html?: string, opts: MailOptions = {}) {
  const t = transport();
  if (!t || !to) { console.log(`[email] SMTP not configured; would send "${subject}" to ${to}`); return false; }
  try {
    await t.sendMail({ from: fromHeader(opts.fromName), to, subject, text, html, replyTo: opts.replyTo || undefined, headers: opts.headers });
    return true;
  } catch (e) { console.error("[email]", (e as Error).message); return false; }
}

export const esc = (s: string) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
