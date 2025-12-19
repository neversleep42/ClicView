import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import type { AnalyticsDTO, TicketCategory } from "@/lib/api/contracts";
import { apiError } from "@/lib/api/http";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const rangeSchema = z.enum(["7d", "30d"]);

function startOfDayUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function addDaysUTC(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days, 0, 0, 0, 0));
}

export async function GET(request: NextRequest) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const searchParams = request.nextUrl.searchParams;

  const rangeResult = rangeSchema.safeParse(searchParams.get("range") ?? "7d");
  if (!rangeResult.success) return apiError(400, "VALIDATION_ERROR", "Invalid range value.");

  const days = rangeResult.data === "30d" ? 30 : 7;
  const timezone = "UTC";

  const now = new Date();
  const to = now;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("id,status,ai_status,category,created_at,updated_at,archived_at")
    .eq("org_id", orgId)
    .gte("created_at", fromIso)
    .lte("created_at", toIso);

  if (error) return apiError(500, "INTERNAL", "Failed to load analytics.", { cause: error.message });

  type AnalyticsTicketRow = {
    id: string;
    status: "open" | "resolved";
    ai_status: "pending" | "draft_ready" | "human_needed" | null;
    category: TicketCategory;
    created_at: string;
    updated_at: string;
    archived_at: string | null;
  };

  const rows = (tickets ?? []) as AnalyticsTicketRow[];

  const totalTickets = rows.length;
  const openTickets = rows.filter((t) => t.status === "open" && t.archived_at == null).length;
  const resolvedTickets = rows.filter((t) => t.status === "resolved").length;
  const humanNeededTickets = rows.filter((t) => t.ai_status === "human_needed" && t.archived_at == null).length;

  const aiResolved = rows.filter((t) => t.status === "resolved" && t.ai_status != null).length;
  const humanResolved = Math.max(resolvedTickets - aiResolved, 0);
  const aiResolutionRate = resolvedTickets > 0 ? aiResolved / resolvedTickets : null;

  const resolvedDurations = rows
    .filter((t) => t.status === "resolved" && t.created_at && t.updated_at)
    .map((t) => {
      const created = new Date(t.created_at).getTime();
      const updated = new Date(t.updated_at).getTime();
      return Math.max(0, Math.floor((updated - created) / 1000));
    });

  const avgHandleTimeSeconds =
    resolvedDurations.length > 0
      ? Math.round(resolvedDurations.reduce((a: number, b: number) => a + b, 0) / resolvedDurations.length)
      : null;

  // Daily ticket volume (UTC buckets)
  const volumeByDay = new Map<string, number>();
  for (const t of rows) {
    const day = startOfDayUTC(new Date(t.created_at)).toISOString();
    volumeByDay.set(day, (volumeByDay.get(day) ?? 0) + 1);
  }

  const volume: AnalyticsDTO["ticketVolume"] = [];
  const start = startOfDayUTC(from);
  const end = startOfDayUTC(to);
  for (let d = start; d <= end; d = addDaysUTC(d, 1)) {
    const bucketStart = d.toISOString();
    volume.push({ bucketStart, tickets: volumeByDay.get(bucketStart) ?? 0 });
  }

  const categoryCounts = new Map<TicketCategory, number>();
  for (const t of rows) {
    const c = t.category as TicketCategory;
    categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
  }

  const categories = Array.from(categoryCounts.entries()).map(([category, count]) => ({ category, count }));

  const analytics: AnalyticsDTO = {
    range: { from: fromIso, to: toIso, timezone },
    summary: {
      totalTickets,
      openTickets,
      resolvedTickets,
      humanNeededTickets,
      aiResolutionRate,
      avgHandleTimeSeconds,
      csatScore: null,
    },
    ticketVolume: volume,
    resolutionSplit: { aiResolved, humanResolved },
    categories,
  };

  return NextResponse.json({ analytics });
}
