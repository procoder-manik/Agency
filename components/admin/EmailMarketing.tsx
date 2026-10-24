"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, Empty, fmt, PageHead, Spinner, Tabs, Toggle, toast } from "./ui";

const VARS = ["firstName", "name", "email", "company", "siteName", "siteUrl", "unsubscribeUrl", "verifyUrl", "year"];
const SAMPLE: Record<string, string> = { firstName: "Alex", name: "Alex Example", email: "alex@example.com", company: "Example Co", siteName: "Your Agency", siteUrl: "https://example.com", unsubscribeUrl: "#", verifyUrl: "#", year: String(new Date().getFullYear()) };
const fillSample = (h: string) => h.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => SAMPLE[k] ?? "");
const STATUSES = [["new", "New"], ["contacted", "Contacted"], ["won", "Won"], ["lost", "Lost"]];

interface Doc { id?: number; name: string; subject: string; preheader: string; html: string; audience?: { verifiedOnly: boolean; statuses: string[]; source: string }; status?: string; sent?: number; failed?: number; total?: number }
const blank = (): Doc => ({ name: "", subject: "", preheader: "", html: "", audience: { verifiedOnly: true, statuses: [], source: "" } });

/** Shared HTML editor with live preview and variable chips. */
function HtmlEditor({ doc, set, templates, starters, readOnly }: { doc: Doc; set: (d: Doc) => void; templates: any[]; starters: any[]; readOnly?: boolean }) {
  const ta = useRef<HTMLTextAreaElement>(null); const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const insert = (v: string) => { const el = ta.current; const t = `{{${v}}}`; if (!el) return set({ ...doc, html: doc.html + t }); const a = el.selectionStart, b = el.selectionEnd; set({ ...doc, html: doc.html.slice(0, a) + t + doc.html.slice(b) }); setTimeout(() => { el.focus(); el.setSelectionRange(a + t.length, a + t.length); }, 0); };
  const load = (v: string) => { const [kind, i] = v.split(":"); const src = kind === "t" ? templates[Number(i)] : starters[Number(i)]; if (src && (!doc.html || confirm("Replace the current HTML with this layout?"))) set({ ...doc, html: src.html, subject: doc.subject || src.subject, preheader: doc.preheader || src.preheader }); };
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="space-y-3">
        {!readOnly && <div><label className="label">Start from a layout</label>
          <select className="input" value="" onChange={(e) => e.target.value && load(e.target.value)}><option value="">Choose a layout…</option>
            <optgroup label="Ready-made">{starters.map((s, i) => <option key={i} value={`s:${i}`}>{s.name}</option>)}</optgroup>
            {templates.length > 0 && <optgroup label="Your saved templates">{templates.map((s, i) => <option key={s.id} value={`t:${i}`}>{s.name}</option>)}</optgroup>}
          </select></div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Subject</label><input className="input" value={doc.subject} onChange={(e) => set({ ...doc, subject: e.target.value })} placeholder="Hi {{firstName}}, a quick offer" disabled={readOnly} /></div>
          <div><label className="label">Preview text</label><input className="input" value={doc.preheader} onChange={(e) => set({ ...doc, preheader: e.target.value })} placeholder="Shown next to the subject in the inbox" disabled={readOnly} /></div>
        </div>
        <div><label className="label">HTML</label>
          <textarea ref={ta} className="input h-[420px] font-mono text-xs leading-relaxed" spellCheck={false} value={doc.html} onChange={(e) => set({ ...doc, html: e.target.value })} disabled={readOnly} placeholder="Paste or write your email HTML here, or pick a ready-made layout above." />
          <div className="mt-2 flex flex-wrap gap-1.5">{VARS.map((v) => <button key={v} type="button" onClick={() => insert(v)} disabled={readOnly} className="chip hover:!border-accent hover:!text-fg">{`{{${v}}}`}</button>)}</div>
          <p className="mt-2 text-xs text-muted">Use inline styles and tables for the best result in Gmail and Outlook. Scripts are removed. An unsubscribe link is added automatically if you leave it out.</p>
        </div>
      </div>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="mb-2 flex items-center justify-between"><p className="text-sm text-fg2">Live preview</p>
          <div className="flex rounded-full border border-line p-0.5 text-xs">{(["desktop", "mobile"] as const).map((m) => <button key={m} type="button" onClick={() => setView(m)} className={`rounded-full px-3 py-1 capitalize ${view === m ? "bg-accent text-onaccent" : "text-fg2"}`}>{m}</button>)}</div></div>
        <div className="overflow-hidden rounded-[var(--r-lg)] border border-line bg-white">
          {doc.html ? <iframe title="Email preview" sandbox="" srcDoc={fillSample(doc.html)} className="mx-auto block h-[560px] border-0 bg-white" style={{ width: view === "mobile" ? 375 : "100%", maxWidth: "100%" }} /> : <div className="grid h-[560px] place-items-center text-sm text-slate-500">Your email appears here</div>}
        </div>
      </div>
    </div>
  );
}

