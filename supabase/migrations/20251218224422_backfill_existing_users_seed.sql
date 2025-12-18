-- Backfill org/profile/membership + seed data for users created before triggers were installed.
-- Safe to run multiple times.

create or replace function public.bootstrap_user_org(p_user_id uuid, p_email text, p_raw_user_meta_data jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $bootstrap$
declare
  org_id uuid;
  org_name text;
begin
  org_name := coalesce(p_raw_user_meta_data->>'full_name', p_email, 'Personal');

  insert into public.organizations (name)
    values (org_name)
    returning id into org_id;

  insert into public.profiles (user_id, current_org_id)
    values (p_user_id, org_id)
    on conflict (user_id) do update set current_org_id = excluded.current_org_id;

  insert into public.memberships (org_id, user_id, role)
    values (org_id, p_user_id, 'owner')
    on conflict (org_id, user_id) do nothing;

  insert into public.ai_settings (
    org_id,
    ai_enabled,
    auto_reply,
    learning_mode,
    confidence_threshold,
    max_response_length,
    tone_value,
    selected_persona
  ) values (
    org_id,
    true,
    false,
    false,
    70,
    250,
    50,
    'professional'
  )
  on conflict (org_id) do nothing;

  begin
    perform public.seed_mock_data_for_org(org_id);
  exception
    when undefined_function then
      -- If seed function isn't installed for some reason, ignore.
      null;
    when others then
      raise notice 'seed_mock_data_for_org failed for org %: %', org_id, sqlerrm;
  end;

  return org_id;
end;
$bootstrap$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $handle_new_user$
begin
  perform public.bootstrap_user_org(new.id, new.email, new.raw_user_meta_data);
  return new;
exception
  when others then
    -- Never block signup for seed issues.
    raise notice 'handle_new_user failed: %', sqlerrm;
    return new;
end;
$handle_new_user$;

do $$
declare
  u record;
begin
  for u in
    select au.id, au.email, au.raw_user_meta_data
    from auth.users au
    left join public.profiles p on p.user_id = au.id
    where p.user_id is null
  loop
    perform public.bootstrap_user_org(u.id, u.email, u.raw_user_meta_data);
  end loop;
end $$;
