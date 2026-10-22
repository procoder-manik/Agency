export const dynamic = "force-dynamic";
import { api, requireApi } from "@/lib/auth";
import { getEntry } from "@/lib/content";
import { bulk, updateEntry } from "@/lib/entries-admin";

type C = { params: { id: string } };
export const GET = api(async (_r: Request, { params }: C) => { await requireApi(); const item = await getEntry(Number(params.id)); if (!item) throw new Error("Not found."); return { item }; });
export const PUT = api(async (req: Request, { params }: C) => { const u = await requireApi(); return { item: await updateEntry(u, Number(params.id), await req.json()) }; });
export const DELETE = api(async (req: Request, { params }: C) => { const u = await requireApi(); return bulk(u, [Number(params.id)], new URL(req.url).searchParams.get("permanent") ? "delete" : "trash"); });
