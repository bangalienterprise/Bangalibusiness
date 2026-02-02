
import pkg from 'pg';
const { Client } = pkg;

const password = "BangaliEnterprise@2025.!?";
const user = "postgres.dwjdkwhnqmjwfevklrat";

// Using one of the IPs found via nslookup for ap-southeast-1 pooler
const client = new Client({
  host: '54.255.219.82',
  port: 6543,
  database: 'postgres',
  user: user,
  password: password,
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- 1. Gift Cards Table
create table if not exists public.gift_cards (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    code text not null,
    initial_balance numeric not null,
    current_balance numeric not null,
    expiration_date timestamp with time zone,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(business_id, code)
);

-- 2. Suppliers Table
create table if not exists public.suppliers (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    name text not null,
    contact_person text,
    phone text,
    email text,
    address text,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Supplier Orders (Purchase Orders)
create table if not exists public.purchase_orders (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    supplier_id uuid references public.suppliers(id) on delete set null,
    total_amount numeric default 0,
    status text default 'pending', 
    order_date timestamp with time zone default now(),
    expected_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.gift_cards enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;

-- Policies (Re-create to ensure no conflicts)
drop policy if exists "Manage Gift Cards" on gift_cards;
drop policy if exists "Manage Suppliers" on suppliers;
drop policy if exists "Manage Purchase Orders" on purchase_orders;

create policy "Manage Gift Cards" on gift_cards for all using (true);
create policy "Manage Suppliers" on suppliers for all using (true);
create policy "Manage Purchase Orders" on purchase_orders for all using (true);
`;

async function main() {
  try {
    console.log("Connecting to Database for Final Setup...");
    await client.connect();
    console.log("Connected! Applying Schema...");
    await client.query(sql);
    console.log("✅ SUCCESS: All production tables (Gift Cards, Suppliers) are created.");
  } catch (err) {
    console.error("❌ FAILED:", err.message);
    if (err.message.includes("Tenant or user")) {
        console.log("⚠️  NOTE: Connection failed (Likely Network/Region)."); 
        console.log("   Please copy content from 'src/sql/final_production_setup.sql' into Supabase SQL Editor manually.");
    }
  } finally {
    await client.end();
  }
}
main();
