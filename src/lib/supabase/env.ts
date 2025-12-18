export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return { url, anonKey, serviceRoleKey };
}

