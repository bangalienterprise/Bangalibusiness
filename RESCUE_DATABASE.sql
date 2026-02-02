-- =============================================================================
-- RESCUE DATABASE SCRIPT (Fixes Signup & Permissions)
-- =============================================================================
-- Run this in Supabase SQL Editor to ensure users can sign up perfectly.
-- =============================================================================

-- 1. Ensure Profiles Table allows Insert/Update
-- This is critical because our client code manually creates the profile after signup.
alter table public.profiles enable row level security;

-- Allow users to insert their OWN profile
drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" on profiles
for insert with check (auth.uid() = id);

-- Allow users to update their OWN profile
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
for update using (auth.uid() = id);

-- Allow users to read their OWN profile (and others if public)
drop policy if exists "Profiles are viewable by everyone" on profiles;
create policy "Profiles are viewable by everyone" on profiles
for select using (true);

-- 2. Ensure Businesses Table allows Creation
alter table public.businesses enable row level security;

-- Allow authenticated users to create a business
drop policy if exists "Authenticated users can create businesses" on businesses;
create policy "Authenticated users can create businesses" on businesses
for insert to authenticated with check (auth.uid() = owner_id);

-- Allow owners to update their business
drop policy if exists "Owners can update business" on businesses;
create policy "Owners can update business" on businesses
for update using (auth.uid() = owner_id);

-- 3. Ensure Business Users (Team) Table allows Creation
alter table public.business_users enable row level security;

-- Allow creating the initial owner link
drop policy if exists "Users can create business links" on business_users;
create policy "Users can create business links" on business_users
for insert to authenticated with check (auth.uid() = user_id);

-- 4. Triggers (Optional but Recommended Backup)
-- If the client-side script fails, this trigger ensures a profile exists.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Fix Sequences (Just in case)
-- Ensure ID sequences are not out of sync
-- (Not needed for UUIDs, but good practice if you had integer IDs mixed in)
