-- =============================================================================
-- MASTER DATABASE FIX & SETUP (Run this in Supabase SQL Editor)
-- =============================================================================

-- 1. SYSTEM SETTINGS (Global)
create table if not exists public.system_settings (
    id uuid default uuid_generate_v4() primary key,
    configurations jsonb default '{}'::jsonb,
    updated_at timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);
alter table public.system_settings enable row level security;
create policy "Read System Settings" on system_settings for select using (true);
create policy "Admin Manage System Settings" on system_settings for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'global_admin')
);

-- 2. BUSINESSES
create table if not exists public.businesses (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    type text default 'retail',
    owner_id uuid references auth.users(id),
    subscription_status text default 'active',
    created_at timestamp with time zone default now()
);
alter table public.businesses enable row level security;
create policy "Public create business" on businesses for insert with check (auth.uid() = owner_id);
create policy "Owner update business" on businesses for update using (auth.uid() = owner_id);
create policy "Read businesses" on businesses for select using (true);

-- 3. PROFILES
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text,
    full_name text,
    role text default 'viewer',
    business_id uuid references public.businesses(id),
    created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Read all profiles" on profiles for select using (true);

-- 4. BUSINESS USERS
create table if not exists public.business_users (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    user_id uuid references public.profiles(id),
    role text default 'viewer',
    created_at timestamp with time zone default now()
);
alter table public.business_users enable row level security;
create policy "Manage business users" on business_users for all using (true);

-- 5. BUSINESS SETTINGS (Per Business)
create table if not exists public.business_settings (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade unique,
    currency text default 'BDT',
    timezone text default 'Asia/Dhaka',
    tax_rate numeric default 0,
    created_at timestamp with time zone default now()
);
alter table public.business_settings enable row level security;
create policy "Manage business settings" on business_settings for all using (
    exists (select 1 from businesses where id = business_id and owner_id = auth.uid())
);
create policy "Read business settings" on business_settings for select using (true);

-- 6. CONTACTS (Customers/Suppliers)
create table if not exists public.contacts (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    name text not null,
    type text, -- customer, supplier
    email text,
    phone text,
    address text,
    balance numeric default 0, -- Due/Credit
    created_at timestamp with time zone default now()
);
alter table public.contacts enable row level security;
create policy "Manage contacts" on contacts for all using (true);

-- Legacy 'customers' view/table support
create table if not exists public.customers (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    name text,
    phone text,
    email text,
    address text,
    current_due numeric default 0,
    created_at timestamp with time zone default now()
);
alter table public.customers enable row level security;
create policy "Manage customers" on customers for all using (true);

create table if not exists public.suppliers (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    name text,
    contact_person text,
    phone text,
    email text,
    address text,
    status text,
    created_at timestamp with time zone default now()
);
alter table public.suppliers enable row level security;
create policy "Manage suppliers" on suppliers for all using (true);


-- 7. ITEMS (Products/Services)
create table if not exists public.items (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    name text not null,
    type text default 'product',
    sku text,
    buying_price numeric default 0,
    selling_price numeric default 0,
    stock_quantity integer default 0,
    alert_quantity integer default 5,
    category_id text,
    image_url text,
    description text,
    created_at timestamp with time zone default now()
);
alter table public.items enable row level security;
create policy "Manage items" on items for all using (true);

-- Legacy 'products' table support
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    name text,
    sku text,
    buying_price numeric default 0,
    selling_price numeric default 0,
    stock_quantity integer default 0,
    alert_qty integer default 5,
    category_id text,
    created_at timestamp with time zone default now()
);
alter table public.products enable row level security;
create policy "Manage products" on products for all using (true);

create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    name text,
    created_at timestamp with time zone default now()
);
alter table public.categories enable row level security;
create policy "Manage categories" on categories for all using (true);


-- 8. TRANSACTIONS & SALES
create table if not exists public.sales_transactions (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    sold_by uuid references public.profiles(id),
    customer_id uuid references public.customers(id),
    total_amount numeric default 0,
    paid_amount numeric default 0,
    due_amount numeric default 0,
    profit numeric default 0,
    created_at timestamp with time zone default now()
);
alter table public.sales_transactions enable row level security;
create policy "Manage sales" on sales_transactions for all using (true);

create table if not exists public.sales_items (
    id uuid default uuid_generate_v4() primary key,
    sale_id uuid references public.sales_transactions(id),
    product_id uuid references public.products(id),
    qty integer default 0,
    price numeric default 0,
    created_at timestamp with time zone default now()
);
alter table public.sales_items enable row level security;
create policy "Manage sales items" on sales_items for all using (true);

create table if not exists public.expenses (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    amount numeric default 0,
    category text,
    note text,
    date timestamp with time zone,
    created_at timestamp with time zone default now()
);
alter table public.expenses enable row level security;
create policy "Manage expenses" on expenses for all using (true);

create table if not exists public.collections (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    customer_id uuid references public.customers(id),
    amount_paid numeric,
    payment_method text,
    collected_by uuid references public.profiles(id),
    created_at timestamp with time zone default now()
);
alter table public.collections enable row level security;
create policy "Manage collections" on collections for all using (true);


-- 9. OTHER MODULES (Agency, Service, Education)
create table if not exists public.projects (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    title text,
    status text,
    budget numeric,
    client_id uuid references public.contacts(id),
    created_at timestamp with time zone default now()
);
alter table public.projects enable row level security;
create policy "Manage projects" on projects for all using (true);

create table if not exists public.appointments (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    customer_id uuid references public.contacts(id),
    service_id uuid references public.items(id),
    appointment_date timestamp with time zone,
    status text,
    created_at timestamp with time zone default now()
);
alter table public.appointments enable row level security;
create policy "Manage appointments" on appointments for all using (true);

create table if not exists public.students (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    full_name text,
    email text,
    status text,
    enrollment_date timestamp with time zone,
    created_at timestamp with time zone default now()
);
alter table public.students enable row level security;
create policy "Manage students" on students for all using (true);

create table if not exists public.gift_cards (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    code text,
    initial_balance numeric,
    current_balance numeric,
    status text,
    expiration_date timestamp with time zone,
    created_at timestamp with time zone default now()
);
alter table public.gift_cards enable row level security;
create policy "Manage gift cards" on gift_cards for all using (true);

create table if not exists public.damages (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    user_id uuid references public.profiles(id),
    total_loss numeric,
    note text,
    created_at timestamp with time zone default now()
);
alter table public.damages enable row level security;
create policy "Manage damages" on damages for all using (true);

create table if not exists public.damage_items (
    id uuid default uuid_generate_v4() primary key,
    damage_id uuid references public.damages(id),
    product_id uuid references public.products(id),
    qty integer,
    reason text,
    loss_amount numeric,
    created_at timestamp with time zone default now()
);
alter table public.damage_items enable row level security;
create policy "Manage damage items" on damage_items for all using (true);

-- 10. FUNCTIONS
create or replace function decrement_stock(p_id uuid, p_qty integer)
returns void as $$
begin
  update public.products
  set stock_quantity = stock_quantity - p_qty
  where id = p_id;
end;
$$ language plpgsql;

create or replace function increment_customer_due(row_id uuid, amount numeric)
returns void as $$
begin
  update public.customers
  set current_due = coalesce(current_due, 0) + amount
  where id = row_id;
end;
$$ language plpgsql;

-- 11. TRIGGER FOR NEW USERS
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
