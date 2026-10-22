import { getSetting } from "../settings";

export type ProviderId = "gemini" | "groq" | "openrouter" | "openai" | "anthropic";
export interface GenInput { system: string; prompt: string; json?: boolean; maxTokens?: number }
export interface GenOutput { text: string; provider: ProviderId; model: string }

const ENV: Record<ProviderId, string> = { gemini: "GEMINI_API_KEY", groq: "GROQ_API_KEY", openrouter: "OPENROUTER_API_KEY", openai: "OPENAI_API_KEY", anthropic: "ANTHROPIC_API_KEY" };
const PREFERRED: Record<ProviderId, string[]> = {
  gemini: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"],
  groq: ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "llama-3.1-8b-instant"],
  openrouter: ["meta-llama/llama-3.3-70b-instruct:free", "deepseek/deepseek-chat-v3-0324:free", "google/gemini-2.0-flash-exp:free"],
  openai: ["gpt-4o-mini"],
  anthropic: ["claude-haiku-4-5"],
};

export async function providerKeys() {
  const ai = await getSetting("ai");
  const out: Partial<Record<ProviderId, string>> = {};
  for (const p of Object.keys(ENV) as ProviderId[]) { const k = (ai.keys as any)?.[p] || process.env[ENV[p]]; if (k) out[p] = k; }
  const order = (ai.order as ProviderId[]).filter((p) => out[p]);
  return { keys: out, order };
}
export async function aiAvailable() { return (await providerKeys()).order.length > 0; }

// ---- free-tier model discovery (cached 6h) ----
const discovered = new Map<string, { at: number; models: string[] }>();
async function models(p: ProviderId, key: string): Promise<string[]> {
  const hit = discovered.get(p);
  if (hit && Date.now() - hit.at < 6 * 3600_000) return hit.models;
  let list: string[] = [];
  try {
    if (p === "gemini") {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=200`, { signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      const avail: string[] = (j.models || []).filter((m: any) => m.supportedGenerationMethods?.includes("generateContent")).map((m: any) => String(m.name).replace("models/", ""));
      list = [...PREFERRED.gemini.filter((m) => avail.includes(m)), ...avail.filter((m) => /flash/.test(m) && !/(image|tts|audio|live|thinking|exp)/.test(m) && !PREFERRED.gemini.includes(m))].slice(0, 4);
    } else if (p === "openrouter") {
      const r = await fetch("https://openrouter.ai/api/v1/models", { signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      const free: string[] = (j.data || []).filter((m: any) => String(m.id).endsWith(":free") && (m.context_length || 0) >= 16000).map((m: any) => m.id);
      list = [...PREFERRED.openrouter.filter((m) => free.includes(m)), ...free.filter((m) => !PREFERRED.openrouter.includes(m))].slice(0, 4);
    } else if (p === "groq") {
      const r = await fetch("https://api.groq.com/openai/v1/models", { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      const avail: string[] = (j.data || []).map((m: any) => m.id);
      list = PREFERRED.groq.filter((m) => avail.includes(m));
    }
  } catch {}
  if (!list.length) list = PREFERRED[p];
  discovered.set(p, { at: Date.now(), models: list });
  return list;
}

class RateLimited extends Error {}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call(p: ProviderId, key: string, model: string, i: GenInput): Promise<string> {
  const max = i.maxTokens || 4000;
  let res: Response;
  if (p === "gemini") {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(60000),
      body: JSON.stringify({ systemInstruction: { parts: [{ text: i.system }] }, contents: [{ role: "user", parts: [{ text: i.prompt }] }],
        generationConfig: { maxOutputTokens: max, temperature: 0.7, ...(i.json ? { responseMimeType: "application/json" } : {}) } }),
    });
  } else if (p === "anthropic") {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, signal: AbortSignal.timeout(60000),
      body: JSON.stringify({ model, max_tokens: max, system: i.system, messages: [{ role: "user", content: i.prompt }] }),
    });
  } else {
    const url = { groq: "https://api.groq.com/openai/v1/chat/completions", openrouter: "https://openrouter.ai/api/v1/chat/completions", openai: "https://api.openai.com/v1/chat/completions" }[p];
    res = await fetch(url, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(60000),
      body: JSON.stringify({ model, max_tokens: max, temperature: 0.7, messages: [{ role: "system", content: i.system }, { role: "user", content: i.prompt }], ...(i.json && p !== "openrouter" ? { response_format: { type: "json_object" } } : {}) }),
    });
  }
  if (res.status === 429) throw new RateLimited(`${p} rate limit`);
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${p}/${model}: ${j?.error?.message || res.status}`);
  const text = p === "gemini" ? j.candidates?.[0]?.content?.parts?.map((x: any) => x.text).join("") : p === "anthropic" ? j.content?.map((c: any) => c.text || "").join("") : j.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${p}/${model}: empty response`);
  return text;
}

/** Provider-agnostic generation: tries every configured provider and up to two models each,
 *  retrying once after a short wait when a provider rate-limits (HTTP 429). */
export async function generate(i: GenInput): Promise<GenOutput> {
  const { keys, order } = await providerKeys();
  if (!order.length) throw new Error("No AI provider is configured. Add a free Gemini, Groq or OpenRouter key in Admin > AI.");
  const errors: string[] = [];
  for (const p of order) {
    const list = (await models(p, keys[p]!)).slice(0, 2);
    for (const model of list) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try { return { text: await call(p, keys[p]!, model, i), provider: p, model }; }
        catch (e: any) {
          if (e instanceof RateLimited && attempt === 0) { await sleep(2500); continue; }
          errors.push(e.message); break;
        }
      }
    }
  }
  throw new Error("Every AI provider failed: " + errors.slice(-3).join(" | "));
}

export function parseJson<T = any>(text: string): T {
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const a = clean.indexOf("{"), b = clean.lastIndexOf("}");
  if (a >= 0 && b > a) return JSON.parse(clean.slice(a, b + 1));
  throw new Error("The AI reply wasn't valid JSON. Try again.");
}
