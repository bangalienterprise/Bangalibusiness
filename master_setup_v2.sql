-- =============================================================================
-- 1. SETUP & CONFIGURATION
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wipe schema for a clean production build
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- =============================================================================
-- 2. CORE IDENTITY & SAAS MANAGEMENT
-- =============================================================================

-- A. SYSTEM SETTINGS (Global Config)
CREATE TABLE public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform_name TEXT DEFAULT 'Bangali Enterprise',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    configurations JSONB DEFAULT '{}'::jsonb
);

-- B. BUSINESSES (The Tenants)
CREATE TABLE public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL CHECK (industry IN ('retail', 'service', 'agency', 'freelancer', 'wholesale', 'manufacturing')),
    subscription_status TEXT DEFAULT 'active',
    logo_url TEXT,
    settings JSONB DEFAULT '{"currency": "BDT", "tax_rate": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. PROFILES (Users linked to Auth)
-- Note: Includes legacy 'business_id'/'role' columns to support current service code
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    
    -- "Current Context" columns (used by some services as default)
    business_id UUID REFERENCES public.businesses(id), 
    role TEXT,
    
    -- Commission Settings (per user, legacy location)
    commission_rate NUMERIC(5,2) DEFAULT 0,
    commission_type TEXT DEFAULT 'percentage', -- percentage or fixed
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. BUSINESS USERS (Team Access - Many-to-Many)
CREATE TABLE public.business_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'manager', 'seller', 'staff', 'worker')),
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- E. INVITES (Team Invitations)
CREATE TABLE public.invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, expired
    created_by UUID REFERENCES public.profiles(id),
    accepted_by UUID REFERENCES public.profiles(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. UNIFIED CRM & INVENTORY
-- =============================================================================

-- F. CONTACTS (CRM)
CREATE TABLE public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('customer', 'client', 'supplier', 'distributor', 'lead')),
    email TEXT,
    phone TEXT,
    address TEXT,
    balance NUMERIC(15,2) DEFAULT 0, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. CATEGORIES
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'product',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. ITEMS (Inventory & Services)
CREATE TABLE public.items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id),
    name TEXT NOT NULL,
    sku TEXT,
    type TEXT CHECK (type IN ('product', 'service', 'material', 'finished_good')),
    
    cost_price NUMERIC(15,2) DEFAULT 0,
    selling_price NUMERIC(15,2) DEFAULT 0,
    wholesale_price NUMERIC(15,2) DEFAULT 0,
    
    stock_quantity INTEGER DEFAULT 0,
    alert_quantity INTEGER DEFAULT 5,
    unit TEXT DEFAULT 'pcs',
    
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- View for "products" compatibility (if legacy code queries 'products')
CREATE OR REPLACE VIEW public.products AS SELECT * FROM public.items WHERE type = 'product';
CREATE OR REPLACE VIEW public.services AS SELECT * FROM public.items WHERE type = 'service';

-- =============================================================================
-- 4. OPERATIONS (Projects, Mfg, Appointments)
-- =============================================================================

-- I. PROJECTS & JOBS
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id),
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    start_date TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    budget NUMERIC(15,2),
    type TEXT DEFAULT 'project',
    target_quantity INTEGER DEFAULT 0,
    produced_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- J. TIME ENTRIES (Freelancer/Agency)
CREATE TABLE public.time_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    project_id UUID REFERENCES public.projects(id),
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    is_running BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- K. APPOINTMENTS (Service Business)
CREATE TABLE public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id),
    customer_id UUID REFERENCES public.contacts(id),
    service_id UUID REFERENCES public.items(id), -- Linked to Items (Services)
    
    appointment_date TIMESTAMPTZ NOT NULL,
    appointment_end TIMESTAMPTZ, -- For conflict checking
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
    nots TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- L. BILL OF MATERIALS (Manufacturing)
CREATE TABLE public.bom (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    finished_good_id UUID REFERENCES public.items(id),
    material_id UUID REFERENCES public.items(id),
    quantity_needed NUMERIC(10,2) NOT NULL
);

-- =============================================================================
-- 5. FINANCE (Transactions & Commissions)
-- =============================================================================

