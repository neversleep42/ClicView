import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api/http";
import { mapTicketRow, TICKET_SELECT } from "@/lib/api/mappers";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const prioritySchema = z.enum(["low", "medium", "high"]);
const categorySchema = z.enum(["refund", "shipping", "product", "billing", "general"]);
const statusSchema = z.enum(["open", "resolved"]);

const patchTicketSchema = z
  .object({
    subject: z.string().min(3).max(200).optional(),
    content: z.string().min(1).max(20_000).optional(),
    category: categorySchema.optional(),
    priority: prioritySchema.optional(),
    status: statusSchema.optional(),
    draftResponse: z.union([z.string().max(20_000), z.null()]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update." });

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id } = await ctx.params;

  const { data: ticketRow, error } = await supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (error) return apiError(500, "INTERNAL", "Failed to load ticket.", { cause: error.message });
  if (!ticketRow) return apiError(404, "NOT_FOUND", "Ticket not found.");

  return NextResponse.json({ ticket: mapTicketRow(ticketRow) });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id } = await ctx.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError(400, "VALIDATION_ERROR", "Invalid JSON body.");
  }

  const parsed = patchTicketSchema.safeParse(json);
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());
  }

  const { data: existing, error: existingError } = await supabase
    .from("tickets")
    .select("id,status,draft_response")
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (existingError) return apiError(500, "INTERNAL", "Failed to load ticket.", { cause: existingError.message });
  if (!existing) return apiError(404, "NOT_FOUND", "Ticket not found.");

  const updates: Record<string, unknown> = {};
  const body = parsed.data;
  const shouldInsertAgentMessage = existing.status === "open" && body.status === "resolved";

  if (body.subject !== undefined) updates.subject = body.subject;
  if (body.content !== undefined) updates.content = body.content;
  if (body.category !== undefined) updates.category = body.category;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.status !== undefined) updates.status = body.status;

  if (Object.prototype.hasOwnProperty.call(body, "draftResponse")) {
    updates.draft_response = body.draftResponse ?? null;
    updates.draft_updated_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update(updates)
    .eq("org_id", orgId)
    .eq("id", id);

  if (updateError) return apiError(500, "INTERNAL", "Failed to update ticket.", { cause: updateError.message });

  if (shouldInsertAgentMessage) {
    const messageBody = Object.prototype.hasOwnProperty.call(body, "draftResponse")
      ? body.draftResponse
      : existing.draft_response;

    const content = typeof messageBody === "string" ? messageBody.trim() : "";

    if (content.length > 0) {
      const { data: latestAgentMessage, error: latestMessageError } = await supabase
        .from("ticket_messages")
        .select("content,created_at")
        .eq("org_id", orgId)
        .eq("ticket_id", id)
        .eq("author_type", "agent")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestMessageError) {
        return apiError(500, "INTERNAL", "Failed to load latest ticket message.", { cause: latestMessageError.message });
      }

      const now = Date.now();
      const latestText = typeof latestAgentMessage?.content === "string" ? latestAgentMessage.content.trim() : null;
      const latestAtMs = latestAgentMessage?.created_at ? new Date(latestAgentMessage.created_at).getTime() : null;
      const isDuplicate =
        latestText != null &&
        latestText === content &&
        latestAtMs != null &&
        Number.isFinite(latestAtMs) &&
        now - latestAtMs < 10_000;

      if (!isDuplicate) {
        const { error: messageError } = await supabase
          .from("ticket_messages")
          .insert({
            org_id: orgId,
            ticket_id: id,
            author_type: "agent",
            author_name: "Support Team",
            content,
          });

        if (messageError) {
          return apiError(500, "INTERNAL", "Failed to create agent ticket message.", { cause: messageError.message });
        }
      }
    }
  }

  const { data: ticketRow, error: reloadError } = await supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (reloadError) return apiError(500, "INTERNAL", "Failed to load updated ticket.", { cause: reloadError.message });
  if (!ticketRow) return apiError(404, "NOT_FOUND", "Ticket not found.");

  return NextResponse.json({ ticket: mapTicketRow(ticketRow) });
}
