import { requirePage } from "@/lib/auth";
import { NavigationEditor } from "@/components/admin/SettingsForms";
export default async function Page() { await requirePage("admin"); return <NavigationEditor />; }
