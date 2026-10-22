import "dotenv/config";
import { migrate } from "./migrate";
import { seed } from "./seed";

(async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith("change-me")) console.warn("! Set a real JWT_SECRET in .env before going live.");
  await migrate();
  await seed();
  console.log(`\n✓ Setup complete. Run "npm run dev" and sign in at /admin with ${process.env.ADMIN_EMAIL || "admin@example.com"}`);
})().catch((e) => { console.error("Setup failed:", e.message || e); process.exit(1); });
