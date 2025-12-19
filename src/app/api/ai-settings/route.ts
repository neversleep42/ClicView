import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api/http";
import { AI_SETTINGS_SELECT, mapAISettingsRow } from "@/lib/api/mappers";
import { requireUserAndOrg, type SupabaseServerClient } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const personaSchema = z.enum(["professional", "friendly", "concise"]);

const patchSettingsSchema = z
  .object({
    aiEnabled: z.boolean().optional(),
    autoReply: z.boolean().optional(),
    learningMode: z.boolean().optional(),
    confidenceThreshold: z.number().int().min(0).max(100).optional(),
    maxResponseLength: z.number().int().min(50).max(2000).optional(),
    toneValue: z.number().int().min(0).max(100).optional(),
    selectedPersona: personaSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update." });

async function getOrCreateSettings(supabase: SupabaseServerClient, orgId: string) {
  const { data: existing, error } = await supabase
    .from("ai_settings")
    .select(AI_SETTINGS_SELECT)
    .eq("org_id", orgId)
    .maybeSingle();

  if (error) throw error;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from("ai_settings")
    .insert({ org_id: orgId })
    .select(AI_SETTINGS_SELECT)
    .single();

  if (insertError) throw insertError;
  return created;
}

export async function GET(_request: NextRequest) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;

  try {
    const settingsRow = await getOrCreateSettings(supabase, orgId);
    return NextResponse.json({ settings: mapAISettingsRow(settingsRow) });
  } catch (e: unknown) {
    const cause = e instanceof Error ? e.message : "Unknown error";
    return apiError(500, "INTERNAL", "Failed to load AI settings.", { cause });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError(400, "VALIDATION_ERROR", "Invalid JSON body.");
  }

  const parsed = patchSettingsSchema.safeParse(json);
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());

  const body = parsed.data;

  const updates: Record<string, unknown> = {};
  if (body.aiEnabled !== undefined) updates.ai_enabled = body.aiEnabled;
  if (body.autoReply !== undefined) updates.auto_reply = body.autoReply;
  if (body.learningMode !== undefined) updates.learning_mode = body.learningMode;
  if (body.confidenceThreshold !== undefined) updates.confidence_threshold = body.confidenceThreshold;
  if (body.maxResponseLength !== undefined) updates.max_response_length = body.maxResponseLength;
  if (body.toneValue !== undefined) updates.tone_value = body.toneValue;
  if (body.selectedPersona !== undefined) updates.selected_persona = body.selectedPersona;

  const { error: updateError } = await supabase
    .from("ai_settings")
    .update(updates)
    .eq("org_id", orgId);

  if (updateError) return apiError(500, "INTERNAL", "Failed to update AI settings.", { cause: updateError.message });

  try {
    const settingsRow = await getOrCreateSettings(supabase, orgId);
    return NextResponse.json({ settings: mapAISettingsRow(settingsRow) });
  } catch (e: unknown) {
    const cause = e instanceof Error ? e.message : "Unknown error";
    return apiError(500, "INTERNAL", "Failed to load AI settings.", { cause });
  }
}
