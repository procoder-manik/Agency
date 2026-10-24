"use client";
import { useEffect, useRef, useState } from "react";
import { sanitizeInline, toRichHtml } from "@/lib/rich";
import { toast } from "./ui";

/** A small document-style editor for short texts (footer lines): bold, italic, links, and a colour for each link.
 *  Select some text, press the link button, and type the address. Links use the theme colour unless you pick another. */
export function RichLinkEditor({ id, value, onChange, placeholder }: { id?: string; value: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null); const saved = useRef<Range | null>(null);
  const [color, setColor] = useState("#2563eb");
  useEffect(() => { if (ref.current) ref.current.innerHTML = sanitizeInline(toRichHtml(value)); }, []); // eslint-disable-line  (the editor owns the content after the first paint)
  const emit = () => onChange(sanitizeInline(ref.current?.innerHTML || ""));
  const keep = () => { const s = getSelection(); if (s && s.rangeCount && ref.current?.contains(s.anchorNode)) saved.current = s.getRangeAt(0).cloneRange(); };
  const restore = () => { const s = getSelection(); if (s && saved.current) { s.removeAllRanges(); s.addRange(saved.current); } };
  const inside = () => { const s = getSelection(); return !!s && !!s.anchorNode && !!ref.current?.contains(s.anchorNode); };
  const anchorsInSelection = (): HTMLAnchorElement[] => {
    const s = getSelection(); if (!s || !s.rangeCount || !ref.current) return [];
    const near = (s.anchorNode as Node | null)?.parentElement?.closest("a") as HTMLAnchorElement | null;
    const all = Array.from(ref.current.querySelectorAll("a")).filter((a) => s.containsNode(a, true));
    return near && !all.includes(near) ? [near, ...all] : all;
  };
  const cmd = (c: string) => { ref.current?.focus(); restore(); document.execCommand(c); emit(); keep(); };
  function link() {
    ref.current?.focus(); restore();
    const s = getSelection(); const existing = anchorsInSelection()[0];
    if (!s || (s.isCollapsed && !existing)) return toast("Select the words you want to link first.", "error");
    const url = prompt("Link address. Use /page for a page on your site, or https://… for another site.", existing?.getAttribute("href") || "https://");
    if (url === null) return;
    restore();
    if (!url.trim()) document.execCommand("unlink"); else document.execCommand("createLink", false, url.trim());
    emit(); keep();
  }
  function paint(c: string | null) {
    ref.current?.focus(); restore();
    const list = anchorsInSelection(); if (!list.length) return toast("Click inside a link, or select it, to change its colour.", "error");
    list.forEach((a) => { if (c) a.style.color = c; else a.style.removeProperty("color"); if (!a.getAttribute("style")) a.removeAttribute("style"); });
    emit(); keep();
  }
  const Btn = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => <button type="button" title={title} aria-label={title} onMouseDown={(e) => { e.preventDefault(); keep(); }} onClick={onClick} className="grid h-8 min-w-8 place-items-center rounded px-2 text-sm text-fg2 hover:bg-raised hover:text-fg">{children}</button>;
  return (
    <div className="rounded-[var(--r-md)] border border-line bg-bg/60 focus-within:border-accent">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line p-1.5">
        <Btn title="Bold" onClick={() => cmd("bold")}><b>B</b></Btn><Btn title="Italic" onClick={() => cmd("italic")}><i>I</i></Btn>
        <span className="mx-1 h-5 w-px bg-line" />
        <Btn title="Add or edit a link" onClick={link}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg><span className="ml-1.5 text-xs">Link</span></Btn>
        <Btn title="Remove the link" onClick={() => cmd("unlink")}><span className="text-xs">Unlink</span></Btn>
        <span className="mx-1 h-5 w-px bg-line" />
        <label className="flex items-center gap-1.5 text-xs text-fg2" onMouseDown={() => keep()}>Link colour
          <input type="color" aria-label="Link colour" value={color} onChange={(e) => { setColor(e.target.value); paint(e.target.value); }} className="h-7 w-8 cursor-pointer rounded border border-line bg-transparent" /></label>
        <Btn title="Use the theme colour for this link" onClick={() => paint(null)}><span className="text-xs">Theme colour</span></Btn>
      </div>
      <div id={id} ref={ref} contentEditable suppressContentEditableWarning spellCheck data-placeholder={placeholder || "Type here. Select words and press Link to make a link."}
        onInput={emit} onBlur={() => { keep(); emit(); }} onMouseUp={keep} onKeyUp={keep}
        className="min-h-[52px] px-3.5 py-3 text-[0.95rem] leading-relaxed text-fg outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)] [&_a]:text-accent [&_a]:underline" />
      <p className="border-t border-line px-3 py-1.5 text-xs text-muted">{"{year}"} becomes the current year and {"{name}"} your agency name. Links use your theme colour automatically.</p>
    </div>
  );
}
