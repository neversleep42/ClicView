import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import type { ListResponse, TemplateDTO } from "@/lib/api/contracts";
import { apiError } from "@/lib/api/http";
import { mapTemplateRow, TEMPLATE_SELECT } from "@/lib/api/mappers";
import { decodeCursor, encodeCursor, parseLimit, parseOrder, pgTextValue } from "@/lib/api/pagination";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const templateSortSchema = z.enum(["updatedAt", "createdAt", "title"]);

const createTemplateSchema = z.object({
  title: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  content: z.string().min(1).max(20_000),
});

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

  const sortResult = templateSortSchema.safeParse(searchParams.get("sort") ?? "updatedAt");
  if (!sortResult.success) return apiError(400, "VALIDATION_ERROR", "Invalid sort value.");
  const sort = sortResult.data;

  const order = parseOrder(searchParams.get("order"));
  const limit = parseLimit(searchParams.get("limit"), { defaultLimit: 20, maxLimit: 100 });
  const cursorRaw = searchParams.get("cursor");
  const search = (searchParams.get("search") ?? "").trim();

  const sortColumn =
    sort === "createdAt" ? "created_at" : sort === "updatedAt" ? "updated_at" : "title";

  let query = supabase
    .from("response_templates")
    .select(TEMPLATE_SELECT)
    .eq("org_id", orgId);

  if (search.length > 0) {
    const patternValue = pgTextValue(`%${search}%`);
    query = query.or(`title.ilike.${patternValue},category.ilike.${patternValue},content.ilike.${patternValue}`);
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
  if (error) return apiError(500, "INTERNAL", "Failed to load templates.", { cause: error.message });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: TemplateDTO[] = pageRows.map(mapTemplateRow);
  const last = pageRows[pageRows.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ v: 1, sortValue: last[sortColumn], id: last.id })
      : null;

  const response: ListResponse<TemplateDTO> = { items, nextCursor };
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

  const parsed = createTemplateSchema.safeParse(json);
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());

  const { data: templateRow, error } = await supabase
    .from("response_templates")
    .insert({ org_id: orgId, ...parsed.data })
    .select(TEMPLATE_SELECT)
    .single();

  if (error || !templateRow) return apiError(500, "INTERNAL", "Failed to create template.", { cause: error?.message });

  return NextResponse.json({ template: mapTemplateRow(templateRow) });
}

