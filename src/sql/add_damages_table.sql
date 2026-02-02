-- Run this in Supabase SQL Editor to enable Damage features
create table if not exists public.damages (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id) on delete cascade not null,
    user_id uuid references public.profiles(id),
    total_loss numeric default 0,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.damage_items (
    id uuid default uuid_generate_v4() primary key,
    damage_id uuid references public.damages(id) on delete cascade not null,
    product_id uuid references public.products(id),
    product_name text,
    quantity integer default 1,
    reason text,
    loss_amount numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.damages enable row level security;
alter table public.damage_items enable row level security;

create policy "Authenticated users can view damages" on damages for select using (true);
create policy "Authenticated users can create damages" on damages for insert with check (true);
create policy "Authenticated users can view damage items" on damage_items for select using (true); 
create policy "Authenticated users can create damage items" on damage_items for insert with check (true);
