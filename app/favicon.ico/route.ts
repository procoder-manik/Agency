import { NextResponse } from "next/server";
import { getAllSettings } from "@/lib/settings";
import { mediaUrl } from "@/lib/media";
export const dynamic = "force-dynamic";
/** Browsers ask for /favicon.ico by default: send them to the uploaded favicon, or the generated mark. */
export async function GET(req: Request) {
  const s = await getAllSettings(); const fav = mediaUrl((s.identity as any).favicon);
  return NextResponse.redirect(new URL(fav || "/api/logo", req.url), 307);
}
