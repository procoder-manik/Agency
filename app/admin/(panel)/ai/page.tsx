import { desc } from "drizzle-orm";
import { requirePage } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { AiAdmin } from "@/components/admin/SettingsForms";
export default async function Page() {
  await requirePage("admin");
  const log = await db().select().from(schema.aiLog).orderBy(desc(schema.aiLog.createdAt)).limit(100);
  return <AiAdmin log={JSON.parse(JSON.stringify(log))} />;
}
