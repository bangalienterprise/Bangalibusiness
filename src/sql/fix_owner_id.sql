-- Fix for missing owner_id column in businesses table

-- 1. Add owner_id column to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. Add subscription_status column if missing (also referenced in AuthService)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';

-- 3. Update existing RLS policies or create new ones if needed (optional but good practice)
-- Ensure owners can see their own businesses
CREATE POLICY "Users can view their own business" 
ON businesses FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own business" 
ON businesses FOR UPDATE 
USING (auth.uid() = owner_id);
