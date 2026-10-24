"use client";
import { useEffect, useState } from "react";
import { apiFetch, Empty, fmt, Modal, PageHead, Spinner, toast } from "./ui";

export function ChatTraining() {
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [urls, setUrls] = useState(""); const [busy, setBusy] = useState(""); const [report, setReport] = useState<{ url: string; ok: boolean; error?: string }[]>([]);
  const [note, setNote] = useState<{ id?: number; title: string; content: string } | null>(null);
  const [q, setQ] = useState(""); const [ans, setAns] = useState<{ answer: string; mode: string } | null>(null); const [asking, setAsking] = useState(false);
  const load = () => apiFetch("/api/admin/chat-sources").then((r) => setItems(r.items)).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function addUrls() {
    if (!urls.trim()) return toast("Paste at least one page link.", "error");
    setBusy("urls"); setReport([]);
    try { const r = await apiFetch("/api/admin/chat-sources", { method: "POST", json: { action: "add_urls", urls } }); setReport(r.results); const ok = r.results.filter((x: any) => x.ok).length; toast(ok ? `Learned ${ok} page${ok === 1 ? "" : "s"}.` : "No page could be learned.", ok ? "ok" : "error"); if (ok) setUrls(""); load(); }
    catch (e: any) { toast(e.message, "error"); } finally { setBusy(""); }
  }
  async function saveNote() {
    if (!note) return; setBusy("note");
    try { await apiFetch("/api/admin/chat-sources", { method: "POST", json: { action: note.id ? "update_text" : "add_text", ...note } }); toast("Saved. The assistant knows it now."); setNote(null); load(); }
    catch (e: any) { toast(e.message, "error"); } finally { setBusy(""); }
  }
  async function refresh(id: number) { setBusy("r" + id); try { const r = await apiFetch("/api/admin/chat-sources", { method: "POST", json: { action: "refresh", id } }); toast(r.ok ? "Page re-read." : r.error, r.ok ? "ok" : "error"); load(); } catch (e: any) { toast(e.message, "error"); } finally { setBusy(""); } }
  async function openNote(id: number) { try { const r = await apiFetch("/api/admin/chat-sources", { method: "POST", json: { action: "get_text", id } }); setNote({ id, title: r.item.title, content: r.item.content }); } catch (e: any) { toast(e.message, "error"); } }
  async function ask() {
    if (!q.trim()) return; setAsking(true); setAns(null);
    try { const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: q }] }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || "Failed"); setAns({ answer: j.answer, mode: j.mode }); }
    catch (e: any) { toast(e.message, "error"); } finally { setAsking(false); }
  }
  const ok = items.filter((i) => i.status === "ok").length;
  return (
    <>
      <PageHead title="Chat training" sub="The assistant already learns your services, packages, work, FAQs, blog posts and contact details from this site automatically. Add more pages or your own notes here." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">{[["Extra sources learned", ok], ["Pages by link", items.filter((i) => i.kind === "url").length], ["Your notes", items.filter((i) => i.kind === "text").length]].map(([l, n]) => <div key={l as string} className="glass p-4"><p className="text-sm text-fg2">{l}</p><p className="font-display text-3xl font-bold">{n}</p></div>)}</div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass p-5">
          <h2 className="mb-1 font-semibold">Teach it from page links</h2>
          <p className="mb-3 text-sm text-fg2">Paste links to other pages (your old site, a policy page, a blog, a partner page). One per line, up to 20 at a time. The assistant reads the text on each page.</p>
          <textarea className="input h-32 font-mono text-sm" value={urls} onChange={(e) => setUrls(e.target.value)} placeholder={"https://example.com/refund-policy\nhttps://example.com/how-we-work"} aria-label="Page links" />
          <button className="btn btn-primary mt-3 !py-2 text-sm" disabled={!!busy} onClick={addUrls}>{busy === "urls" ? <><Spinner /> Reading pages…</> : "Learn these pages"}</button>
          {report.length > 0 && <ul className="mt-3 space-y-1 text-sm">{report.map((r) => <li key={r.url} className={r.ok ? "text-success" : "text-danger"}>{r.ok ? "✓" : "✕"} <span className="break-all">{r.url}</span>{r.error && <span className="block pl-4 text-xs">{r.error}</span>}</li>)}</ul>}
          <p className="mt-3 text-xs text-muted">Only public pages work. Pages that need a login, or that show their text only after JavaScript runs, cannot be read. Use a note instead.</p>
        </div>
        <div className="glass p-5">
          <h2 className="mb-1 font-semibold">Teach it with a note</h2>
          <p className="mb-3 text-sm text-fg2">Write facts or ready answers in your own words: refund rules, working hours on holidays, what you do not offer, special offers.</p>
          <button className="btn btn-primary !py-2 text-sm" onClick={() => setNote({ title: "", content: "" })}>Write a note</button>
          <div className="mt-5 border-t border-line pt-4"><h3 className="mb-2 text-sm font-medium">Test the assistant</h3>
            <div className="flex gap-2"><input className="input" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="Ask it something it should know" aria-label="Test question" /><button className="btn btn-ghost !py-2 text-sm" disabled={asking} onClick={ask}>{asking ? <Spinner /> : "Ask"}</button></div>
            {ans && <div className="mt-3 rounded-[var(--r-md)] bg-raised p-3 text-sm"><p className="whitespace-pre-wrap text-fg">{ans.answer}</p><p className="mt-2 text-xs text-muted">Answered {ans.mode === "ai" ? "by AI, from your content" : "from your content (no AI key, or AI unavailable)"}.</p></div>}</div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 font-semibold">Added sources</h2>
      {loading ? <p className="flex items-center gap-2 text-fg2"><Spinner /> Loading…</p> : !items.length ? <Empty title="Nothing added yet">Add page links or a note above. Your site content is already learned.</Empty> : (
        <div className="glass divide-y divide-line">{items.map((i) => (
          <div key={i.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="chip !px-2 !py-0.5 !text-[0.7rem]">{i.kind === "url" ? "Page" : "Note"}</span>
            <div className="min-w-0 flex-1"><p className="truncate font-medium text-fg">{i.title || i.url}</p>
              {i.kind === "url" && <a href={i.url} target="_blank" rel="noopener" className="block truncate text-xs text-accent hover:underline">{i.url}</a>}
              {i.status === "error" ? <p className="text-xs text-danger">{i.error || "Could not be read"}</p> : <p className="truncate text-xs text-muted">{i.chars} characters · {fmt(i.fetchedAt || i.createdAt)}</p>}</div>
            <div className="flex gap-3 text-sm">
              {i.kind === "url" ? <button className="text-accent hover:underline" disabled={!!busy} onClick={() => refresh(i.id)}>{busy === "r" + i.id ? <Spinner /> : "Re-read"}</button> : <button className="text-accent hover:underline" onClick={() => openNote(i.id)}>Edit</button>}
              <button className="text-danger hover:underline" onClick={async () => { if (!confirm("Remove this source? The assistant will forget it.")) return; await apiFetch(`/api/admin/chat-sources?id=${i.id}`, { method: "DELETE" }); load(); }}>Remove</button>
            </div>
          </div>))}</div>
      )}

      <Modal open={!!note} onClose={() => setNote(null)} title={note?.id ? "Edit note" : "New note"} wide>
        {note && <div className="space-y-3">
          <div><label className="label" htmlFor="cn-title">Topic</label><input id="cn-title" className="input" value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} placeholder="e.g. Refund policy" /></div>
          <div><label className="label" htmlFor="cn-body">What the assistant should know</label><textarea id="cn-body" className="input h-56" value={note.content} onChange={(e) => setNote({ ...note, content: e.target.value })} placeholder="Write it the way you would explain it to a customer. Bengali or English both work." /></div>
          <div className="flex gap-2"><button className="btn btn-primary !py-2 text-sm" disabled={busy === "note"} onClick={saveNote}>{busy === "note" ? <Spinner /> : "Save note"}</button><button className="btn btn-ghost !py-2 text-sm" onClick={() => setNote(null)}>Cancel</button></div>
        </div>}
      </Modal>
    </>
  );
}
