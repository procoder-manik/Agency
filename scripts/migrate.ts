import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

export async function migrate() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing. Copy .env.example to .env and fill it in.");
  const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });
  try {
    await sql`CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
    const done = new Set((await sql`SELECT name FROM _migrations`).map((r) => r.name as string));
    const dir = join(process.cwd(), "migrations");
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      if (done.has(file)) continue;
      await sql.begin(async (tx) => {
        await tx.unsafe(readFileSync(join(dir, file), "utf8"));
        await tx`INSERT INTO _migrations (name) VALUES (${file})`;
      });
      console.log("  applied", file);
    }
    console.log("✓ Database schema is up to date");
  } finally {
    await sql.end();
  }
}

if (process.argv[1]?.includes("migrate")) migrate().catch((e) => { console.error(e.message); process.exit(1); });
