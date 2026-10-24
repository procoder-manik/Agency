export const dynamic = "force-dynamic";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { messagePage } from "@/lib/public-page";

async function setFlag(t: string, value: boolean) {
  if (t.length < 20) return false;
  const [row] = await db().update(schema.leads).set({ unsubscribed: value, updatedAt: new Date() }).where(and(eq(schema.leads.token, t), isNull(schema.leads.deletedAt))).returning({ id: schema.leads.id });
  return !!row;
}

export async function GET(req: Request) {
  const u = new URL(req.url); const t = u.searchParams.get("t") || "";
  if (u.searchParams.get("undo")) {
    return (await setFlag(t, false)) ? messagePage("Subscribed again", "You will receive our emails again.") : messagePage("Link not valid", "This link is not valid.");
  }
  if (!(await setFlag(t, true))) return messagePage("Link not valid", "This unsubscribe link is not valid.");
  return messagePage("You are unsubscribed", "You will no longer receive marketing emails from us. Did this by mistake? You can subscribe again below.", { label: "Subscribe again", href: `${u.pathname}?t=${encodeURIComponent(t)}&undo=1` });
}

// One-click unsubscribe used by Gmail and Apple Mail (RFC 8058)
export async function POST(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  return Response.json({ ok: await setFlag(t, true) });
}
