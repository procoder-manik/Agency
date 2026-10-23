import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { PRESETS } from "../lib/themes";
import { SETTING_DEFAULTS } from "../lib/settings-defaults";
import { installPack } from "../lib/pack-install";

export async function seed() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  const j = (v: any) => sql.json(v);
  try {
    // Admin user
    const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
    const [u] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (!u) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 12);
      await sql`INSERT INTO users (email, name, password_hash, role) VALUES (${email}, 'Admin', ${hash}, 'admin')`;
      console.log("  created admin", email);
    }
    // Built-in themes (refreshed on every run so preset updates ship)
    for (const t of PRESETS) {
      await sql`INSERT INTO themes (slug, name, builtin, tokens) VALUES (${t.slug}, ${t.name}, true, ${j(t.tokens)})
        ON CONFLICT (slug) DO UPDATE SET tokens = EXCLUDED.tokens, name = EXCLUDED.name, builtin = true, updated_at = now()`;
    }
    // Settings (only missing keys)
    for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
      await sql`INSERT INTO settings (key, value) VALUES (${key}, ${j(value)}) ON CONFLICT (key) DO NOTHING`;
    }
    // Starter content: services, packages, FAQs, blog posts, all pages, location templates, modules (never overwrites existing items)
    const rep = await installPack(sql, "missing");
    console.log(`  starter content: ${rep.created} created, ${rep.skipped} already existed`);
    console.log("✓ Seed data ready");
  } finally {
    await sql.end();
  }
}

if (process.argv[1]?.includes("seed")) seed().catch((e) => { console.error(e); process.exit(1); });
