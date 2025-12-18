import { NextResponse, type NextRequest } from "next/server";

import { apiError } from "@/lib/api/http";
import { mapTicketRow, TICKET_SELECT } from "@/lib/api/mappers";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

export async function POST(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id } = await ctx.params;

  const archivedAt = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("tickets")
    .update({ archived_at: archivedAt })
    .eq("org_id", orgId)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (updateError) return apiError(500, "INTERNAL", "Failed to archive ticket.", { cause: updateError.message });
  if (!updated) return apiError(404, "NOT_FOUND", "Ticket not found.");

  const { data: ticketRow, error: reloadError } = await supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (reloadError) return apiError(500, "INTERNAL", "Failed to load archived ticket.", { cause: reloadError.message });
  if (!ticketRow) return apiError(404, "NOT_FOUND", "Ticket not found.");

  return NextResponse.json({ ticket: mapTicketRow(ticketRow) });
}
