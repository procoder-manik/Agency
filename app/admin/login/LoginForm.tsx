"use client";
import { useState } from "react";

export function LoginForm() {
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [twofa, setTwofa] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), password: fd.get("password"), code: fd.get("code") || undefined }) });
    const j = await r.json().catch(() => ({}));
    if (j.twofa) setTwofa(true);
    if (r.ok && !j.twofa) window.location.href = "/admin"; else if (j.twofa && r.ok) setBusy(false); else { setErr(j.error || "Sign-in failed."); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
      <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="input" /></div>
      {twofa && <div><label className="label" htmlFor="code">6-digit code from your authenticator app</label><input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required autoFocus className="input" /></div>}
      {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
