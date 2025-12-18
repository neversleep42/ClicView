import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api/http";
import { CUSTOMER_SELECT, mapCustomerRow } from "@/lib/api/mappers";
import { requireUserAndOrg } from "@/lib/supabase/requireUserAndOrg";

export const runtime = "nodejs";

const patchCustomerSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    orders: z.number().int().min(0).optional(),
    ltv: z.number().min(0).optional(),
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

  const parsed = patchCustomerSchema.safeParse(json);
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.flatten());

  const updates: Record<string, unknown> = { ...parsed.data };
  if (updates.email !== undefined) {
    updates.email = String(updates.email).trim().toLowerCase();
  }

  const { data: customerRow, error: updateError } = await supabase
    .from("customers")
    .update(updates)
    .eq("org_id", orgId)
    .eq("id", id)
    .select(CUSTOMER_SELECT)
    .maybeSingle();

  if (updateError) {
    if (updateError.code === "23505") {
      return apiError(409, "CUSTOMER_EMAIL_EXISTS", "Customer email already exists in this org.");
    }
    return apiError(500, "INTERNAL", "Failed to update customer.", { cause: updateError.message });
  }

  if (!customerRow) return apiError(404, "NOT_FOUND", "Customer not found.");

  return NextResponse.json({ customer: mapCustomerRow(customerRow) });
}

export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserAndOrg();
  if (!auth.ok) return auth.response;

  const { supabase, orgId } = auth.value;
  const { id } = await ctx.params;

  const { data: customerRow, error } = await supabase
    .from("customers")
    .delete()
    .eq("org_id", orgId)
    .eq("id", id)
    .select(CUSTOMER_SELECT)
    .maybeSingle();

  if (error) {
    if (error.code === "23503") {
      return apiError(409, "CUSTOMER_HAS_TICKETS", "Cannot delete a customer that has tickets.");
    }
    return apiError(500, "INTERNAL", "Failed to delete customer.", { cause: error.message });
  }

  if (!customerRow) return apiError(404, "NOT_FOUND", "Customer not found.");

  return NextResponse.json({ customer: mapCustomerRow(customerRow) });
}
