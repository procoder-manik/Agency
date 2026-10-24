import { requirePage } from "@/lib/auth";
import { PageHead } from "@/components/admin/ui";
import { ChatSettings } from "@/components/admin/SettingsForms";
export default async function Page() { await requirePage("admin"); return <><PageHead title="Chatbot settings" sub="Look, behaviour, sounds and the WhatsApp link." /><div className="glass p-5 sm:p-6"><ChatSettings /></div></>; }
