import { requirePage } from "@/lib/auth";
import { UsersAdmin } from "@/components/admin/SettingsForms";
export default async function Page() { const u = await requirePage(); return <UsersAdmin me={u.uid} isAdmin={u.role === "admin"} />; }
