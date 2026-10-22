export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { getEntry } from "@/lib/content";
import { getAllSettings } from "@/lib/settings";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { esc, sendMail } from "@/lib/email";

export async function POST(req: Request) {
  if (!rateLimit("form:" + clientIp(req), 5, 10 * 60_000)) return NextResponse.json({ error: "Too many submissions. Please try again in a few minutes." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const raw = (body.values || {}) as Record<string, any>;
  if (raw._hp) return NextResponse.json({ ok: true }); // honeypot: pretend success
  const form = body.formId ? await getEntry(Number(body.formId)) : null;
  if (form && (form.collection !== "forms" || form.status !== "published" || form.deletedAt)) return NextResponse.json({ error: "This form is not available." }, { status: 404 });
  const defs: any[] = form?.data.fields?.length ? form.data.fields : [{ name: "name", required: true }, { name: "email", type: "email", required: true }, { name: "message", required: true }];
  const values: Record<string, string> = {};
  for (const f of defs) {
    const v = String(raw[f.name] ?? "").trim().slice(0, f.type === "textarea" ? 5000 : 300);
    if (f.required && !v) return NextResponse.json({ error: `Please fill in “${f.label || f.name}”.` }, { status: 400 });
    if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (f.type === "select" && v && f.options && !String(f.options).split(",").map((o: string) => o.trim()).includes(v)) return NextResponse.json({ error: `Please choose a valid option for “${f.label}”.` }, { status: 400 });
    if (v) values[f.name] = v;
  }
  const [sub] = await db().insert(schema.submissions).values({ formId: form?.id ?? null, formName: form?.title || "Contact", values }).returning();
  if (!form || form.data.createLead !== false) {
    await db().insert(schema.leads).values({ name: values.name || "", email: values.email || "", phone: values.phone || "", company: values.company || "", source: `Form: ${form?.title || "Contact"}`, notes: values.message || "", submissionId: sub.id });
  }
  const s = await getAllSettings();
  const to = form?.data.notifyEmail || s.general.notifyEmail || s.identity.email;
  const rows = Object.entries(values).map(([k, v]) => `${k}: ${v}`).join("\n");
  await sendMail(to, `New ${form?.title || "contact"} submission on ${s.identity.name}`, rows,
    `<h2>New submission on ${esc(s.identity.name)}</h2><table>${Object.entries(values).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`);
  return NextResponse.json({ ok: true, message: form?.data.successMessage || "Thanks! We'll be in touch soon." });
}
