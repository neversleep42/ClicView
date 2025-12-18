import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api/http";
import { mapTicketRow, TICKET_SELECT } from "@/lib/api/mappers";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const triggerSchema = z.object({ force: z.boolean().optional() });

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id } = await ctx.params;

  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    // body is optional
  }

  const parsed = triggerSchema.safeParse(json);
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());
  const force = parsed.data.force ?? false;

  const { data: ticketRow, error: ticketError } = await supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (ticketError) return apiError(500, "INTERNAL", "Failed to load ticket.", { cause: ticketError.message });
  if (!ticketRow) return apiError(404, "NOT_FOUND", "Ticket not found.");

  const { data: settings } = await supabase
    .from("ai_settings")
    .select("ai_enabled")
    .eq("org_id", orgId)
    .maybeSingle();

  const aiEnabled = Boolean(settings?.ai_enabled);
  if (!aiEnabled) {
    return NextResponse.json({ runId: null, ticket: mapTicketRow(ticketRow) });
  }

  const latestRunId = ticketRow.latest_run_id as string | null;
  if (!force && latestRunId) {
    const { data: latestRun, error: runError } = await supabase
      .from("ai_runs")
      .select("id,status")
      .eq("org_id", orgId)
      .eq("id", latestRunId)
      .maybeSingle();

    if (runError) return apiError(500, "INTERNAL", "Failed to load latest AI run.", { cause: runError.message });

    if (latestRun && (latestRun.status === "queued" || latestRun.status === "running")) {
      return NextResponse.json({ runId: latestRun.id, ticket: mapTicketRow(ticketRow) });
    }
  }

  const { data: run, error: runError } = await supabase
    .from("ai_runs")
    .insert({ org_id: orgId, ticket_id: id, status: "queued" })
    .select("id")
    .single();

  if (runError || !run) return apiError(500, "INTERNAL", "Failed to enqueue AI run.", { cause: runError?.message });

  const runId: string = run.id;

  const { error: ticketUpdateError } = await supabase
    .from("tickets")
    .update({ latest_run_id: runId, ai_status: "pending" })
    .eq("org_id", orgId)
    .eq("id", id);

  if (ticketUpdateError) {
    return apiError(500, "INTERNAL", "Failed to update ticket after enqueue.", { cause: ticketUpdateError.message });
  }

  supabase.functions
    .invoke("ai-worker", { body: { runId } })
    .then(() => {})
    .catch(() => {});

  const { data: updatedTicketRow, error: reloadError } = await supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (reloadError) return apiError(500, "INTERNAL", "Failed to load updated ticket.", { cause: reloadError.message });
  if (!updatedTicketRow) return apiError(404, "NOT_FOUND", "Ticket not found.");

  return NextResponse.json({ runId, ticket: mapTicketRow(updatedTicketRow) });
}
