-- Admin platform upgrade:
-- contests management, multi-target contests, richer exercises metadata,
-- and guaranteed owner admin + Elite premium subscription.

create extension if not exists pgcrypto;

create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_target_exams (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  contest_id uuid not null references public.contests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, contest_id)
);

create table if not exists public.exercise_contests (
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  contest_id uuid not null references public.contests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (exercise_id, contest_id)
);

alter table public.exercises add column if not exists sets_count integer;
alter table public.exercises add column if not exists reps_text text;
alter table public.exercises add column if not exists rest_seconds integer;
alter table public.exercises add column if not exists estimated_duration_minutes integer;
alter table public.exercises add column if not exists equipment text;

alter table public.contests enable row level security;
alter table public.profile_target_exams enable row level security;
alter table public.exercise_contests enable row level security;

drop policy if exists "Anyone can view active contests" on public.contests;
drop policy if exists "Admins can insert contests" on public.contests;
drop policy if exists "Admins can update contests" on public.contests;
drop policy if exists "Admins can delete contests" on public.contests;

drop policy if exists "Users can view own target exams" on public.profile_target_exams;
drop policy if exists "Users can insert own target exams" on public.profile_target_exams;
drop policy if exists "Users can delete own target exams" on public.profile_target_exams;

drop policy if exists "Anyone can view exercise contests" on public.exercise_contests;
drop policy if exists "Admins can insert exercise contests" on public.exercise_contests;
drop policy if exists "Admins can delete exercise contests" on public.exercise_contests;

create policy "Anyone can view active contests"
on public.contests
for select
using (is_active = true or public.is_admin());

create policy "Admins can insert contests"
on public.contests
for insert
with check (public.is_admin());

create policy "Admins can update contests"
on public.contests
for update
using (public.is_admin());

create policy "Admins can delete contests"
on public.contests
for delete
using (public.is_admin());

create policy "Users can view own target exams"
on public.profile_target_exams
for select
using (auth.uid() = profile_id or public.is_admin());

create policy "Users can insert own target exams"
on public.profile_target_exams
for insert
with check (auth.uid() = profile_id or public.is_admin());

create policy "Users can delete own target exams"
on public.profile_target_exams
for delete
using (auth.uid() = profile_id or public.is_admin());

create policy "Anyone can view exercise contests"
on public.exercise_contests
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.exercises e
    where e.id = exercise_id
      and e.is_active = true
  )
);

create policy "Admins can insert exercise contests"
on public.exercise_contests
for insert
with check (public.is_admin());

create policy "Admins can delete exercise contests"
on public.exercise_contests
for delete
using (public.is_admin());

create or replace function public.sync_profile_target_exam_text(p_profile_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  aggregated_names text;
begin
  select string_agg(c.name, ', ' order by c.name)
  into aggregated_names
  from public.profile_target_exams pte
  join public.contests c on c.id = pte.contest_id
  where pte.profile_id = p_profile_id;

  update public.profiles
  set
    target_exam = aggregated_names,
    updated_at = now()
  where id = p_profile_id;
end;
$$;

create or replace function public.handle_profile_target_exam_sync()
returns trigger
language plpgsql
security definer
as $$
begin
  perform public.sync_profile_target_exam_text(coalesce(new.profile_id, old.profile_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_profile_target_exam_sync on public.profile_target_exams;
create trigger trg_profile_target_exam_sync
after insert or delete on public.profile_target_exams
for each row execute procedure public.handle_profile_target_exam_sync();

create or replace function public.ensure_owner_admin_premium()
returns void
language plpgsql
security definer
as $$
declare
  owner_profile_id uuid;
begin
  update public.profiles
  set
    role = 'admin',
    updated_at = now()
  where lower(email) = lower('marcosapps2020@gmail.com');

  select id
  into owner_profile_id
  from public.profiles
  where lower(email) = lower('marcosapps2020@gmail.com')
  limit 1;

  if owner_profile_id is not null then
    insert into public.subscriptions (
      user_id,
      plan_name,
      status,
      started_at,
      expires_at,
      gateway,
      gateway_subscription_id,
      updated_at
    )
    select
      owner_profile_id,
      'Elite',
      'active',
      now(),
      null,
      'system_admin',
      'super-admin-elite-indefinite',
      now()
    where not exists (
      select 1
      from public.subscriptions
      where user_id = owner_profile_id
    );

    update public.subscriptions
    set
      plan_name = 'Elite',
      status = 'active',
      expires_at = null,
      gateway = 'system_admin',
      gateway_subscription_id = 'super-admin-elite-indefinite',
      updated_at = now()
    where user_id = owner_profile_id;
  end if;
end;
$$;

select public.ensure_owner_admin_premium();

insert into public.contests (name, slug, description, is_active)
values
  ('Policia Militar', 'policia-militar', 'Concurso para Policia Militar', true),
  ('Policia Civil', 'policia-civil', 'Concurso para Policia Civil', true),
  ('Policia Federal', 'policia-federal', 'Concurso para Policia Federal', true),
  ('PRF', 'prf', 'Concurso para Policia Rodoviaria Federal', true),
  ('Bombeiros', 'bombeiros', 'Concurso para Corpo de Bombeiros', true),
  ('Guarda Municipal', 'guarda-municipal', 'Concurso para Guarda Municipal', true),
  ('Forcas Armadas', 'forcas-armadas', 'Concurso para Forcas Armadas', true)
on conflict (slug) do nothing;
