"use client";
import { useEffect, useState } from "react";
import { apiFetch, Empty, fmt, PageHead, Spinner, Tabs, Toggle, toast } from "./ui";
import { EmailEditor } from "./EmailBuilder";
import { renderEmail, type EmailBrand, type EmailDoc } from "@/lib/email-blocks";
import { LEAD_LABELS, LEAD_STATUSES } from "@/lib/lead-status";

interface Doc { id?: number; kind: "campaign" | "template"; name: string; subject: string; preheader: string; html: string; blocks: EmailDoc | null; audience: { verifiedOnly: boolean; statuses: string[]; source: string; ids: number[] }; status?: string; sent?: number; failed?: number; total?: number }
const blank = (kind: Doc["kind"]): Doc => ({ kind, name: "", subject: "", preheader: "", html: "", blocks: null, audience: { verifiedOnly: true, statuses: [], source: "", ids: [] } });
const STEPS = [["design", "1. Design the email"], ["audience", "2. Choose who gets it"], ["send", "3. Test and send"]] as const;

export function EmailMarketing() {
  const [tab, setTab] = useState("Campaigns");
  const [templates, setTemplates] = useState<any[]>([]); const [starters, setStarters] = useState<any[]>([]); const [brand, setBrand] = useState<EmailBrand>({ name: "Your Agency", logo: "", accent: "#1E5CF2" });
  const [campaigns, setCampaigns] = useState<any[]>([]); const [stats, setStats] = useState({ total: 0, verified: 0, unsub: 0 });
  const [edit, setEdit] = useState<Doc | null>(null); const [step, setStep] = useState<(typeof STEPS)[number][0]>("design");
  const [busy, setBusy] = useState(""); const [progress, setProgress] = useState<{ id: number; sent: number; failed: number; total: number } | null>(null);
  const [count, setCount] = useState<number | null>(null); const [testTo, setTestTo] = useState("");
  const loadAll = () => {
    apiFetch("/api/admin/email-templates").then((r) => setTemplates(r.items)).catch((e) => toast(e.message, "error"));
    apiFetch("/api/admin/campaigns").then((r) => { setCampaigns(r.items); setStats(r.stats); }).catch((e) => toast(e.message, "error"));
  };
  useEffect(() => {
    loadAll();
    apiFetch("/api/admin/email-templates?starters=1").then((r) => { setStarters(r.starters); setBrand(r.brand); }).catch(() => {});
    // arrive from Leads: ?ids=1,2,3 (selected leads) or ?new=1
    const p = new URLSearchParams(location.search); const ids = (p.get("ids") || "").split(",").map(Number).filter((n) => n > 0);
    if (ids.length || p.get("new")) { const d = blank("campaign"); if (ids.length) { d.audience = { verifiedOnly: false, statuses: [], source: "", ids }; d.name = ids.length === 1 ? "Email to one lead" : `Email to ${ids.length} selected leads`; } setEdit(d); setStep("design"); history.replaceState(null, "", location.pathname); }
  }, []); // eslint-disable-line
  const aud = edit?.audience;
  useEffect(() => { setCount(null); if (edit?.kind !== "campaign" || !aud) return; const t = setTimeout(() => apiFetch("/api/admin/campaigns", { method: "POST", json: { action: "count", audience: aud } }).then((r) => setCount(r.count)).catch(() => {}), 300); return () => clearTimeout(t); }, [JSON.stringify(aud), edit?.kind]); // eslint-disable-line

  const fromStarter = (v: string) => {
    if (!edit) return; const [k, i] = v.split(":"); const idx = Number(i);
    if (edit.html && !confirm("Replace the current design with this layout?")) return;
    if (k === "s") { const s = starters[idx]; if (s) setEdit({ ...edit, subject: edit.subject || s.subject, preheader: s.preheader, blocks: s.doc, html: renderEmail(s.doc, brand, s.preheader) }); }
    else { const t = templates[idx]; if (t) setEdit({ ...edit, subject: edit.subject || t.subject, preheader: t.preheader, blocks: t.blocks || null, html: t.html }); }
  };
  async function save(): Promise<number | null> {
    if (!edit) return null; if (!edit.name.trim()) { toast("Give it a name first (top of the page).", "error"); return null; }
    setBusy("save");
    try { const r = await apiFetch(edit.kind === "template" ? "/api/admin/email-templates" : "/api/admin/campaigns", { method: "POST", json: edit }); toast(edit.kind === "template" ? "Template saved." : "Draft saved."); setEdit({ ...edit, id: r.item.id }); loadAll(); return r.item.id; }
    catch (e: any) { toast(e.message, "error"); return null; } finally { setBusy(""); }
  }
  async function saveAsTemplate() {
    if (!edit) return; const name = prompt("Template name", edit.name || "My template"); if (!name) return;
    try { await apiFetch("/api/admin/email-templates", { method: "POST", json: { name, subject: edit.subject, preheader: edit.preheader, html: edit.html, blocks: edit.blocks } }); toast("Saved as a template."); loadAll(); } catch (e: any) { toast(e.message, "error"); }
  }
  async function sendTest() {
    if (!edit) return; setBusy("test");
    try { await apiFetch("/api/admin/campaigns/send", { method: "POST", json: { action: "test", to: testTo, subject: edit.subject, html: edit.html } }); toast("Test email sent. Check the inbox (and spam)."); } catch (e: any) { toast(e.message, "error"); } finally { setBusy(""); }
  }
  async function run(id: number, start: { sent: number; failed: number; total: number }) {
    setBusy("send"); setProgress({ id, ...start });
    try { for (let i = 0; i < 500; i++) { const r = await apiFetch("/api/admin/campaigns/send", { method: "POST", json: { id } }); setProgress({ id, sent: r.campaign.sent, failed: r.campaign.failed, total: r.campaign.total }); if (r.campaign.status === "sent") break; } toast("Campaign finished."); setEdit(null); }
    catch (e: any) { toast(e.message + " You can continue from the campaign list.", "error"); } finally { setBusy(""); setProgress(null); loadAll(); }
  }
  async function launch() {
    if (!edit) return;
    if (!edit.subject.trim() || !edit.html.trim()) { setStep("design"); return toast("Add a subject and design the email first.", "error"); }
    if (!count) return toast("No recipients match this audience.", "error");
    if (!confirm(`Send "${edit.name}" to ${count} contact${count === 1 ? "" : "s"} now?`)) return;
    const id = await save(); if (id) run(id, { sent: 0, failed: 0, total: count });
  }
  const pct = progress && progress.total ? Math.min(100, Math.round(((progress.sent + progress.failed) / progress.total) * 100)) : 0;
  const Progress = () => progress ? <div className="glass mb-5 p-4"><p className="mb-2 text-sm text-fg">Sending… {progress.sent + progress.failed} of {progress.total} <span className="text-muted">({progress.failed} failed). Keep this page open.</span></p><div className="h-2 overflow-hidden rounded-full bg-raised"><div className="h-full bg-accent transition-all" style={{ width: pct + "%" }} /></div></div> : null;

  if (edit) {
    const isCamp = edit.kind === "campaign"; const locked = isCamp && !!edit.status && edit.status !== "draft";
    const setA = (p: Partial<Doc["audience"]>) => setEdit({ ...edit, audience: { ...edit.audience, ...p } });
    return (
      <>
        <PageHead title={edit.id ? `Edit ${isCamp ? "campaign" : "template"}` : `New ${isCamp ? "campaign" : "template"}`}>
          <button className="btn btn-ghost !py-2 text-sm" onClick={() => setEdit(null)} disabled={busy === "send"}>Back</button>
          {!locked && <button className="btn btn-ghost !py-2 text-sm" onClick={save} disabled={!!busy}>{busy === "save" ? <Spinner /> : isCamp ? "Save draft" : "Save template"}</button>}
        </PageHead>
        <Progress />
        <div className="glass mb-4 grid gap-4 p-5 sm:grid-cols-2"><div><label className="label" htmlFor="em-name">{isCamp ? "Campaign name (only you see this)" : "Template name"}</label><input id="em-name" className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} disabled={locked} placeholder={isCamp ? "e.g. October offer" : "e.g. Monthly newsletter"} /></div></div>
        {isCamp && <div className="mb-4 flex flex-wrap gap-2">{STEPS.map(([k, l]) => <button key={k} onClick={() => setStep(k)} className={`rounded-full border px-4 py-2 text-sm ${step === k ? "border-accent bg-accent/10 text-fg" : "border-line text-fg2 hover:text-fg"}`}>{l}</button>)}</div>}

        {(!isCamp || step === "design") && (
          <div className="glass p-5">
            {!locked && <div className="mb-4 flex flex-wrap items-end gap-3"><div className="min-w-[220px]"><label className="label" htmlFor="em-start">Start from a layout</label>
              <select id="em-start" className="input" value="" onChange={(e) => e.target.value && fromStarter(e.target.value)}><option value="">Choose a layout…</option>
                <optgroup label="Ready-made">{starters.map((s, i) => <option key={i} value={`s:${i}`}>{s.name}</option>)}</optgroup>
                {templates.length > 0 && <optgroup label="Your templates">{templates.map((t, i) => <option key={t.id} value={`t:${i}`}>{t.name}</option>)}</optgroup>}</select></div>
              {isCamp && edit.html && <button className="btn btn-ghost !py-2 text-sm" onClick={saveAsTemplate}>Save as template</button>}
              {isCamp && <button className="btn btn-primary !py-2 text-sm" onClick={() => setStep("audience")}>Next: choose who gets it</button>}</div>}
            <EmailEditor value={edit} onChange={(v) => setEdit({ ...edit, ...v })} brand={brand} />
          </div>
        )}

        {isCamp && step === "audience" && (
          <div className="glass grid gap-6 p-5 lg:grid-cols-2">
            <div className="space-y-5">
              {edit.audience.ids.length > 0 ? (
                <div className="rounded-[var(--r-md)] border border-accent/40 bg-accent/5 p-4 text-sm"><p className="font-medium text-fg">Sending to {edit.audience.ids.length} lead{edit.audience.ids.length === 1 ? "" : "s"} you selected</p><button className="mt-1 text-accent hover:underline" onClick={() => setA({ ids: [] })}>Choose by filters instead</button></div>
              ) : (<>
                <div><p className="label">Who should receive it?</p><div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setA({ verifiedOnly: true, statuses: [], source: "" })} className={`chip ${edit.audience.verifiedOnly && !edit.audience.statuses.length && !edit.audience.source ? "!border-accent !text-fg" : ""}`}>All verified leads</button>
                  <button type="button" onClick={() => setA({ verifiedOnly: false, statuses: [], source: "" })} className={`chip ${!edit.audience.verifiedOnly && !edit.audience.statuses.length && !edit.audience.source ? "!border-accent !text-fg" : ""}`}>Every lead with an email</button></div></div>
                <Toggle label="Verified emails only" help="People who confirmed their address, or whom you marked verified in Leads." checked={edit.audience.verifiedOnly} onChange={(v) => setA({ verifiedOnly: v })} />
                <div><p className="label">Only these stages (optional)</p><div className="flex flex-wrap gap-2">{LEAD_STATUSES.map((v) => { const on = edit.audience.statuses.includes(v); return <button key={v} type="button" onClick={() => setA({ statuses: on ? edit.audience.statuses.filter((x) => x !== v) : [...edit.audience.statuses, v] })} className={`chip ${on ? "!border-accent !text-fg" : ""}`}>{on ? "✓ " : ""}{LEAD_LABELS[v]}</button>; })}</div></div>
                <div><label className="label" htmlFor="em-src">Came from (optional)</label><input id="em-src" className="input" value={edit.audience.source} onChange={(e) => setA({ source: e.target.value })} placeholder="e.g. Houston, Chat, Contact" /></div>
              </>)}
              <button className="btn btn-primary !py-2 text-sm" onClick={() => setStep("send")}>Next: test and send</button>
            </div>
            <div className="rounded-[var(--r-md)] border border-line bg-raised/40 p-5"><p className="text-sm text-fg2">Recipients</p><p className="font-display text-5xl font-bold">{count === null ? <Spinner /> : count}</p><p className="mt-1 text-sm text-muted">Each email address once. People who unsubscribed are never included.</p>
              <p className="mt-4 text-sm text-fg2">Total in your CRM: {stats.total} · Verified: {stats.verified}</p></div>
          </div>
        )}

        {isCamp && step === "send" && (
          <div className="glass grid gap-6 p-5 lg:grid-cols-2">
            <div className="space-y-4"><h2 className="font-semibold">Test first</h2>
              <div><label className="label" htmlFor="em-test">Send a test to</label><div className="flex gap-2"><input id="em-test" className="input" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com (blank = your admin email)" /><button className="btn btn-ghost !py-2 text-sm" onClick={sendTest} disabled={!!busy || !edit.html}>{busy === "test" ? <Spinner /> : "Send test"}</button></div>
                <p className="mt-1 text-xs text-muted">The test uses sample name and links, and is marked [Test] in the subject.</p></div></div>
            <div className="space-y-3 rounded-[var(--r-md)] border border-line bg-raised/40 p-5"><h2 className="font-semibold">Ready to send</h2>
              <dl className="space-y-1.5 text-sm"><div className="flex justify-between gap-4"><dt className="text-fg2">Subject</dt><dd className="truncate text-fg">{edit.subject || "Missing"}</dd></div><div className="flex justify-between gap-4"><dt className="text-fg2">Recipients</dt><dd className="text-fg">{count === null ? "…" : count}</dd></div></dl>
              {!locked ? <button className="btn btn-primary w-full" onClick={launch} disabled={!!busy}>{busy === "send" ? <Spinner /> : `Send to ${count ?? "…"} contacts`}</button> : <p className="text-sm text-fg2">This campaign was already sent. Duplicate it from the list to send again.</p>}</div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PageHead title="Email campaigns" sub="Design an email once, then send it to every unique, verified lead in a few clicks.">
        <button className="btn btn-ghost !py-2 text-sm" onClick={() => { setEdit(blank("template")); setStep("design"); setTab("Templates"); }}>New template</button>
        <button className="btn btn-primary !py-2 text-sm" onClick={() => { setEdit(blank("campaign")); setStep("design"); }}>New campaign</button>
      </PageHead>
      <Progress />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">{[["Unique emails", stats.total], ["Verified (can receive campaigns)", stats.verified], ["Unsubscribed", stats.unsub]].map(([l, n]) => <div key={l as string} className="glass p-4"><p className="text-sm text-fg2">{l}</p><p className="font-display text-3xl font-bold">{n}</p></div>)}</div>
      <Tabs tabs={["Campaigns", "Templates"]} active={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === "Campaigns" && (!campaigns.length ? <Empty title="No campaigns yet">Click New campaign, pick a layout, choose your audience and send.</Empty> : (
          <div className="glass divide-y divide-line">{campaigns.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1"><p className="truncate font-medium text-fg">{c.name}</p><p className="truncate text-sm text-fg2">{c.subject || "No subject"}</p></div>
              <span className={`chip ${c.status === "sent" ? "!text-success" : ""}`}>{c.status}</span>
              <span className="text-sm text-fg2">{c.status === "draft" ? "Not sent" : `${c.sent}/${c.total} sent${c.failed ? `, ${c.failed} failed` : ""}`}</span>
              <span className="text-xs text-muted">{fmt(c.updatedAt)}</span>
              <div className="flex gap-3 text-sm">
                {c.status === "sending" && <button className="text-accent hover:underline" disabled={!!busy} onClick={() => run(c.id, { sent: c.sent, failed: c.failed, total: c.total })}>Continue sending</button>}
                <button className="text-accent hover:underline" onClick={() => { setEdit({ ...blank("campaign"), ...c, audience: { ...blank("campaign").audience, ...(c.audience || {}) }, kind: "campaign" }); setStep(c.status === "draft" ? "design" : "send"); }}>{c.status === "draft" ? "Edit" : "View"}</button>
                <button className="text-accent hover:underline" onClick={async () => { await apiFetch("/api/admin/campaigns", { method: "POST", json: { action: "duplicate", id: c.id } }); loadAll(); toast("Duplicated as a draft."); }}>Duplicate</button>
                <button className="text-danger hover:underline" onClick={async () => { if (!confirm("Delete this campaign?")) return; await apiFetch(`/api/admin/campaigns?id=${c.id}`, { method: "DELETE" }); loadAll(); }}>Delete</button>
              </div>
            </div>))}</div>
        ))}
        {tab === "Templates" && (!templates.length ? <Empty title="No saved templates">Design an email in a campaign and use Save as template, or click New template.</Empty> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{templates.map((t) => (
            <div key={t.id} className="glass overflow-hidden"><div className="h-44 overflow-hidden border-b border-line bg-white"><iframe title={t.name} sandbox="" srcDoc={t.html} className="pointer-events-none h-[560px] w-[200%] origin-top-left scale-50 border-0" /></div>
              <div className="p-4"><p className="font-medium text-fg">{t.name}</p><p className="truncate text-sm text-fg2">{t.subject || "No subject"}</p>
                <div className="mt-3 flex gap-3 text-sm"><button className="text-accent hover:underline" onClick={() => { setEdit({ ...blank("template"), ...t, blocks: t.blocks || null, kind: "template" }); setStep("design"); }}>Edit</button>
                  <button className="text-accent hover:underline" onClick={() => { setEdit({ ...blank("campaign"), name: "", subject: t.subject, preheader: t.preheader, html: t.html, blocks: t.blocks || null }); setStep("design"); }}>Use in campaign</button>
                  <button className="text-danger hover:underline" onClick={async () => { if (!confirm("Delete this template?")) return; await apiFetch(`/api/admin/email-templates?id=${t.id}`, { method: "DELETE" }); loadAll(); }}>Delete</button></div></div></div>))}</div>
        ))}
      </div>
    </>
  );
}
