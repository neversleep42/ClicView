import { NextResponse, type NextRequest } from "next/server";

import { apiError } from "@/lib/api/http";
import { mapNotificationRow, NOTIFICATION_SELECT } from "@/lib/api/mappers";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

export async function POST(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id } = await ctx.params;

  const readAt = new Date().toISOString();

  const { data: notificationRow, error } = await supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("org_id", orgId)
    .eq("id", id)
    .select(NOTIFICATION_SELECT)
    .maybeSingle();

  if (error) return apiError(500, "INTERNAL", "Failed to mark notification read.", { cause: error.message });
  if (!notificationRow) return apiError(404, "NOT_FOUND", "Notification not found.");

  return NextResponse.json({ notification: mapNotificationRow(notificationRow) });
}
