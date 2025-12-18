-- v1 backend schema for Support AI (ClicView)
-- Frozen contract: org-scoped data model + RLS + AI run pipeline tables.

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.ticket_category as enum ('refund', 'shipping', 'product', 'billing', 'general');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ticket_priority as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ticket_status as enum ('open', 'resolved');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ticket_ai_status as enum ('pending', 'draft_ready', 'human_needed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ai_run_status as enum ('queued', 'running', 'done', 'error');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ai_urgency as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ai_persona as enum ('professional', 'friendly', 'concise');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_type as enum ('ticket', 'ai', 'system', 'team');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_priority as enum ('normal', 'high');
exception
  when duplicate_object then null;
end $$;

-- Helper: updated_at auto-maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core identity / org scoping
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_org_id uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memberships_org_user_unique unique (org_id, user_id)
);

create trigger memberships_set_updated_at
before update on public.memberships
for each row
execute function public.set_updated_at();

-- App data
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  email text not null,
  orders integer not null default 0,
  ltv numeric not null default 0,
  last_ticket_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_org_email_unique on public.customers (org_id, lower(email));
create index if not exists customers_org_name_idx on public.customers (org_id, name);
create index if not exists customers_org_updated_at_idx on public.customers (org_id, updated_at desc);

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

-- Ticket numbers: global sequence for simplicity (still scoped by org_id in queries).
create sequence if not exists public.ticket_number_seq;

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,

  ticket_number text not null default ('#' || lpad(nextval('public.ticket_number_seq')::text, 5, '0')),

  subject text not null,
  content text not null,
  excerpt text generated always as (left(regexp_replace(content, E'\\s+', ' ', 'g'), 160)) stored,

  category public.ticket_category not null,
  priority public.ticket_priority not null default 'medium',
  status public.ticket_status not null default 'open',

  ai_status public.ticket_ai_status null,
  latest_run_id uuid null,

  confidence integer null check (confidence between 0 and 100),
  sentiment integer null check (sentiment between 1 and 10),
  draft_response text null,
  draft_updated_at timestamptz null,

  archived_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_org_active_updated_idx
  on public.tickets (org_id, updated_at desc)
  where archived_at is null;
create index if not exists tickets_org_archived_updated_idx
  on public.tickets (org_id, updated_at desc)
  where archived_at is not null;
create index if not exists tickets_org_status_idx on public.tickets (org_id, status);
create index if not exists tickets_org_ai_status_idx on public.tickets (org_id, ai_status);
create index if not exists tickets_org_priority_idx on public.tickets (org_id, priority);

create trigger tickets_set_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();

create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  ai_enabled boolean not null default true,
  auto_reply boolean not null default false,
  learning_mode boolean not null default false,
  confidence_threshold integer not null default 70 check (confidence_threshold between 0 and 100),
  max_response_length integer not null default 250,
  tone_value integer not null default 50 check (tone_value between 0 and 100),
  selected_persona public.ai_persona not null default 'professional',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_settings_org_unique unique (org_id)
);

create trigger ai_settings_set_updated_at
before update on public.ai_settings
for each row
execute function public.set_updated_at();

create table if not exists public.response_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  category text not null,
  content text not null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists response_templates_org_updated_at_idx on public.response_templates (org_id, updated_at desc);
create index if not exists response_templates_org_title_idx on public.response_templates (org_id, title);

create trigger response_templates_set_updated_at
before update on public.response_templates
for each row
execute function public.set_updated_at();

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  status public.ai_run_status not null default 'queued',
  intent text null,
  urgency public.ai_urgency null,
  confidence integer null check (confidence between 0 and 100),
  sentiment integer null check (sentiment between 1 and 10),
  draft_response text null,
  error text null,
  started_at timestamptz null,
  finished_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_runs_org_created_at_idx on public.ai_runs (org_id, created_at desc);
create index if not exists ai_runs_ticket_created_at_idx on public.ai_runs (ticket_id, created_at desc);
create index if not exists ai_runs_org_status_idx on public.ai_runs (org_id, status);

create trigger ai_runs_set_updated_at
before update on public.ai_runs
for each row
execute function public.set_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  type public.notification_type not null,
  priority public.notification_priority not null default 'normal',
  title text not null,
  message text not null,
  ticket_id uuid null references public.tickets (id) on delete set null,
  read_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_org_created_at_idx on public.notifications (org_id, created_at desc);
create index if not exists notifications_org_read_at_idx on public.notifications (org_id, read_at);

create trigger notifications_set_updated_at
before update on public.notifications
for each row
execute function public.set_updated_at();

-- Keep customers.last_ticket_at current (best-effort for MVP).
create or replace function public.touch_customer_last_ticket_at()
returns trigger
language plpgsql
as $$
begin
  update public.customers
    set last_ticket_at = greatest(coalesce(last_ticket_at, new.created_at), new.created_at)
  where id = new.customer_id;
  return new;
end;
$$;

create trigger tickets_touch_customer_last_ticket_at
after insert on public.tickets
for each row
execute function public.touch_customer_last_ticket_at();

-- RLS helper: membership check (invoker rights; relies on memberships RLS).
create or replace function public.is_org_member(check_org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = check_org_id
      and m.user_id = auth.uid()
  );
$$;

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.customers enable row level security;
alter table public.tickets enable row level security;
alter table public.ai_settings enable row level security;
alter table public.response_templates enable row level security;
alter table public.ai_runs enable row level security;
alter table public.notifications enable row level security;

-- RLS policies
do $$ begin
  create policy organizations_select on public.organizations
    for select using (public.is_org_member(id));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy profiles_select on public.profiles
    for select using (user_id = auth.uid());
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy profiles_update on public.profiles
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy memberships_select on public.memberships
    for select using (user_id = auth.uid());
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy customers_select on public.customers
    for select using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy customers_insert on public.customers
    for insert with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy customers_update on public.customers
    for update using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy customers_delete on public.customers
    for delete using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy tickets_select on public.tickets
    for select using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy tickets_insert on public.tickets
    for insert with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy tickets_update on public.tickets
    for update using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy tickets_delete on public.tickets
    for delete using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy ai_settings_select on public.ai_settings
    for select using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy ai_settings_insert on public.ai_settings
    for insert with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy ai_settings_update on public.ai_settings
    for update using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy response_templates_select on public.response_templates
    for select using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy response_templates_insert on public.response_templates
    for insert with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy response_templates_update on public.response_templates
    for update using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy response_templates_delete on public.response_templates
    for delete using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy ai_runs_select on public.ai_runs
    for select using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy ai_runs_insert on public.ai_runs
    for insert with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy ai_runs_update on public.ai_runs
    for update using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy ai_runs_delete on public.ai_runs
    for delete using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy notifications_select on public.notifications
    for select using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy notifications_insert on public.notifications
    for insert with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy notifications_update on public.notifications
    for update using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create policy notifications_delete on public.notifications
    for delete using (public.is_org_member(org_id));
exception
  when duplicate_object then null;
end $$;

-- Auth hook: create personal org + membership + profile on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
  org_name text;
begin
  org_name := coalesce(new.raw_user_meta_data->>'full_name', new.email, 'Personal');

  insert into public.organizations (name)
    values (org_name)
    returning id into org_id;

  insert into public.profiles (user_id, current_org_id)
    values (new.id, org_id);

  insert into public.memberships (org_id, user_id, role)
    values (org_id, new.id, 'owner');

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
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