export function EmailMarketing() {
  const [tab, setTab] = useState("Campaigns");
  const [templates, setTemplates] = useState<any[]>([]); const [starters, setStarters] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]); const [stats, setStats] = useState({ total: 0, verified: 0, unsub: 0 });
  const [edit, setEdit] = useState<(Doc & { kind: "campaign" | "template" }) | null>(null);
  const [busy, setBusy] = useState(""); const [progress, setProgress] = useState<{ id: number; sent: number; failed: number; total: number } | null>(null);
  const [count, setCount] = useState<number | null>(null); const [testTo, setTestTo] = useState("");
  const loadAll = () => {
    apiFetch("/api/admin/email-templates").then((r) => setTemplates(r.items)).catch((e) => toast(e.message, "error"));
    apiFetch("/api/admin/campaigns").then((r) => { setCampaigns(r.items); setStats(r.stats); }).catch((e) => toast(e.message, "error"));
  };
  useEffect(() => { loadAll(); apiFetch("/api/admin/email-templates?starters=1").then((r) => setStarters(r.starters)).catch(() => {}); }, []);
  const aud = edit?.audience;
  useEffect(() => { setCount(null); if (edit?.kind !== "campaign" || !aud) return; const t = setTimeout(() => apiFetch("/api/admin/campaigns", { method: "POST", json: { action: "count", audience: aud } }).then((r) => setCount(r.count)).catch(() => {}), 350); return () => clearTimeout(t); }, [JSON.stringify(aud), edit?.kind]); // eslint-disable-line

  async function save(): Promise<number | null> {
    if (!edit) return null; setBusy("save");
    try {
      const url = edit.kind === "template" ? "/api/admin/email-templates" : "/api/admin/campaigns";
      const r = await apiFetch(url, { method: "POST", json: edit }); toast(edit.kind === "template" ? "Template saved." : "Campaign saved."); setEdit({ ...edit, id: r.item.id }); loadAll(); return r.item.id;
    } catch (e: any) { toast(e.message, "error"); return null; } finally { setBusy(""); }
  }
  async function sendTest() {
    if (!edit) return; setBusy("test");
    try { await apiFetch("/api/admin/campaigns/send", { method: "POST", json: { action: "test", to: testTo, subject: edit.subject, html: edit.html } }); toast("Test email sent."); } catch (e: any) { toast(e.message, "error"); } finally { setBusy(""); }
  }
  async function launch() {
    if (!edit) return;
    if (!edit.subject.trim() || !edit.html.trim()) return toast("Add a subject and the email HTML first.", "error");
    if (!count) return toast("No recipients match this audience.", "error");
    if (!confirm(`Send "${edit.name}" to ${count} unique ${aud?.verifiedOnly ? "verified " : ""}contact${count === 1 ? "" : "s"} now?`)) return;
    const id = await save(); if (!id) return; setBusy("send"); setProgress({ id, sent: 0, failed: 0, total: count });
    try {
      for (let i = 0; i < 500; i++) {
        const r = await apiFetch("/api/admin/campaigns/send", { method: "POST", json: { id } });
        setProgress({ id, sent: r.campaign.sent, failed: r.campaign.failed, total: r.campaign.total });
        if (r.campaign.status === "sent") break;
      }
      toast("Campaign finished."); setEdit(null); loadAll();
    } catch (e: any) { toast(e.message + " You can reopen the campaign list and continue later.", "error"); loadAll(); } finally { setBusy(""); setProgress(null); }
  }
  async function resume(c: any) { setBusy("send"); setProgress({ id: c.id, sent: c.sent, failed: c.failed, total: c.total }); try { for (let i = 0; i < 500; i++) { const r = await apiFetch("/api/admin/campaigns/send", { method: "POST", json: { id: c.id } }); setProgress({ id: c.id, sent: r.campaign.sent, failed: r.campaign.failed, total: r.campaign.total }); if (r.campaign.status === "sent") break; } toast("Campaign finished."); } catch (e: any) { toast(e.message, "error"); } finally { setBusy(""); setProgress(null); loadAll(); } }

  const pct = progress && progress.total ? Math.min(100, Math.round(((progress.sent + progress.failed) / progress.total) * 100)) : 0;

  if (edit) {
    const isCamp = edit.kind === "campaign"; const locked = isCamp && !!edit.status && edit.status !== "draft";
    return (
      <>
        <PageHead title={edit.id ? `Edit ${isCamp ? "campaign" : "template"}` : `New ${isCamp ? "campaign" : "template"}`}>
          <button className="btn btn-ghost !py-2 text-sm" onClick={() => setEdit(null)} disabled={busy === "send"}>Back</button>
          {!locked && <button className="btn btn-ghost !py-2 text-sm" onClick={save} disabled={!!busy}>{busy === "save" ? <Spinner /> : isCamp ? "Save draft" : "Save template"}</button>}
          {isCamp && !locked && <button className="btn btn-primary !py-2 text-sm" onClick={launch} disabled={!!busy}>{busy === "send" ? <Spinner /> : "Send campaign"}</button>}
        </PageHead>
        {progress && <div className="glass mb-5 p-4"><p className="mb-2 text-sm text-fg">Sending… {progress.sent + progress.failed} of {progress.total} <span className="text-muted">({progress.failed} failed). Keep this page open.</span></p><div className="h-2 overflow-hidden rounded-full bg-raised"><div className="h-full bg-accent transition-all" style={{ width: pct + "%" }} /></div></div>}
        <div className="glass mb-5 grid gap-4 p-5 sm:grid-cols-2"><div><label className="label">{isCamp ? "Campaign name (internal)" : "Template name"}</label><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} disabled={locked} /></div></div>
        <div className="glass p-5"><HtmlEditor doc={edit} set={(d) => setEdit({ ...edit, ...d })} templates={templates} starters={starters} readOnly={locked} /></div>
        {isCamp && edit.audience && (
          <div className="glass mt-5 grid gap-5 p-5 lg:grid-cols-2">
            <div className="space-y-4"><p className="font-medium">Audience</p>
              <Toggle label="Verified emails only" help="People who confirmed their address from the confirmation email, or that you marked verified in Leads." checked={edit.audience.verifiedOnly} onChange={(v) => setEdit({ ...edit, audience: { ...edit.audience!, verifiedOnly: v } })} />
              <div><p className="label">Lead status</p><div className="flex flex-wrap gap-2">{STATUSES.map(([v, l]) => { const on = edit.audience!.statuses.includes(v); return <button key={v} type="button" onClick={() => setEdit({ ...edit, audience: { ...edit.audience!, statuses: on ? edit.audience!.statuses.filter((x) => x !== v) : [...edit.audience!.statuses, v] } })} className={`chip ${on ? "!border-accent !text-fg" : ""}`}>{on ? "✓ " : ""}{l}</button>; })}</div><p className="mt-1 text-xs text-muted">None selected means all statuses.</p></div>
              <div><label className="label">Source contains (optional)</label><input className="input" value={edit.audience.source} onChange={(e) => setEdit({ ...edit, audience: { ...edit.audience!, source: e.target.value } })} placeholder="e.g. Houston, Chat, Contact" /></div>
            </div>
            <div className="space-y-4"><div className="rounded-[var(--r-md)] border border-line bg-raised/40 p-4"><p className="text-sm text-fg2">Recipients</p><p className="font-display text-4xl font-bold">{count === null ? <Spinner /> : count}</p><p className="text-xs text-muted">Unique emails. Unsubscribed people are always excluded.</p></div>
              <div><label className="label">Send a test email to</label><div className="flex gap-2"><input className="input" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com (blank = your admin email)" /><button className="btn btn-ghost !py-2 text-sm" onClick={sendTest} disabled={!!busy || !edit.html}>{busy === "test" ? <Spinner /> : "Send test"}</button></div></div></div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PageHead title="Email marketing" sub="Design HTML templates, then send an offer to every unique, verified contact in one campaign.">
        <button className="btn btn-ghost !py-2 text-sm" onClick={() => { setEdit({ ...blank(), kind: "template" }); setTab("Templates"); }}>New template</button>
        <button className="btn btn-primary !py-2 text-sm" onClick={() => { setEdit({ ...blank(), kind: "campaign" }); }}>New campaign</button>
      </PageHead>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">{[["Unique emails", stats.total], ["Verified", stats.verified], ["Unsubscribed", stats.unsub]].map(([l, n]) => <div key={l as string} className="glass p-4"><p className="text-sm text-fg2">{l}</p><p className="font-display text-3xl font-bold">{n}</p></div>)}</div>
      <Tabs tabs={["Campaigns", "Templates"]} active={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === "Campaigns" && (!campaigns.length ? <Empty title="No campaigns yet">Create a campaign to send an offer to your verified contacts.</Empty> : (
          <div className="glass divide-y divide-line">{campaigns.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1"><p className="truncate font-medium text-fg">{c.name}</p><p className="truncate text-sm text-fg2">{c.subject || "No subject"}</p></div>
              <span className={`chip ${c.status === "sent" ? "!text-success" : ""}`}>{c.status}</span>
              <span className="text-sm text-fg2">{c.status === "draft" ? "Not sent" : `${c.sent}/${c.total} sent${c.failed ? `, ${c.failed} failed` : ""}`}</span>
              <span className="text-xs text-muted">{fmt(c.updatedAt)}</span>
              <div className="flex gap-3 text-sm">
                {c.status === "sending" && <button className="text-accent hover:underline" disabled={!!busy} onClick={() => resume(c)}>{busy === "send" && progress?.id === c.id ? `${pct}%` : "Continue sending"}</button>}
                <button className="text-accent hover:underline" onClick={() => setEdit({ ...c, kind: "campaign" })}>{c.status === "draft" ? "Edit" : "View"}</button>
                <button className="text-accent hover:underline" onClick={async () => { await apiFetch("/api/admin/campaigns", { method: "POST", json: { action: "duplicate", id: c.id } }); loadAll(); toast("Duplicated as a draft."); }}>Duplicate</button>
                <button className="text-danger hover:underline" onClick={async () => { if (!confirm("Delete this campaign?")) return; await apiFetch(`/api/admin/campaigns?id=${c.id}`, { method: "DELETE" }); loadAll(); }}>Delete</button>
              </div>
            </div>))}</div>
        ))}
        {tab === "Templates" && (!templates.length ? <Empty title="No saved templates">Create a template once and reuse it in every campaign. Ready-made layouts are available inside the editor.</Empty> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{templates.map((t) => (
            <div key={t.id} className="glass overflow-hidden"><div className="h-44 overflow-hidden border-b border-line bg-white"><iframe title={t.name} sandbox="" srcDoc={fillSample(t.html)} className="pointer-events-none h-[560px] w-[200%] origin-top-left scale-50 border-0" /></div>
              <div className="p-4"><p className="font-medium text-fg">{t.name}</p><p className="truncate text-sm text-fg2">{t.subject || "No subject"}</p>
                <div className="mt-3 flex gap-3 text-sm"><button className="text-accent hover:underline" onClick={() => setEdit({ ...t, kind: "template" })}>Edit</button>
                  <button className="text-accent hover:underline" onClick={() => setEdit({ ...blank(), name: "", subject: t.subject, preheader: t.preheader, html: t.html, kind: "campaign" })}>Use in campaign</button>
                  <button className="text-danger hover:underline" onClick={async () => { if (!confirm("Delete this template?")) return; await apiFetch(`/api/admin/email-templates?id=${t.id}`, { method: "DELETE" }); loadAll(); }}>Delete</button></div></div></div>))}</div>
        ))}
      </div>
    </>
  );
}
