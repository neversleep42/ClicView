import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import type { CustomerDTO, ListResponse } from "@/lib/api/contracts";
import { apiError } from "@/lib/api/http";
import { CUSTOMER_SELECT, mapCustomerRow } from "@/lib/api/mappers";
import { decodeCursor, encodeCursor, parseLimit, parseOrderWithDefault, pgTextValue } from "@/lib/api/pagination";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const customerSortSchema = z.enum(["name", "updatedAt", "createdAt", "ltv"]);

const createCustomerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
});

type SortValue = string | number;
interface OrFilterable {
  or(filters: string): this;
}

function applyCursorFilter<T extends OrFilterable>(query: T, column: string, order: "asc" | "desc", cursor: { sortValue: SortValue; id: string }) {
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

  const sortResult = customerSortSchema.safeParse(searchParams.get("sort") ?? "name");
  if (!sortResult.success) return apiError(400, "VALIDATION_ERROR", "Invalid sort value.");
  const sort = sortResult.data;

  const defaultOrder = sort === "updatedAt" || sort === "createdAt" ? "desc" : "asc";
  const order = parseOrderWithDefault(searchParams.get("order"), defaultOrder);
  const limit = parseLimit(searchParams.get("limit"), { defaultLimit: 20, maxLimit: 100 });
  const cursorRaw = searchParams.get("cursor");
  const search = (searchParams.get("search") ?? "").trim();

  const sortColumn =
    sort === "createdAt" ? "created_at" : sort === "updatedAt" ? "updated_at" : sort;

  let query = supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .eq("org_id", orgId);

  if (search.length > 0) {
    const patternValue = pgTextValue(`%${search}%`);
    query = query.or(`name.ilike.${patternValue},email.ilike.${patternValue}`);
  }

  query = query.order(sortColumn, { ascending: order === "asc" }).order("id", { ascending: order === "asc" });

  if (cursorRaw) {
    try {
      const cursor = decodeCursor(cursorRaw);
      query = applyCursorFilter(query, sortColumn, order, { sortValue: cursor.sortValue, id: cursor.id });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid cursor.";
      return apiError(400, "VALIDATION_ERROR", message);
    }
  }

  const { data, error } = await query.limit(limit + 1);
  if (error) return apiError(500, "INTERNAL", "Failed to load customers.", { cause: error.message });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: CustomerDTO[] = pageRows.map(mapCustomerRow);
  const last = pageRows[pageRows.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ v: 1, sortValue: last[sortColumn], id: last.id })
      : null;

  const response: ListResponse<CustomerDTO> = { items, nextCursor };
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

  const parsed = createCustomerSchema.safeParse(json);
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());

  const email = parsed.data.email.trim().toLowerCase();
  const { data: existing, error: existingError } = await supabase
    .from("customers")
    .select("id")
    .eq("org_id", orgId)
    .ilike("email", email)
    .maybeSingle();

  if (existingError) return apiError(500, "INTERNAL", "Failed to validate customer email.", { cause: existingError.message });
  if (existing) {
    return apiError(409, "CUSTOMER_EMAIL_EXISTS", "Customer email already exists in this org.");
  }

  const { data: customerRow, error: insertError } = await supabase
    .from("customers")
    .insert({ org_id: orgId, name: parsed.data.name, email })
    .select(CUSTOMER_SELECT)
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return apiError(409, "CUSTOMER_EMAIL_EXISTS", "Customer email already exists in this org.");
    }
    return apiError(500, "INTERNAL", "Failed to create customer.", { cause: insertError.message });
  }
  if (!customerRow) return apiError(500, "INTERNAL", "Failed to create customer.");

  return NextResponse.json({ customer: mapCustomerRow(customerRow) });
}
