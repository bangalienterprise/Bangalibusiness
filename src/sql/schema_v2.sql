-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('global_admin', 'owner', 'manager', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE biz_type_slug AS ENUM ('retail', 'restaurant', 'service', 'agency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. GLOBAL PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    system_role user_role DEFAULT 'staff', -- 'global_admin' allows access to /admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUSINESS CORE
CREATE TABLE IF NOT EXISTS business_types (
    slug biz_type_slug PRIMARY KEY, -- 'retail', 'restaurant', etc.
    name TEXT NOT NULL,
    modules JSONB -- e.g. ["pos", "inventory"] vs ["tables", "kitchen"]
);

CREATE TABLE IF NOT EXISTS businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type_slug biz_type_slug REFERENCES business_types(slug),
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}' -- Store currency, tax_rate, timezone here
);

CREATE TABLE IF NOT EXISTS organization_members (
    business_id UUID REFERENCES businesses(id),
    user_id UUID REFERENCES profiles(id),
    role user_role DEFAULT 'staff',
    PRIMARY KEY (business_id, user_id)
);

-- 4. UNIVERSAL INVENTORY (Works for Menu Items, Retail Goods, & Services)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    name TEXT NOT NULL,
    sku TEXT, -- Optional for restaurants
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0, -- NULL for services
    is_service BOOLEAN DEFAULT FALSE, -- True for Agency/Consulting
    category TEXT, -- "Appetizer", "Electronics", "Consultation"
    image_url TEXT
);

-- 5. RESTAURANT SPECIFIC
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    table_number TEXT NOT NULL,
    seats INTEGER,
    status TEXT DEFAULT 'available' -- 'occupied', 'reserved', 'cleaning'
);

-- 6. SERVICE/AGENCY SPECIFIC
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    client_name TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled'
);

-- 7. UNIVERSAL TRANSACTIONS
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    table_id UUID REFERENCES restaurant_tables(id), -- Nullable (Restaurant only)
    total_amount DECIMAL(10,2),
    status TEXT DEFAULT 'completed', -- 'pending' (Kitchen), 'served', 'paid'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- 8. SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies (simplified placeholders, meant to be expanded)
-- Policy: Users can only see data where `business_id` matches their `organization_members` entry.
-- Policy: `global_admin` can see EVERYTHING.
