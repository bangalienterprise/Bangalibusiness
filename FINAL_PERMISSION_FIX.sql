-- =============================================================================
-- FINAL PERMISSION FIX (Run in Supabase SQL Editor)
-- =============================================================================

-- 1. PROFILES: Allow users to manage their own profile
alter table public.profiles enable row level security;

-- Drop existing restrictive policies
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Profiles are viewable by everyone" on profiles;

-- Create permissive policies for authenticated users
create policy "Users can insert their own profile" on profiles
for insert to authenticated with check (auth.uid() = id);

create policy "Users can update own profile" on profiles
for update to authenticated using (auth.uid() = id);

create policy "Profiles are viewable by everyone" on profiles
for select to authenticated using (true);

-- 2. BUSINESSES: Allow creation
alter table public.businesses enable row level security;

drop policy if exists "Authenticated users can create businesses" on businesses;
create policy "Authenticated users can create businesses" on businesses
for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "Owners can update business" on businesses;
create policy "Owners can update business" on businesses
for update to authenticated using (auth.uid() = owner_id);

drop policy if exists "Businesses viewable by authenticated" on businesses;
create policy "Businesses viewable by authenticated" on businesses
for select to authenticated using (true);

-- 3. BUSINESS USERS: Allow linking
alter table public.business_users enable row level security;

drop policy if exists "Users can create business links" on business_users;
create policy "Users can create business links" on business_users
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can view own memberships" on business_users;
create policy "Users can view own memberships" on business_users
for select to authenticated using (true);

-- 4. SYSTEM SETTINGS: Ensure table exists and is accessible
create table if not exists public.business_settings (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    currency text default 'BDT',
    timezone text default 'Asia/Dhaka',
    tax_rate numeric default 0,
    logo_url text,
    created_at timestamp with time zone default now(),
    unique(business_id)
);

alter table public.business_settings enable row level security;

create policy "Owners can manage settings" on business_settings
for all to authenticated using (
    exists (
        select 1 from businesses 
        where businesses.id = business_settings.business_id 
        and businesses.owner_id = auth.uid()
    )
);

create policy "Users can view settings" on business_settings
for select to authenticated using (true);

-- 5. TRIGGER: Auto-create profile (Failsafe)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'owner')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
