import { desc } from "drizzle-orm";
import { requirePage } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { PageHead } from "@/components/admin/ui";

export default async function Audit() {
  await requirePage("admin");
  const rows = await db().select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(500);
  return (
    <>
      <PageHead title="Audit log" sub="Who changed what, and when. Covers publishing, deletes, settings and users." />
      <div className="glass overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="border-b border-line text-left text-fg2"><tr><th className="p-3">When</th><th>Who</th><th>Action</th><th>What</th></tr></thead>
        <tbody className="divide-y divide-line">{rows.map((r) => <tr key={r.id}><td className="whitespace-nowrap p-3 text-fg2">{r.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td><td>{r.userEmail}</td><td>{r.action}</td><td className="text-fg2">{r.target}</td></tr>)}</tbody></table>
        {!rows.length && <p className="p-5 text-fg2">Nothing logged yet.</p>}</div>
    </>
  );
}
