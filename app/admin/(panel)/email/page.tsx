import { requirePage } from "@/lib/auth";
import { EmailMarketing } from "@/components/admin/EmailMarketing";
export default async function Page() { await requirePage("admin"); return <EmailMarketing />; }
