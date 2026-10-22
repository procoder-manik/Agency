export const dynamic = "force-dynamic";
import { api, requireApi } from "@/lib/auth";
import { emptyTrash } from "@/lib/entries-admin";
export const POST = api(async (req: Request) => { const u = await requireApi(); const { collection } = await req.json(); return emptyTrash(u, String(collection)); });
