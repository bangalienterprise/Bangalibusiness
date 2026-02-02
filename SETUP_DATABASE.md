-- =============================================================================
-- FINAL DATABASE REPAIR SCRIPT (V2 COMPATIBLE)
-- =============================================================================
-- Run this in Supabase SQL Editor to fix the "referenced relation... is not a table" error.
-- =============================================================================

-- 1. Create Damages Table
create table if not exists public.damages (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    user_id uuid references public.profiles(id),
    total_loss numeric default 0,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Damage Items Table (References ITEMS table, not PRODUCTS view)
create table if not exists public.damage_items (
    id uuid default uuid_generate_v4() primary key,
    damage_id uuid references public.damages(id) on delete cascade not null,
    product_id uuid references public.items(id), -- Corrected reference
    product_name text,
    quantity integer default 1,
    reason text,
    loss_amount numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Collections Table (References CONTACTS if V2, or CUSTOMERS if V1)
-- We attempt to reference contacts first, assuming V2.
do $$ 
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'contacts') then
      create table if not exists public.collections (
          id uuid default uuid_generate_v4() primary key,
          business_id uuid references public.businesses(id) on delete cascade not null,
          customer_id uuid references public.contacts(id),
          amount_paid numeric not null,
          payment_method text default 'Cash',
          collected_by uuid references public.profiles(id),
          note text,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
  else
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
  end if;
end $$;

-- 4. Enable RLS
alter table public.damages enable row level security;
alter table public.damage_items enable row level security;
alter table public.collections enable row level security;

create policy "Enable all for damages" on damages for all using (true);
create policy "Enable all for damage_items" on damage_items for all using (true);
create policy "Enable all for collections" on collections for all using (true);

-- 5. Helper Functions (Targeting ITEMS table)
create or replace function decrement_stock(p_id uuid, p_qty integer)
returns void as $$
begin
  update public.items
  set stock_quantity = stock_quantity - p_qty
  where id = p_id;
end;
$$ language plpgsql;

create or replace function increment_customer_due(row_id uuid, amount numeric)
returns void as $$
begin
  -- Check if contacts table exists (V2)
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'contacts') then
      update public.contacts set balance = coalesce(balance, 0) + amount where id = row_id;
  else
      update public.customers set current_due = coalesce(current_due, 0) + amount where id = row_id;
  end if;
end;
$$ language plpgsql;