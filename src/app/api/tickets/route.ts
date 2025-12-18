import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import type { ListResponse, TicketDTO, TicketPriority } from "@/lib/api/contracts";
import { apiError } from "@/lib/api/http";
import { mapTicketRow, TICKET_SELECT } from "@/lib/api/mappers";
import { decodeCursor, encodeCursor, parseLimit, parseOrder, pgTextValue } from "@/lib/api/pagination";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const ticketTabSchema = z.enum([
  "all",
  "priority",
  "draft_ready",
  "human_needed",
  "resolved",
  "archived",
]);

const ticketSortSchema = z.enum(["updatedAt", "createdAt"]);
const prioritySchema = z.enum(["low", "medium", "high"]);
const categorySchema = z.enum(["refund", "shipping", "product", "billing", "general"]);

const createTicketSchema = z
  .object({
    subject: z.string().min(3).max(200),
    content: z.string().min(1).max(20_000),
    category: categorySchema,
    priority: prioritySchema.optional(),
    customerId: z.string().uuid().optional(),
    customer: z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
      })
      .optional(),
    runAI: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    const hasCustomerId = Boolean(val.customerId);
    const hasCustomer = Boolean(val.customer);
    if (hasCustomerId === hasCustomer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either customerId or customer (name/email).",
        path: ["customerId"],
      });
    }
  });

function applyTicketTabFilter(query: any, tab: z.infer<typeof ticketTabSchema>) {
  switch (tab) {
    case "archived":
      return query.not("archived_at", "is", null);
    case "priority":
      return query.is("archived_at", null).eq("priority", "high" satisfies TicketPriority);
    case "draft_ready":
      return query.is("archived_at", null).eq("ai_status", "draft_ready");
    case "human_needed":
      return query.is("archived_at", null).eq("ai_status", "human_needed");
    case "resolved":
      return query.is("archived_at", null).eq("status", "resolved");
    case "all":
    default:
      return query.is("archived_at", null);
  }
}

function applyCursorFilter(query: any, column: string, order: "asc" | "desc", cursor: { sortValue: string | number; id: string }) {
  const sortValue =
    typeof cursor.sortValue === "number" ? String(cursor.sortValue) : pgTextValue(String(cursor.sortValue));
  const idValue = cursor.id;

  if (order === "desc") {
    return query.or(`${column}.lt.${sortValue},and(${column}.eq.${sortValue},id.lt.${idValue})`);
  }

  return query.or(`${column}.gt.${sortValue},and(${column}.eq.${sortValue},id.gt.${idValue})`);
}

