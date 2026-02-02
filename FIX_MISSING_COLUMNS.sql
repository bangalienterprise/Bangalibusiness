-- =============================================================================
-- DATABASE REPAIR: FORCE ADD MISSING COLUMNS
-- =============================================================================

-- 1. Core Identity Tables
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.business_users 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.business_settings 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id) on delete cascade;

-- 2. CRM & Stakeholders
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

-- 3. Inventory
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

-- 4. Finances
ALTER TABLE public.sales_transactions 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.collections 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

-- 5. Modules
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.gift_cards 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

ALTER TABLE public.damages 
ADD COLUMN IF NOT EXISTS business_id uuid references public.businesses(id);

-- 6. Ensure other critical columns exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer default 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS alert_qty integer default 5;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_due numeric default 0;

-- 7. Re-apply Critical Policies (that might have failed)
-- Ensure RLS is enabled
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage business settings" ON business_settings;
CREATE POLICY "Manage business settings" ON business_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_settings.business_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Read business settings" ON business_settings;
CREATE POLICY "Read business settings" ON business_settings FOR SELECT USING (true);
