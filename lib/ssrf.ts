import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function privateIp(ip: string) {
  if (ip.includes(":")) { const l = ip.toLowerCase(); return l === "::1" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l === "::" || l.startsWith("::ffff:127.") || l.startsWith("::ffff:10.") || l.startsWith("::ffff:192.168."); }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

/** Fetch a user-supplied URL safely: http(s) only, public IPs only, no redirects to private hosts, size and time limits. */
export async function safeFetchText(raw: string, maxBytes = 400_000, asHtml = false): Promise<string> {
  let url = new URL(raw);
  for (let hop = 0; hop < 4; hop++) {
    if (!/^https?:$/.test(url.protocol)) throw new Error("Only http and https URLs are allowed.");
    const host = url.hostname.replace(/^\[|\]$/g, "");
    const ips = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address);
    if (!ips.length || ips.some(privateIp)) throw new Error("That address points to a private network and can't be fetched.");
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10000), headers: { "user-agent": "AgencySiteBot/1.0" } });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) { url = new URL(res.headers.get("location")!, url); continue; }
    if (!res.ok) throw new Error(`The page returned HTTP ${res.status}.`);
    const reader = res.body?.getReader(); if (!reader) return "";
    const chunks: Uint8Array[] = []; let total = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; total += value.length; chunks.push(value); if (total > maxBytes) { reader.cancel(); break; } }
    const html = Buffer.concat(chunks).toString("utf8");
    if (asHtml) return html;
    return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 12000);
  }
  throw new Error("Too many redirects.");
}
