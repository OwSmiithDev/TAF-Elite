-- Execute this entire script in your Supabase SQL Editor

-- 1. Enable necessary extensions
create extension if not exists pgcrypto;

-- 2. Create tables
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  gender text,
  birth_date date,
  height_cm numeric,
  weight_kg numeric,
  target_exam text,
  exam_date date,
  current_level text,
  training_days_per_week integer,
  goal_type text,
  physical_restrictions text,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add role column if the table already existed
alter table profiles add column if not exists role text default 'user';

create table if not exists onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  pullups_max integer,
  pushups_max integer,
  situps_max integer,
  running_level text,
  weekly_availability integer,
  has_injuries boolean default false,
  injury_notes text,
  preferred_goal text,
  created_at timestamptz default now()
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text not null,
  difficulty_level text,
  description text,
  instructions text,
  common_mistakes text,
  tips text,
  safety_notes text,
  video_url text,
  thumbnail_url text,
  is_premium boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists training_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text,
  objective text,
  duration_weeks integer,
  weekly_days integer,
  is_premium boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists user_active_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid not null references training_plans(id),
  started_at timestamptz default now(),
  current_week integer default 1,
  current_day integer default 1,
  status text default 'active'
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  day_order integer,
  objective text,
  estimated_duration_minutes integer,
  is_active boolean default true
);

create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  workout_id uuid not null references workouts(id),
  completed_at timestamptz default now(),
  duration_minutes integer,
  notes text
);

create table if not exists fitness_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  test_date date not null,
  pullups_result integer,
  pushups_result integer,
  situps_result integer,
  run_distance_meters integer,
  run_time_seconds integer,
  observations text
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_name text,
  status text,
  started_at timestamptz,
  expires_at timestamptz,
  gateway text,
  gateway_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table onboarding_answers enable row level security;
alter table exercises enable row level security;
alter table training_plans enable row level security;
alter table user_active_plans enable row level security;
alter table workouts enable row level security;
alter table workout_logs enable row level security;
alter table fitness_tests enable row level security;
alter table subscriptions enable row level security;

-- 4. Create RLS Policies

