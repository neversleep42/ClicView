import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { apiError } from "../api/http";
import { createSupabaseServerClient } from "./server";

export type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type RequireUserAndOrgOk = {
  supabase: SupabaseServerClient;
  user: User;
  orgId: string;
};

export type RequireUserAndOrgResult =
  | { ok: true; value: RequireUserAndOrgOk }
  | { ok: false; response: NextResponse };

export async function requireUserAndOrg(): Promise<RequireUserAndOrgResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, response: apiError(401, "UNAUTHENTICATED", "Sign in required.") };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_org_id")
    .eq("user_id", user.id)
    .single();

  const orgId = profile?.current_org_id as string | null | undefined;
  if (profileError || !orgId) {
    return { ok: false, response: apiError(403, "FORBIDDEN", "No current org selected.") };
  }

  return { ok: true, value: { supabase, user, orgId } };
}
