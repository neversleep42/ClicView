import { NextResponse, type NextRequest } from "next/server";

import type { ListResponse, NotificationDTO } from "@/lib/api/contracts";
import { apiError } from "@/lib/api/http";
import { mapNotificationRow, NOTIFICATION_SELECT } from "@/lib/api/mappers";
import { decodeCursor, encodeCursor, parseLimit, parseOrderWithDefault, pgTextValue } from "@/lib/api/pagination";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

function parseBoolean(raw: string | null): boolean {
  return raw === "true";
}

type SortValue = string | number;
interface OrFilterable {
  or(filters: string): this;
}

function applyCursorFilter<T extends OrFilterable>(query: T, order: "asc" | "desc", cursor: { sortValue: SortValue; id: string }) {
  const sortValue =
    typeof cursor.sortValue === "number" ? String(cursor.sortValue) : pgTextValue(String(cursor.sortValue));
  const idValue = cursor.id;
  const col = "created_at";

  if (order === "desc") {
    return query.or(`${col}.lt.${sortValue},and(${col}.eq.${sortValue},id.lt.${idValue})`);
  }
  return query.or(`${col}.gt.${sortValue},and(${col}.eq.${sortValue},id.gt.${idValue})`);
}

export async function GET(request: NextRequest) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const searchParams = request.nextUrl.searchParams;

  const limit = parseLimit(searchParams.get("limit"), { defaultLimit: 20, maxLimit: 100 });
  const cursorRaw = searchParams.get("cursor");
  const unreadOnly = parseBoolean(searchParams.get("unreadOnly"));
  const order = parseOrderWithDefault(searchParams.get("order"), "desc");

  let query = supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("org_id", orgId);

  if (unreadOnly) query = query.is("read_at", null);

  query = query.order("created_at", { ascending: order === "asc" }).order("id", { ascending: order === "asc" });

  if (cursorRaw) {
    try {
      const cursor = decodeCursor(cursorRaw);
      query = applyCursorFilter(query, order, { sortValue: cursor.sortValue, id: cursor.id });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid cursor.";
      return apiError(400, "VALIDATION_ERROR", message);
    }
  }

  const { data, error } = await query.limit(limit + 1);
  if (error) return apiError(500, "INTERNAL", "Failed to load notifications.", { cause: error.message });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: NotificationDTO[] = pageRows.map(mapNotificationRow);
  const last = pageRows[pageRows.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ v: 1, sortValue: last.created_at, id: last.id })
      : null;

  const response: ListResponse<NotificationDTO> = { items, nextCursor };
  return NextResponse.json(response);
}
