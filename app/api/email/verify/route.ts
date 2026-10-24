export const dynamic = "force-dynamic";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { messagePage } from "@/lib/public-page";

export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (t.length < 20) return messagePage("Link not valid", "This confirmation link is not valid or has expired.");
  const [row] = await db().update(schema.leads).set({ verified: true, verifiedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.leads.token, t), isNull(schema.leads.deletedAt))).returning({ id: schema.leads.id });
  if (!row) return messagePage("Link not valid", "This confirmation link is not valid or has expired.");
  return messagePage("Email confirmed", "Thank you. Your email address is confirmed and you will receive our updates and offers.");
}
