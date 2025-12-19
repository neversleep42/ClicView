import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import { z } from "npm:zod@3.23.8";

const bodySchema = z.object({
  runId: z.string().uuid(),
});

const geminiOutputSchema = z.object({
  intent: z.string().min(1).max(200),
  urgency: z.enum(["low", "medium", "high"]),
  confidence: z.number().int().min(0).max(100),
  sentiment: z.number().int().min(1).max(10),
  draftResponse: z.string().min(1).max(20_000),
});

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) {
    return JSON.parse(fenceMatch[1]);
  }

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) throw new Error("Model did not return JSON.");

  return JSON.parse(trimmed.slice(first, last + 1));
}

async function runGemini(opts: {
  apiKey: string;
  model: string;
  persona: "professional" | "friendly" | "concise";
  maxWords: number;
  toneValue: number;
  ticket: { subject: string; content: string; category: string; priority: string };
  customer: { name: string | null; email: string | null };
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  const system = [
    "You are a customer support agent.",
    "Return ONLY a single JSON object (no markdown, no extra text).",
    "The JSON schema must be:",
    '{ "intent": string, "urgency": "low"|"medium"|"high", "confidence": 0..100, "sentiment": 1..10, "draftResponse": string }',
    `Persona: ${opts.persona}.`,
    `Max response length: ${opts.maxWords} words.`,
    `Tone strength (0..100): ${opts.toneValue}.`,
    "Write a helpful, realistic email response. Do not mention internal policies you are unsure about.",
  ].join("\n");

  const user = [
    `Customer name: ${opts.customer.name ?? "Unknown"}`,
    `Customer email: ${opts.customer.email ?? "Unknown"}`,
    `Category: ${opts.ticket.category}`,
    `Priority: ${opts.ticket.priority}`,
    `Subject: ${opts.ticket.subject}`,
    "Content:",
    opts.ticket.content,
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: system }] },
          { role: "user", parts: [{ text: user }] },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    });

    const payloadUnknown = await res.json().catch(() => null);
    const payload = payloadUnknown as GeminiGenerateContentResponse | null;
    if (!res.ok) {
      const message = typeof payload?.error?.message === "string" ? payload.error.message : `Gemini request failed (${res.status}).`;
      throw new Error(message);
    }

    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    const text =
      parts
        .map((part) => part.text)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .join("\n") ?? "";
    const parsed = extractJsonObject(String(text));
    const validated = geminiOutputSchema.parse(parsed);
    return validated;
  } finally {
    clearTimeout(timeout);
  }
}

function inferUrgency(priority: string, content: string): "low" | "medium" | "high" {
  const text = `${priority} ${content}`.toLowerCase();
  if (priority === "high") return "high";
  if (/\b(urgent|asap|immediately|now|today)\b/.test(text)) return "high";
  if (priority === "medium") return "medium";
  if (/\b(soon|tomorrow|this week)\b/.test(text)) return "medium";
  return "low";
}

function inferSentiment(content: string): number {
  const text = content.toLowerCase();
  let score = 6;
  if (/\b(thank|love|great|amazing|awesome)\b/.test(text)) score += 2;
  if (/\b(frustrat|angry|unacceptable|terrible|worst|hate)\b/.test(text)) score -= 3;
  if (/\b(refund|chargeback|fraud|scam)\b/.test(text)) score -= 2;
  if (/\b(please|help)\b/.test(text)) score -= 1;
  return clampInt(score, 1, 10);
}

function inferIntent(category: string, subject: string): string {
  const cat = category.toLowerCase();
  if (cat === "refund") return "Refund Request";
  if (cat === "shipping") return "Shipping Issue";
  if (cat === "product") return "Product Issue";
  if (cat === "billing") return "Billing Issue";
  return subject.length > 0 ? `General Inquiry: ${subject}` : "General Inquiry";
}

