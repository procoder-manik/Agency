export const dynamic = "force-dynamic";
import { api, requireApi } from "@/lib/auth";
import { countEntries, listEntries, purgeTrash } from "@/lib/content";
import { createEntry } from "@/lib/entries-admin";
import { getSetting } from "@/lib/settings";
import { getCollection } from "@/lib/collections";

export const GET = api(async (req: Request) => {
  await requireApi();
  const u = new URL(req.url);
  const collection = u.searchParams.get("collection") || "";
  if (!getCollection(collection)) throw new Error("Unknown collection.");
  if (Math.random() < 0.1) purgeTrash((await getSetting("general")).trashDays).catch(() => {});
  const items = await listEntries(collection, { status: (u.searchParams.get("status") as any) || "all", q: u.searchParams.get("q") || undefined, sort: u.searchParams.get("sort") || undefined, dir: (u.searchParams.get("dir") as any) || undefined });
  return { items, counts: await countEntries(collection) };
});

export const POST = api(async (req: Request) => {
  const user = await requireApi();
  return { item: await createEntry(user, await req.json()) };
});
