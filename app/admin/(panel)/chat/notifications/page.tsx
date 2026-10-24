import { requirePage } from "@/lib/auth";
import { PageHead } from "@/components/admin/ui";
import { NotificationsSettings } from "@/components/admin/SettingsForms";
export default async function Page() { await requirePage("admin"); return <><PageHead title="Chat notifications" sub="Get told by email, WhatsApp or SMS when someone asks to talk to a person." /><div className="glass p-5 sm:p-6"><NotificationsSettings /></div></>; }
