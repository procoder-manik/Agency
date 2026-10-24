import { esc } from "./email";
import { getBrand } from "./email-templates";

/** Small branded confirmation page used by the verify / unsubscribe links. */
export async function messagePage(title: string, text: string, action?: { label: string; href: string }) {
  const b = await getBrand();
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title></head>
<body style="margin:0;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;color:#334155"><div style="max-width:520px;margin:12vh auto;padding:0 16px"><div style="background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden"><div style="height:5px;background:linear-gradient(90deg,${b.accent},${b.accent2})"></div><div style="padding:36px">
<p style="margin:0 0 18px;font-weight:700;font-size:18px;color:#0F172A">${esc(b.name)}</p><h1 style="margin:0 0 12px;font-size:24px;color:#0F172A">${esc(title)}</h1><p style="margin:0 0 24px;line-height:1.6">${esc(text)}</p>
${action ? `<a href="${esc(action.href)}" style="display:inline-block;margin-right:10px;padding:12px 22px;background:${b.accent};color:#fff;border-radius:10px;text-decoration:none;font-weight:700">${esc(action.label)}</a>` : ""}<a href="${esc(b.url)}" style="color:${b.accent};font-weight:700;text-decoration:none">Back to ${esc(b.name)}</a></div></div></div></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
