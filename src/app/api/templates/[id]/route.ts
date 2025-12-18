import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api/http";
import { mapTemplateRow, TEMPLATE_SELECT } from "@/lib/api/mappers";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const patchTemplateSchema = z
  .object({
    title: z.string().min(2).max(120).optional(),
    category: z.string().min(2).max(60).optional(),
    content: z.string().min(1).max(20_000).optional(),
    archivedAt: z.union([z.string().datetime(), z.null()]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update." });

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

  const parsed = patchTemplateSchema.safeParse(json);
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());

  const updates: Record<string, unknown> = {};
  const body = parsed.data;

  if (body.title !== undefined) updates.title = body.title;
  if (body.category !== undefined) updates.category = body.category;
  if (body.content !== undefined) updates.content = body.content;
  if (Object.prototype.hasOwnProperty.call(body, "archivedAt")) {
    updates.archived_at = body.archivedAt ?? null;
  }

  const { data: templateRow, error } = await supabase
    .from("response_templates")
    .update(updates)
    .eq("org_id", orgId)
    .eq("id", id)
    .select(TEMPLATE_SELECT)
    .maybeSingle();

  if (error) return apiError(500, "INTERNAL", "Failed to update template.", { cause: error.message });
  if (!templateRow) return apiError(404, "NOT_FOUND", "Template not found.");

  return NextResponse.json({ template: mapTemplateRow(templateRow) });
}

export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id } = await ctx.params;

  const { data: templateRow, error } = await supabase
    .from("response_templates")
    .delete()
    .eq("org_id", orgId)
    .eq("id", id)
    .select(TEMPLATE_SELECT)
    .maybeSingle();

  if (error) return apiError(500, "INTERNAL", "Failed to delete template.", { cause: error.message });
  if (!templateRow) return apiError(404, "NOT_FOUND", "Template not found.");

  return NextResponse.json({ template: mapTemplateRow(templateRow) });
}