-- M. TRANSACTIONS
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id),
    
    type TEXT NOT NULL CHECK (type IN ('sale', 'invoice', 'expense', 'purchase_order', 'salary')),
    status TEXT DEFAULT 'completed',
    
    total_amount NUMERIC(15,2) DEFAULT 0,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    due_amount NUMERIC(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    profit NUMERIC(15,2) DEFAULT 0, -- Track profit per transaction
    
    payment_method TEXT,
    created_by UUID REFERENCES public.profiles(id),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legacy 'sales_transactions' view for compatibility
CREATE OR REPLACE VIEW public.sales_transactions AS SELECT * FROM public.transactions WHERE type = 'sale';

CREATE TABLE public.transaction_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id),
    description TEXT,
    quantity NUMERIC(10,2) DEFAULT 1,
    unit_price NUMERIC(15,2) NOT NULL,
    total_price NUMERIC(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- N. COMMISSIONS
CREATE TABLE public.commissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    sale_id UUID REFERENCES public.transactions(id), -- Linked to Sale Transaction
    
    amount NUMERIC(15,2) DEFAULT 0,
    rate NUMERIC(5,2), -- Snapshot of rate at time of sale
    type TEXT, -- percentage/fixed
    
    status TEXT DEFAULT 'pending', -- pending, paid
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- O. AUDIT LOGS
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID,
    user_id UUID,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. SECURITY (RLS POLICIES)
-- =============================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Helper: Check if User is Global Admin
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: Get List of Business IDs user belongs to
CREATE OR REPLACE FUNCTION get_my_business_ids() RETURNS TABLE(id UUID) AS $$
  SELECT business_id FROM public.business_users WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Standard Policy Generator
CREATE POLICY "Access Policy" ON public.businesses FOR ALL 
USING (id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());

-- Apply to all business-linked tables
CREATE POLICY "Access Policy" ON public.contacts FOR ALL USING (business_id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());
CREATE POLICY "Access Policy" ON public.items FOR ALL USING (business_id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());
CREATE POLICY "Access Policy" ON public.transactions FOR ALL USING (business_id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());
CREATE POLICY "Access Policy" ON public.projects FOR ALL USING (business_id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());
CREATE POLICY "Access Policy" ON public.time_entries FOR ALL USING (business_id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());
CREATE POLICY "Access Policy" ON public.appointments FOR ALL USING (business_id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());
CREATE POLICY "Access Policy" ON public.commissions FOR ALL USING (business_id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());
CREATE POLICY "Access Policy" ON public.invites FOR ALL USING (business_id IN (SELECT id FROM get_my_business_ids()) OR is_super_admin());

-- =============================================================================
-- 7. DATA SEEDING (Link Your 4 Specific Users)
-- =============================================================================
DO $$
DECLARE
    retail_biz_id UUID;
    admin_uid UUID;
    owner_uid UUID;
    manager_uid UUID;
    seller_uid UUID;
BEGIN
    -- 1. Create System & Retail Business
    INSERT INTO public.system_settings (platform_name) VALUES ('Bangali Enterprise');
    
    INSERT INTO public.businesses (name, industry) VALUES ('Abul Khayer Consumers', 'retail') 
    RETURNING id INTO retail_biz_id;

    -- 2. Fetch User IDs (Must exist in Authentication)
    SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@bangalienterprise.com';
    SELECT id INTO owner_uid FROM auth.users WHERE email = 'enterprisebangali@gmail.com';
    SELECT id INTO manager_uid FROM auth.users WHERE email = 'arifhossenrakib001@gmail.com';
    SELECT id INTO seller_uid FROM auth.users WHERE email = 'mrak@virgilian.com';

    -- 3. Link Super Admin
    IF admin_uid IS NOT NULL THEN
        INSERT INTO public.profiles (id, full_name, email, is_super_admin, business_id, role) 
        VALUES (admin_uid, 'System Admin', 'admin@bangalienterprise.com', TRUE, retail_biz_id, 'owner')
        ON CONFLICT (id) DO UPDATE SET is_super_admin = TRUE, business_id = retail_biz_id;
    END IF;

    -- 4. Link Retail Team (Sets default business_id context for them)
    IF owner_uid IS NOT NULL THEN
        INSERT INTO public.profiles (id, full_name, email, business_id, role) VALUES (owner_uid, 'Arif Hossen', 'enterprisebangali@gmail.com', retail_biz_id, 'owner') 
        ON CONFLICT (id) DO UPDATE SET business_id = retail_biz_id, role = 'owner';
        INSERT INTO public.business_users (business_id, user_id, role) VALUES (retail_biz_id, owner_uid, 'owner') ON CONFLICT DO NOTHING;
    END IF;

    IF manager_uid IS NOT NULL THEN
        INSERT INTO public.profiles (id, full_name, email, business_id, role) VALUES (manager_uid, 'Manager', 'arifhossenrakib001@gmail.com', retail_biz_id, 'manager') 
        ON CONFLICT (id) DO UPDATE SET business_id = retail_biz_id, role = 'manager';
        INSERT INTO public.business_users (business_id, user_id, role) VALUES (retail_biz_id, manager_uid, 'manager') ON CONFLICT DO NOTHING;
    END IF;

    IF seller_uid IS NOT NULL THEN
        INSERT INTO public.profiles (id, full_name, email, business_id, role) VALUES (seller_uid, 'Seller', 'mrak@virgilian.com', retail_biz_id, 'seller') 
        ON CONFLICT (id) DO UPDATE SET business_id = retail_biz_id, role = 'seller';
        INSERT INTO public.business_users (business_id, user_id, role) VALUES (retail_biz_id, seller_uid, 'seller') ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Complete System Setup: Admin & Retail Team Linked with full Service Schema.';
END $$;
