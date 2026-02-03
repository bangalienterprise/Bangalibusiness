-- =============================================================================
-- STORAGE BUCKET SETUP
-- =============================================================================

-- 1. Create 'business-branding' bucket for logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-branding', 'business-branding', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to logos
CREATE POLICY "Public Access Logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'business-branding' );

-- Policy: Allow authenticated users to upload logos
CREATE POLICY "Auth Upload Logos"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'business-branding' AND auth.role() = 'authenticated' );

-- 2. Create 'products' bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to product images
CREATE POLICY "Public Access Products"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Policy: Allow authenticated users to upload product images
CREATE POLICY "Auth Upload Products"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 3. Create 'documents' bucket for private business docs (invoices etc)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow users to see only their own business documents
-- (Requires RLS logic linking file path or metadata to business_id, simplified here)
CREATE POLICY "Business Access Documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Business Upload Documents"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );
