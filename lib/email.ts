import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, text: string, html?: string) {
  if (!process.env.SMTP_HOST || !to) { console.log(`[email] SMTP not configured; would send "${subject}" to ${to}`); return false; }
  const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
  try { await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text, html }); return true; }
  catch (e) { console.error("[email]", (e as Error).message); return false; }
}
export const esc = (s: string) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
