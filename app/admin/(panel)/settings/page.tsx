import { requirePage } from "@/lib/auth";
import { SiteSettings } from "@/components/admin/SettingsForms";
export default async function Page() { await requirePage("admin"); return <SiteSettings />; }
