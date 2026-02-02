
import pkg from 'pg';
const { Client } = pkg;

const password = "BangaliEnterprise@2025.!?";
const projectRef = "dwjdkwhnqmjwfevklrat";

// Direct connection string (bypassing pooler for schema operations)
const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }, // Required for direct connections usually
  connectionTimeoutMillis: 10000
});

const sql = `
-- 1. Create Damages Table
create table if not exists public.damages (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    user_id uuid references public.profiles(id),
    total_loss numeric default 0,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Damage Items Table (FIXED: References 'items' instead of 'products')
create table if not exists public.damage_items (
    id uuid default uuid_generate_v4() primary key,
    damage_id uuid references public.damages(id) on delete cascade not null,
    product_id uuid references public.items(id), -- FIXED: References items table
    product_name text,
    quantity integer default 1,
    reason text,
    loss_amount numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Collections Table
create table if not exists public.collections (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    customer_id uuid references public.contacts(id), -- FIXED: References contacts (if V2 uses contacts for customers)
    amount_paid numeric not null,
    payment_method text default 'Cash',
    collected_by uuid references public.profiles(id),
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Security
alter table public.damages enable row level security;
alter table public.damage_items enable row level security;
alter table public.collections enable row level security;

create policy "Enable all for damages" on damages for all using (true);
create policy "Enable all for damage_items" on damage_items for all using (true);
create policy "Enable all for collections" on collections for all using (true);

-- 5. Helper Functions (FIXED: Updates 'items' table)
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
  update public.contacts -- FIXED: Updates contacts table
  set balance = coalesce(balance, 0) + amount -- V2 uses 'balance'
  where id = row_id;
end;
$$ language plpgsql;

-- 6. Sales Tables (Legacy support, mapped to items/contacts)
create table if not exists public.sales_transactions (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    sold_by uuid references public.profiles(id),
    customer_id uuid references public.contacts(id),
    total_amount numeric default 0,
    paid_amount numeric default 0,
    due_amount numeric default 0,
    profit numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.sales_items (
    id uuid default uuid_generate_v4() primary key,
    sale_id uuid references public.sales_transactions(id) on delete cascade not null,
    product_id uuid references public.items(id), -- FIXED
    qty integer default 1,
    price numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sales_transactions enable row level security;
alter table public.sales_items enable row level security;
create policy "Enable all sales" on sales_transactions for all using (true);
create policy "Enable all sales items" on sales_items for all using (true);
`;

async function sync() {
  try {
    console.log("Connecting to Database (Direct)...");
    await client.connect();
    console.log("Connected! Applying Fixes...");
    await client.query(sql);
    console.log("✅ SUCCESS: Database structure fixed and synced!");
  } catch (err) {
    console.error("❌ FAILED:", err.message);
    if (err.message.includes("addrinfo")) {
        console.log("⚠️  Network Error: Your computer cannot reach the Supabase database directly.");
        console.log("   Please copy the content of 'SETUP_DATABASE.md' into your Supabase SQL Editor.");
    }
  } finally {
    await client.end();
  }
}

sync();
