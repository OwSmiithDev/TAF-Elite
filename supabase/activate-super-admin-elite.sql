-- Activates the Elite premium plan indefinitely for the super admin.
-- Run this in the Supabase SQL Editor.

with target_user as (
  select id
  from public.profiles
  where lower(email) = lower('SEU-EMAIL-ADMIN')
  limit 1
),
updated as (
  update public.subscriptions
  set
    plan_name = 'Elite',
    status = 'active',
    expires_at = null,
    started_at = coalesce(started_at, timezone('utc', now())),
    gateway = coalesce(gateway, 'manual_admin'),
    gateway_subscription_id = coalesce(gateway_subscription_id, 'super-admin-elite-indefinite'),
    updated_at = timezone('utc', now())
  where user_id = (select id from target_user)
  returning id
)
insert into public.subscriptions (
  user_id,
  plan_name,
  status,
  started_at,
  expires_at,
  gateway,
  gateway_subscription_id
)
select
  id,
  'Elite',
  'active',
  timezone('utc', now()),
  null,
  'manual_admin',
  'super-admin-elite-indefinite'
from target_user
where not exists (select 1 from updated);
