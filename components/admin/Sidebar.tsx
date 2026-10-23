"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ModeSegment } from "@/components/site/ThemePanel";

export interface NavGroup { title: string; items: { label: string; href: string; badge?: number }[] }

export function Sidebar({ groups, user, siteName }: { groups: NavGroup[]; user: { email: string; role: string }; siteName: string }) {
  const path = usePathname(); const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (h: string) => (h === "/admin" ? path === "/admin" : path === h || path.startsWith(h + "/"));
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin/login"; }
  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="font-display text-lg font-bold">{siteName}</Link>
        <a href="/" target="_blank" className="text-xs text-fg2 hover:text-accent">View site</a>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {groups.map((g) => (
          <div key={g.title} className="mb-7">
            <p className="mb-2.5 flex items-center gap-2.5 px-3 font-display text-[1.02rem] font-bold tracking-wide text-fg">
              <span aria-hidden className="h-[18px] w-1 rounded-full" style={{ background: "linear-gradient(180deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }} />{g.title}
            </p>
            <div className="ml-[18px] border-l border-line pl-2.5">
              {g.items.map((i) => (
                <Link key={i.href} href={i.href} className={`flex items-center justify-between rounded px-3 py-[7px] text-[0.88rem] font-normal transition-colors ${active(i.href) ? "bg-raised font-medium text-fg" : "text-fg2 hover:bg-raised/60 hover:text-fg"}`}>
                  {i.label}{!!i.badge && <span className="rounded-full bg-accent px-1.5 text-xs font-semibold text-onaccent">{i.badge}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-5 py-4 text-sm">
        <div className="mb-4"><ModeSegment /></div>
        <p className="truncate text-fg">{user.email}</p><p className="text-xs capitalize text-muted">{user.role}</p>
        <button onClick={logout} className="mt-2 text-fg2 hover:text-danger">Sign out</button>
      </div>
    </nav>
  );
  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-display font-bold">{siteName}</span>
        <button className="btn btn-ghost !px-3 !py-1.5" aria-expanded={open} onClick={() => setOpen(!open)}>Menu</button>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-bg/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>{nav}</aside>
    </>
  );
}
