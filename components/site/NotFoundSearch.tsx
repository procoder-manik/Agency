"use client";
import Link from "next/link";
import { useState } from "react";

export function NotFoundSearch({ items }: { items: { title: string; href: string; kind: string }[] }) {
  const [q, setQ] = useState("");
  const hits = q.length > 1 ? items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];
  return (
    <div className="mx-auto mt-10 max-w-lg text-left">
      <label htmlFor="nf-q" className="sr-only">Search the site</label>
      <input id="nf-q" className="input !py-3.5 text-lg" placeholder="Search pages, services and posts" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      {hits.length > 0 && <ul className="glass mt-3 divide-y divide-line overflow-hidden">{hits.map((h) => <li key={h.href}><Link href={h.href} className="flex justify-between gap-4 px-4 py-3 hover:bg-raised"><span className="text-fg">{h.title}</span><span className="text-sm text-muted">{h.kind}</span></Link></li>)}</ul>}
      {q.length > 1 && !hits.length && <p className="mt-3 text-fg2">Nothing matches “{q}”.</p>}
    </div>
  );
}