function buildDraft(opts: {
  persona: "professional" | "friendly" | "concise";
  customerName: string | null;
  category: string;
  subject: string;
  content: string;
}) {
  const name = opts.customerName?.split(" ")[0] || "there";

  const opener =
    opts.persona === "friendly"
      ? `Hi ${name}!`
      : opts.persona === "concise"
        ? `Hi ${name},`
        : `Hello ${name},`;

  const closer =
    opts.persona === "friendly"
      ? "Thanks again,\nSupport Team"
      : opts.persona === "concise"
        ? "Regards,\nSupport Team"
        : "Best regards,\nSupport Team";

  const coreByCategory: Record<string, string> = {
    refund:
      "Thanks for reaching out. I’m sorry the item didn’t arrive in the expected condition.\n\nCould you please confirm your order number and attach any photos of the issue? Once confirmed, we can proceed with a refund or a replacement—whichever you prefer.",
    shipping:
      "Thanks for reaching out. I’m sorry for the delay.\n\nPlease share your order number, and I’ll check the latest carrier scan and provide an updated delivery estimate. If the shipment is stuck, we can arrange a replacement or alternative delivery option.",
    product:
      "Thanks for reaching out.\n\nCould you share your order number and a quick description (or photo) of the issue? We’ll help troubleshoot and, if needed, arrange a repair or replacement under warranty.",
    billing:
      "Thanks for flagging this.\n\nPlease confirm the order number and the last 4 digits of the card used. If there’s a duplicate charge, we’ll void the extra authorization or process a refund right away.",
    general:
      "Thanks for reaching out.\n\nCan you share a bit more detail about what you need help with so we can assist quickly?",
  };

  const categoryKey = opts.category.toLowerCase();
  const core = coreByCategory[categoryKey] ?? coreByCategory.general;

  if (opts.persona === "concise") {
    return `${opener}\n\n${core}\n\n${closer}`;
  }

  return `${opener}\n\n${core}\n\n${closer}`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." } }, { status: 405 });

  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? null;
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? null;
  const geminiModel = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

  if (!serviceRoleKey && !anonKey) {
    return json(
      { error: { code: "INTERNAL", message: "Missing SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY." } },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!serviceRoleKey && !authHeader) {
    return json(
      { error: { code: "UNAUTHENTICATED", message: "Missing Authorization header." } },
      { status: 401 },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey ?? anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(serviceRoleKey
      ? {}
      : {
          global: {
            headers: {
              Authorization: authHeader!,
            },
          },
        }),
  });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." } }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid request body.", details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  const runId = parsed.data.runId;

  // Load run
  const { data: run, error: runError } = await supabaseAdmin
    .from("ai_runs")
    .select("id,org_id,ticket_id,status,started_at")
    .eq("id", runId)
    .maybeSingle();

  if (runError) return json({ error: { code: "INTERNAL", message: "Failed to load run." } }, { status: 500 });
  if (!run) return json({ error: { code: "NOT_FOUND", message: "Run not found." } }, { status: 404 });

  if (run.status === "done" || run.status === "error") {
    return json({ ok: true, runId, status: run.status });
  }

  // Set running + started_at if missing
  const startedAt = run.started_at ?? new Date().toISOString();
  const { error: startError } = await supabaseAdmin
    .from("ai_runs")
    .update({ status: "running", started_at: startedAt })
    .eq("id", runId);
  if (startError) return json({ error: { code: "INTERNAL", message: "Failed to start run." } }, { status: 500 });

  // Load ticket + customer + settings
  const { data: ticket, error: ticketError } = await supabaseAdmin
    .from("tickets")
    .select("id,org_id,latest_run_id,ai_status,status,draft_updated_at,subject,content,category,priority,customer_id,draft_response,confidence,sentiment")
    .eq("id", run.ticket_id)
    .maybeSingle();

  if (ticketError || !ticket) {
    await supabaseAdmin
      .from("ai_runs")
      .update({ status: "error", error: "Ticket not found.", finished_at: new Date().toISOString() })
      .eq("id", runId);
    return json({ error: { code: "NOT_FOUND", message: "Ticket not found." } }, { status: 404 });
  }

  const { data: settings } = await supabaseAdmin
    .from("ai_settings")
    .select("ai_enabled,selected_persona,max_response_length,tone_value,confidence_threshold")
    .eq("org_id", ticket.org_id)
    .maybeSingle();

  const aiEnabled = Boolean(settings?.ai_enabled);
  const persona = (settings?.selected_persona ?? "professional") as "professional" | "friendly" | "concise";
  const maxWords = clampInt(settings?.max_response_length ?? 250, 50, 2000);
  const toneValue = clampInt(settings?.tone_value ?? 50, 0, 100);

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("name,email")
    .eq("id", ticket.customer_id)
    .maybeSingle();

  try {
    const fallbackUrgency = inferUrgency(ticket.priority, ticket.content);
    const fallbackSentiment = inferSentiment(ticket.content);
    const fallbackConfidence = clampInt(65 + fallbackSentiment * 3, 0, 100);
    const fallbackIntent = inferIntent(ticket.category, ticket.subject);
    const fallbackDraft = buildDraft({
      persona,
      customerName: customer?.name ?? null,
      category: ticket.category,
      subject: ticket.subject,
      content: ticket.content,
    });

    const geminiResult = geminiApiKey
      ? await runGemini({
          apiKey: geminiApiKey,
          model: geminiModel,
          persona,
          maxWords,
          toneValue,
          ticket: { subject: ticket.subject, content: ticket.content, category: ticket.category, priority: ticket.priority },
          customer: { name: customer?.name ?? null, email: customer?.email ?? null },
        })
      : null;

    const urgency = geminiResult?.urgency ?? fallbackUrgency;
    const sentiment = geminiResult?.sentiment ?? fallbackSentiment;
    const confidence = geminiResult?.confidence ?? fallbackConfidence;
    const intent = geminiResult?.intent ?? fallbackIntent;
    const draftResponse = geminiResult?.draftResponse ?? fallbackDraft;

    const finishedAt = new Date().toISOString();

    // Always store outputs on ai_runs
    const { error: runUpdateError } = await supabaseAdmin
      .from("ai_runs")
      .update({
        status: "done",
        intent,
        urgency,
        confidence,
        sentiment,
        draft_response: draftResponse,
        error: null,
        finished_at: finishedAt,
      })
      .eq("id", runId);

    if (runUpdateError) return json({ error: { code: "INTERNAL", message: "Failed to update run outputs." } }, { status: 500 });

    // If AI is disabled now, keep ticket AI fields untouched, but clear ai_status if this was the latest run.
    if (!aiEnabled) {
      if (ticket.latest_run_id === runId) {
        await supabaseAdmin
          .from("tickets")
          .update({ ai_status: null })
          .eq("id", ticket.id);
      }
      return json({ ok: true, runId, status: "done" });
    }

    // Latest run wins
    if (ticket.latest_run_id !== runId) {
      return json({ ok: true, runId, status: "done", note: "Not latest run; ticket not updated." });
    }

    const draftUpdatedAt = ticket.draft_updated_at ? new Date(ticket.draft_updated_at).getTime() : null;
    const startedAtMs = new Date(startedAt).getTime();
    const safeToWriteDraft = draftUpdatedAt == null || draftUpdatedAt <= startedAtMs;

    if (safeToWriteDraft) {
      await supabaseAdmin
        .from("tickets")
        .update({
          ai_status: "draft_ready",
          draft_response: draftResponse,
          confidence,
          sentiment,
        })
        .eq("id", ticket.id);
    } else {
      const nextStatus = ticket.ai_status === "human_needed" ? "human_needed" : "draft_ready";
      await supabaseAdmin
        .from("tickets")
        .update({
          ai_status: nextStatus,
        })
        .eq("id", ticket.id);
    }

    return json({ ok: true, runId, status: "done" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown AI worker error.";
    const finishedAt = new Date().toISOString();

    await supabaseAdmin
      .from("ai_runs")
      .update({ status: "error", error: message, finished_at: finishedAt })
      .eq("id", runId);

    // Latest run wins (also for failure semantics).
    if (ticket.latest_run_id === runId) {
      if (aiEnabled) {
        await supabaseAdmin
          .from("tickets")
          .update({
            status: "open",
            ai_status: "human_needed",
          })
          .eq("id", ticket.id);
      } else {
        await supabaseAdmin
          .from("tickets")
          .update({
            status: "open",
            ai_status: null,
          })
          .eq("id", ticket.id);
      }
    }

    await supabaseAdmin.from("notifications").insert({
      org_id: ticket.org_id,
      type: "ai",
      priority: "high",
      title: "AI run failed",
      message: "The AI worker failed to generate a draft. Please review the ticket manually and retry if needed.",
      ticket_id: ticket.id,
    });

    return json({ error: { code: "INTERNAL", message: "AI run failed." } }, { status: 500 });
  }
});
