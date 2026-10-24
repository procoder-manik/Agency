import { requirePage } from "@/lib/auth";
import { ChatTraining } from "@/components/admin/ChatTraining";
export default async function Page() { await requirePage("admin"); return <ChatTraining />; }
