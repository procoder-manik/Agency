import { requirePage } from "@/lib/auth";
import { FooterContent, NavigationEditor } from "@/components/admin/SettingsForms";
export default async function Page() { await requirePage("admin"); return <><NavigationEditor /><FooterContent /></>; }