export async function GET(request: NextRequest) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const searchParams = request.nextUrl.searchParams;

  const tabResult = ticketTabSchema.safeParse(searchParams.get("tab") ?? "all");
  if (!tabResult.success) return apiError(400, "VALIDATION_ERROR", "Invalid tab value.");

  const sortResult = ticketSortSchema.safeParse(searchParams.get("sort") ?? "updatedAt");
  if (!sortResult.success) return apiError(400, "VALIDATION_ERROR", "Invalid sort value.");

  const tab = tabResult.data;
  const sort = sortResult.data;
  const order = parseOrder(searchParams.get("order"));
  const limit = parseLimit(searchParams.get("limit"), { defaultLimit: 20, maxLimit: 100 });
  const cursorRaw = searchParams.get("cursor");
  const search = (searchParams.get("search") ?? "").trim();

  const sortColumn = sort === "createdAt" ? "created_at" : "updated_at";
  let query = supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("org_id", orgId);

  query = applyTicketTabFilter(query, tab);

  if (search.length > 0) {
    const pattern = `%${search}%`;
    const patternValue = pgTextValue(pattern);

    const { data: matchedCustomers } = await supabase
      .from("customers")
      .select("id")
      .eq("org_id", orgId)
      .or(`name.ilike.${patternValue},email.ilike.${patternValue}`)
      .limit(50);

    const customerIds = (matchedCustomers ?? []).map((c: any) => c.id).filter(Boolean);

    const orParts = [`subject.ilike.${patternValue}`, `content.ilike.${patternValue}`];
    if (customerIds.length > 0) {
      orParts.push(`customer_id.in.(${customerIds.join(",")})`);
    }

    query = query.or(orParts.join(","));
  }

  query = query.order(sortColumn, { ascending: order === "asc" }).order("id", { ascending: order === "asc" });

  if (cursorRaw) {
    try {
      const cursor = decodeCursor(cursorRaw);
      query = applyCursorFilter(query, sortColumn, order, { sortValue: cursor.sortValue, id: cursor.id });
    } catch (e: any) {
      return apiError(400, "VALIDATION_ERROR", e?.message ?? "Invalid cursor.");
    }
  }

  const { data, error } = await query.limit(limit + 1);
  if (error) return apiError(500, "INTERNAL", "Failed to load tickets.", { cause: error.message });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: TicketDTO[] = pageRows.map(mapTicketRow);
  const last = pageRows[pageRows.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ v: 1, sortValue: last[sortColumn], id: last.id })
      : null;

  const response: ListResponse<TicketDTO> = { items, nextCursor };
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError(400, "VALIDATION_ERROR", "Invalid JSON body.");
  }

  const parsed = createTicketSchema.safeParse(json);
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());
  }

  const { subject, content, category, runAI } = parsed.data;
  const priority: TicketPriority = parsed.data.priority ?? "medium";

  // Resolve customer
  let customerId = parsed.data.customerId ?? null;
  if (!customerId && parsed.data.customer) {
    const email = parsed.data.customer.email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("org_id", orgId)
      .ilike("email", email)
      .maybeSingle();

    if (existing?.id) {
      customerId = existing.id;
    } else {
      const { data: createdCustomer, error: createCustomerError } = await supabase
        .from("customers")
        .insert({
          org_id: orgId,
          name: parsed.data.customer.name,
          email,
        })
        .select("id")
        .single();

      if (createCustomerError) {
        if (createCustomerError.code === "23505") {
          const { data: existingAfterConflict } = await supabase
            .from("customers")
            .select("id")
            .eq("org_id", orgId)
            .ilike("email", email)
            .maybeSingle();

          if (existingAfterConflict?.id) {
            customerId = existingAfterConflict.id;
          } else {
            return apiError(409, "CUSTOMER_EMAIL_EXISTS", "Customer email already exists in this org.");
          }
        } else {
          return apiError(500, "INTERNAL", "Failed to create customer.", { cause: createCustomerError.message });
        }
      } else if (!createdCustomer) {
        return apiError(500, "INTERNAL", "Failed to create customer.");
      } else {
        customerId = createdCustomer.id;
      }
    }
  }

  if (!customerId) return apiError(400, "VALIDATION_ERROR", "Missing customerId/customer.");

  // Determine AI enablement and whether to enqueue.
  const { data: settings } = await supabase
    .from("ai_settings")
    .select("ai_enabled")
    .eq("org_id", orgId)
    .maybeSingle();

  const aiEnabled = Boolean(settings?.ai_enabled);
  const shouldRunAI = aiEnabled ? (runAI ?? true) : false;

  const { data: insertedTicket, error: insertError } = await supabase
    .from("tickets")
    .insert({
      org_id: orgId,
      customer_id: customerId,
      subject,
      content,
      category,
      priority,
      status: "open",
      ai_status: shouldRunAI ? "pending" : null,
      latest_run_id: null,
    })
    .select("id")
    .single();

  if (insertError || !insertedTicket) {
    return apiError(500, "INTERNAL", "Failed to create ticket.", { cause: insertError?.message });
  }

  let runId: string | null = null;
  if (shouldRunAI) {
    const { data: run, error: runError } = await supabase
      .from("ai_runs")
      .insert({ org_id: orgId, ticket_id: insertedTicket.id, status: "queued" })
      .select("id")
      .single();

    if (runError || !run) {
      return apiError(500, "INTERNAL", "Failed to enqueue AI run.", { cause: runError?.message });
    }

    runId = run.id;

    const { error: ticketUpdateError } = await supabase
      .from("tickets")
      .update({ latest_run_id: runId, ai_status: "pending" })
      .eq("id", insertedTicket.id);

    if (ticketUpdateError) {
      return apiError(500, "INTERNAL", "Failed to update ticket after enqueue.", { cause: ticketUpdateError.message });
    }

    // Fire-and-forget: trigger worker; if not deployed yet, run remains queued.
    supabase.functions
      .invoke("ai-worker", { body: { runId } })
      .then(() => {})
      .catch(() => {});
  }

  const { data: ticketRow, error: ticketLoadError } = await supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .eq("id", insertedTicket.id)
    .single();

  if (ticketLoadError || !ticketRow) {
    return apiError(500, "INTERNAL", "Failed to load created ticket.", { cause: ticketLoadError?.message });
  }

  return NextResponse.json({ ticket: mapTicketRow(ticketRow), runId });
}
