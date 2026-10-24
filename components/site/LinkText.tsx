import Link from "next/link";
import { richFooterHtml } from "@/lib/rich";

const SAFE = /^(https?:\/\/|\/|mailto:|tel:|#)/i;
/** Plain text that can contain links written as [label](address): "Designed by [NextGen Agency](https://nextgenagency.co)".
 *  {year} becomes the current year and {name} your agency name. Only normal web, email, phone and page addresses become links. */
export function LinkText({ text, name = "", className = "" }: { text: string; name?: string; className?: string }) {
  const src = String(text || "").replace(/\{year\}/gi, String(new Date().getFullYear())).replace(/\{name\}/gi, name);
  const out: React.ReactNode[] = []; const rx = /\[([^\]]{1,120})\]\(([^)\s]{1,400})\)/g; let last = 0, m: RegExpExecArray | null, i = 0;
  const cls = `underline decoration-current/40 underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent ${className}`;
  while ((m = rx.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const href = m[2];
    if (!SAFE.test(href)) out.push(m[0]);
    else if (href.startsWith("/") || href.startsWith("#")) out.push(<Link key={i++} href={href} className={cls}>{m[1]}</Link>);
    else out.push(<a key={i++} href={href} className={cls} {...(/^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{m[1]}</a>);
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push(src.slice(last));
  return <>{out}</>;
}

/** Footer texts written in the admin's link editor. Links use the theme colour unless you picked another one. */
export function RichInline({ text, name = "", className = "" }: { text: string; name?: string; className?: string }) {
  return <span className={`rich-inline ${className}`} dangerouslySetInnerHTML={{ __html: richFooterHtml(text, name) }} />;
}
