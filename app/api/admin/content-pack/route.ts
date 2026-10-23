export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { api, requireApi } from "@/lib/auth";
import { pg } from "@/lib/db";
import { audit } from "@/lib/content";
import { bust } from "@/lib/entries-admin";
import { installPack } from "@/lib/pack-install";

export const POST = api(async (req: Request) => {
  const u = await requireApi("admin");
  const { mode } = await req.json();
  const m = mode === "replace" ? "replace" : "missing";
  const report = await installPack(pg(), m);
  await audit(u.email, m === "replace" ? "replace starter content" : "add starter content", `${report.created} created, ${report.updated} updated`);
  bust();
  return report;
});
