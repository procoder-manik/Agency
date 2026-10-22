export const dynamic = "force-dynamic";
import { api, requireApi } from "@/lib/auth";
import { bulk } from "@/lib/entries-admin";
export const POST = api(async (req: Request) => { const u = await requireApi(); const { ids, action } = await req.json(); return bulk(u, ids || [], String(action)); });