-- Admin check function
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    coalesce((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'), '') = 'admin'
    or 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
end;
$$ language plpgsql security definer;

-- Drop existing policies if they exist to avoid conflicts when re-running
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Admins can delete profiles" on profiles;

drop policy if exists "Users can view own onboarding" on onboarding_answers;
drop policy if exists "Users can insert own onboarding" on onboarding_answers;
drop policy if exists "Users can update own onboarding" on onboarding_answers;
drop policy if exists "Admins can delete onboarding" on onboarding_answers;

drop policy if exists "Anyone can view active exercises" on exercises;
drop policy if exists "Admins can insert exercises" on exercises;
drop policy if exists "Admins can update exercises" on exercises;
drop policy if exists "Admins can delete exercises" on exercises;

drop policy if exists "Anyone can view active plans" on training_plans;
drop policy if exists "Admins can insert plans" on training_plans;
drop policy if exists "Admins can update plans" on training_plans;
drop policy if exists "Admins can delete plans" on training_plans;

drop policy if exists "Anyone can view active workouts" on workouts;
drop policy if exists "Admins can insert workouts" on workouts;
drop policy if exists "Admins can update workouts" on workouts;
drop policy if exists "Admins can delete workouts" on workouts;

drop policy if exists "Users can view own active plans" on user_active_plans;
drop policy if exists "Users can insert own active plans" on user_active_plans;
drop policy if exists "Users can update own active plans" on user_active_plans;
drop policy if exists "Admins can delete active plans" on user_active_plans;

drop policy if exists "Users can view own workout logs" on workout_logs;
drop policy if exists "Users can insert own workout logs" on workout_logs;
drop policy if exists "Users can update own workout logs" on workout_logs;
drop policy if exists "Admins can delete workout logs" on workout_logs;

drop policy if exists "Users can view own fitness tests" on fitness_tests;
drop policy if exists "Users can insert own fitness tests" on fitness_tests;
drop policy if exists "Users can update own fitness tests" on fitness_tests;
drop policy if exists "Admins can delete fitness tests" on fitness_tests;

drop policy if exists "Users can view own subscriptions" on subscriptions;
drop policy if exists "Admins can insert subscriptions" on subscriptions;
drop policy if exists "Admins can update subscriptions" on subscriptions;
drop policy if exists "Admins can delete subscriptions" on subscriptions;


-- Profiles: Users can read and update their own profile, Admins can do everything
create policy "Users can view own profile" on profiles for select using (auth.uid() = id or public.is_admin());
create policy "Users can update own profile" on profiles for update using (auth.uid() = id or public.is_admin());
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id or public.is_admin());
create policy "Admins can delete profiles" on profiles for delete using (public.is_admin());

-- Onboarding: Users can read, insert, update their own answers, Admins can do everything
create policy "Users can view own onboarding" on onboarding_answers for select using (auth.uid() = user_id or public.is_admin());
create policy "Users can insert own onboarding" on onboarding_answers for insert with check (auth.uid() = user_id or public.is_admin());
create policy "Users can update own onboarding" on onboarding_answers for update using (auth.uid() = user_id or public.is_admin());
create policy "Admins can delete onboarding" on onboarding_answers for delete using (public.is_admin());

-- Exercises & Plans: Anyone authenticated can read active, Admins can do everything
create policy "Anyone can view active exercises" on exercises for select using (is_active = true or public.is_admin());
create policy "Admins can insert exercises" on exercises for insert with check (public.is_admin());
create policy "Admins can update exercises" on exercises for update using (public.is_admin());
create policy "Admins can delete exercises" on exercises for delete using (public.is_admin());

create policy "Anyone can view active plans" on training_plans for select using (is_active = true or public.is_admin());
create policy "Admins can insert plans" on training_plans for insert with check (public.is_admin());
create policy "Admins can update plans" on training_plans for update using (public.is_admin());
create policy "Admins can delete plans" on training_plans for delete using (public.is_admin());

-- Workouts: Anyone authenticated can read active, Admins can do everything
create policy "Anyone can view active workouts" on workouts for select using (is_active = true or public.is_admin());
create policy "Admins can insert workouts" on workouts for insert with check (public.is_admin());
create policy "Admins can update workouts" on workouts for update using (public.is_admin());
create policy "Admins can delete workouts" on workouts for delete using (public.is_admin());

-- User Active Plans
create policy "Users can view own active plans" on user_active_plans for select using (auth.uid() = user_id or public.is_admin());
create policy "Users can insert own active plans" on user_active_plans for insert with check (auth.uid() = user_id or public.is_admin());
create policy "Users can update own active plans" on user_active_plans for update using (auth.uid() = user_id or public.is_admin());
create policy "Admins can delete active plans" on user_active_plans for delete using (public.is_admin());

-- Workout Logs
create policy "Users can view own workout logs" on workout_logs for select using (auth.uid() = user_id or public.is_admin());
create policy "Users can insert own workout logs" on workout_logs for insert with check (auth.uid() = user_id or public.is_admin());
create policy "Users can update own workout logs" on workout_logs for update using (auth.uid() = user_id or public.is_admin());
create policy "Admins can delete workout logs" on workout_logs for delete using (public.is_admin());

-- Fitness Tests
create policy "Users can view own fitness tests" on fitness_tests for select using (auth.uid() = user_id or public.is_admin());
create policy "Users can insert own fitness tests" on fitness_tests for insert with check (auth.uid() = user_id or public.is_admin());
create policy "Users can update own fitness tests" on fitness_tests for update using (auth.uid() = user_id or public.is_admin());
create policy "Admins can delete fitness tests" on fitness_tests for delete using (public.is_admin());

-- Subscriptions
create policy "Users can view own subscriptions" on subscriptions for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins can insert subscriptions" on subscriptions for insert with check (public.is_admin());
create policy "Admins can update subscriptions" on subscriptions for update using (public.is_admin());
create policy "Admins can delete subscriptions" on subscriptions for delete using (public.is_admin());

-- 5. Set up Storage for Avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

-- Storage Policies for Avatars
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Anyone can update their own avatar." on storage.objects;
drop policy if exists "Admins can delete avatars" on storage.objects;

create policy "Avatar images are publicly accessible." on storage.objects for select using (bucket_id = 'avatars');
create policy "Anyone can upload an avatar." on storage.objects for insert with check (bucket_id = 'avatars');
create policy "Anyone can update their own avatar." on storage.objects for update using (bucket_id = 'avatars');
create policy "Admins can delete avatars" on storage.objects for delete using (bucket_id = 'avatars' and public.is_admin());

-- 6. Create a trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
