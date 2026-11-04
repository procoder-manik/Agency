import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verifySession } from "./lib/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // CSRF defence: browser requests that change data must come from this same site.
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    if (origin) { try { if (new URL(origin).host !== (req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host).split(",")[0].trim()) return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 }); } catch { return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 }); } }
  }
  const isLogin = pathname === "/admin/login" || pathname === "/api/admin/login";
  if (isLogin) return NextResponse.next();
  const session = await verifySession(req.cookies.get(COOKIE)?.value);
  if (!session) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const url = req.nextUrl.clone(); url.pathname = "/admin/login"; url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
