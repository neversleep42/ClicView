import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import type { ListResponse, TicketMessageDTO } from "@/lib/api/contracts";
import { apiError } from "@/lib/api/http";
import { mapTicketMessageRow, TICKET_MESSAGE_SELECT } from "@/lib/api/mappers";
import { decodeCursor, encodeCursor, parseLimit, parseOrderWithDefault, pgTextValue } from "@/lib/api/pagination";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const authorSchema = z.enum(["customer", "agent", "system"]);

const createMessageSchema = z.object({
  authorType: authorSchema.optional(),
  authorName: z.string().min(1).max(120).optional(),
  content: z.string().min(1).max(20_000),
});

function applyCursorFilter(query: any, order: "asc" | "desc", cursor: { sortValue: string | number; id: string }) {
  const sortValue =
    typeof cursor.sortValue === "number" ? String(cursor.sortValue) : pgTextValue(String(cursor.sortValue));
  const idValue = cursor.id;
  const col = "created_at";

  if (order === "desc") {
    return query.or(`${col}.lt.${sortValue},and(${col}.eq.${sortValue},id.lt.${idValue})`);
  }

  return query.or(`${col}.gt.${sortValue},and(${col}.eq.${sortValue},id.gt.${idValue})`);
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id: ticketId } = await ctx.params;

  const searchParams = request.nextUrl.searchParams;
  const limit = parseLimit(searchParams.get("limit"), { defaultLimit: 50, maxLimit: 200 });
  const cursorRaw = searchParams.get("cursor");
  const order = parseOrderWithDefault(searchParams.get("order"), "asc");

  // Ensure ticket exists (consistent 404)
  const { data: ticketExists, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("org_id", orgId)
    .eq("id", ticketId)
    .maybeSingle();

  if (ticketError) return apiError(500, "INTERNAL", "Failed to load ticket.", { cause: ticketError.message });
  if (!ticketExists) return apiError(404, "NOT_FOUND", "Ticket not found.");

  let query = supabase
    .from("ticket_messages")
    .select(TICKET_MESSAGE_SELECT)
    .eq("org_id", orgId)
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: order === "asc" })
    .order("id", { ascending: order === "asc" });

  if (cursorRaw) {
    try {
      const cursor = decodeCursor(cursorRaw);
      query = applyCursorFilter(query, order, { sortValue: cursor.sortValue, id: cursor.id });
    } catch (e: any) {
      return apiError(400, "VALIDATION_ERROR", e?.message ?? "Invalid cursor.");
    }
  }

  const { data, error } = await query.limit(limit + 1);
  if (error) return apiError(500, "INTERNAL", "Failed to load ticket messages.", { cause: error.message });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: TicketMessageDTO[] = pageRows.map(mapTicketMessageRow);
  const last = pageRows[pageRows.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ v: 1, sortValue: last.created_at, id: last.id })
      : null;

  const response: ListResponse<TicketMessageDTO> = { items, nextCursor };
  return NextResponse.json(response);
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id: ticketId } = await ctx.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError(400, "VALIDATION_ERROR", "Invalid JSON body.");
  }

  const parsed = createMessageSchema.safeParse(json);
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());

  // Ensure ticket exists (consistent 404)
  const { data: ticketExists, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("org_id", orgId)
    .eq("id", ticketId)
    .maybeSingle();

  if (ticketError) return apiError(500, "INTERNAL", "Failed to load ticket.", { cause: ticketError.message });
  if (!ticketExists) return apiError(404, "NOT_FOUND", "Ticket not found.");

  const authorType = parsed.data.authorType ?? "agent";
  const authorName = parsed.data.authorName ?? null;

  const { data: messageRow, error } = await supabase
    .from("ticket_messages")
    .insert({
      org_id: orgId,
      ticket_id: ticketId,
      author_type: authorType,
      author_name: authorName,
      content: parsed.data.content,
    })
    .select(TICKET_MESSAGE_SELECT)
    .single();

  if (error || !messageRow) return apiError(500, "INTERNAL", "Failed to create ticket message.", { cause: error?.message });

  return NextResponse.json({ message: mapTicketMessageRow(messageRow) });
}

