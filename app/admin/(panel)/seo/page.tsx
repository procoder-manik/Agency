import { requirePage } from "@/lib/auth";
import { SeoAdmin } from "@/components/admin/SettingsForms";
export default async function Page() { await requirePage("admin"); return <SeoAdmin />; }
