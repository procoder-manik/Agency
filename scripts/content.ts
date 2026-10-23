import "dotenv/config";
import postgres from "postgres";
import { installPack } from "../lib/pack-install";

// npm run db:content            adds anything that is missing
// npm run db:content -- --replace   rewrites built-in pages and replaces the old sample content (old items go to the trash)
(async () => {
  const mode = process.argv.includes("--replace") ? "replace" : "missing";
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  try {
    const r = await installPack(sql, mode);
    console.log(`Starter content (${mode}): ${r.created} created, ${r.updated} updated, ${r.skipped} skipped, ${r.trashed} moved to trash`);
  } finally { await sql.end(); }
})().catch((e) => { console.error(e); process.exit(1); });
