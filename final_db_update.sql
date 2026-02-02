-- =============================================================================
-- FINAL PRODUCTION DB UPDATE (APPENDED)
-- Adds missing tables for Retail Features (Damages, Collections, etc.)
-- =============================================================================

-- 1. Create Business Invitations Table (Missing in master_setup)
create table if not exists public.business_invitations (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    email text not null,
    role text not null,
    permissions jsonb default '[]'::jsonb,
    code text unique not null,
    status text default 'pending', -- pending, accepted, expired
    created_by uuid references public.profiles(id),
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for Invitations
alter table public.business_invitations enable row level security;
create policy "Read invitations by code" on business_invitations for select using (true);
create policy "Create invitations" on business_invitations for insert to authenticated with check (true);
create policy "Update invitations" on business_invitations for update using (true);

-- 2. Add Permissions to Business Users Table
alter table public.business_users 
add column if not exists permissions jsonb default '[]'::jsonb;

-- 3. Damages Table
create table if not exists public.damages (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    user_id uuid references public.profiles(id),
    total_loss numeric default 0,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Damage Items (Details)
create table if not exists public.damage_items (
    id uuid default uuid_generate_v4() primary key,
    damage_id uuid references public.damages(id) on delete cascade not null,
    product_id uuid references public.products(id), -- Nullable in case product deleted
    product_name text, -- Keep name for history
    quantity integer default 1,
    reason text,
    loss_amount numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Damages
alter table public.damages enable row level security;
alter table public.damage_items enable row level security;
create policy "Authenticated users can view damages" on damages for select using (auth.uid() in (select user_id from business_users where business_id = damages.business_id));
create policy "Authenticated users can create damages" on damages for insert with check (auth.uid() in (select user_id from business_users where business_id = damages.business_id));
create policy "Authenticated users can view damage items" on damage_items for select using (true); 
create policy "Authenticated users can create damage items" on damage_items for insert with check (true);

-- 4. Collections Table (For Due Payments)
create table if not exists public.collections (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    customer_id uuid references public.customers(id),
    amount_paid numeric not null,
    payment_method text default 'Cash',
    collected_by uuid references public.profiles(id),
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Collections
alter table public.collections enable row level security;
create policy "Authenticated users can viewing collections" on collections for select using (auth.uid() in (select user_id from business_users where business_id = collections.business_id));
create policy "Authenticated users can insert collections" on collections for insert with check (auth.uid() in (select user_id from business_users where business_id = collections.business_id));

-- 5. Ensure Customers have current_due
alter table public.customers 
add column if not exists current_due numeric default 0;

-- 6. Ensure Products have stock_qty
alter table public.products 
add column if not exists stock_qty integer default 0;
alter table public.products 
add column if not exists stock_quantity integer default 0;

-- 7. Add Logo URL to Businesses Table (For Branding)
alter table public.businesses 
add column if not exists logo_url text;

-- 8. Business Settings Storage Bucket
insert into storage.buckets (id, name, public) 
values ('business-branding', 'business-branding', true) 
on conflict (id) do nothing;

create policy "Authenticated Users can upload logos" on storage.objects 
for insert with check ( bucket_id = 'business-branding' and auth.role() = 'authenticated' );

create policy "Public Access to Branding" on storage.objects
for select using ( bucket_id = 'business-branding' );

-- 9. RPC Functions (For Atomic Updates)
create or replace function increment_customer_due(row_id uuid, amount numeric)
returns void as $$
begin
  update public.customers
  set current_due = coalesce(current_due, 0) + amount
  where id = row_id;
end;
$$ language plpgsql;

create or replace function decrement_stock(p_id uuid, p_qty integer)
returns void as $$
begin
  update public.products
  set stock_quantity = stock_quantity - p_qty
  where id = p_id;
end;
$$ language plpgsql;

-- End of Update
