export const dynamic = "force-dynamic";
import { api, requireApi, HttpError } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { aiAvailable, providerKeys } from "@/lib/ai/providers";
import { runTask } from "@/lib/ai/tasks";
import { logAi } from "@/lib/ai/log";

export const maxDuration = 60;

export const GET = api(async () => { await requireApi(); const k = await providerKeys(); return { available: k.order.length > 0, providers: k.order }; });

/** One shared endpoint for every "Write with AI" control; the `task` parameter picks the job. */
export const POST = api(async (req: Request) => {
  const u = await requireApi();
  if (!rateLimit("ai:" + u.uid, 40, 60_000)) throw new HttpError(429, "Too many AI requests. Wait a minute.");
  if (!(await aiAvailable())) throw new HttpError(400, "AI is off: add a free Gemini, Groq or OpenRouter key in Admin > AI.");
  const body = await req.json();
  const task = String(body.task || "");
  try {
    const r = await runTask(task, body);
    await logAi(u.email, task, r.provider, r.model, body.label || body.collection || body.topic || body.title || body.name || "");
    return { data: r.data, provider: r.provider, model: r.model };
  } catch (e: any) {
    await logAi(u.email, task, "", "", e.message, false);
    throw new HttpError(502, e.message);
  }
});
