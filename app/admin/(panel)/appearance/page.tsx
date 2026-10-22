import { requirePage } from "@/lib/auth";
import { listThemes } from "@/lib/theme-server";
import { getSetting } from "@/lib/settings";
import { ThemeStudio } from "@/components/admin/ThemeStudio";

export default async function Appearance() {
  await requirePage("admin");
  const [themes, ap] = await Promise.all([listThemes(), getSetting("appearance")]);
  return <ThemeStudio themes={themes} active={ap.activeTheme} />;
}
