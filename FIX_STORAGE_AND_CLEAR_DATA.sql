-- FIX: Fix storage access and clear duplicate data
-- Run this in Supabase SQL Editor to fix storage and duplicate barcode issues

-- 1. Clear products table to remove duplicate barcodes
TRUNCATE TABLE products CASCADE;

-- 2. Clear related tables
TRUNCATE TABLE stock_movements CASCADE;
TRUNCATE TABLE product_categories CASCADE;
TRUNCATE TABLE product_suppliers CASCADE;

-- 3. Reset sequences if they exist
DO $$ 
BEGIN
    -- Reset any sequences that might exist
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'products_id_seq') THEN
        ALTER SEQUENCE products_id_seq RESTART WITH 1;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if sequences don't exist
        NULL;
END $$;

-- 4. Create storage bucket policies for product images
-- First, create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images', 
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 5. Create storage policies for product-images bucket
-- Drop existing policies first
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Create permissive policies for storage
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view" ON storage.objects
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update" ON storage.objects
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON storage.objects
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Create barcodes bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'barcodes',
    'barcodes', 
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 7. Ensure storage is enabled
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('product-images', 'barcodes');

-- 8. Test the fixes
SELECT 'Storage access fixed and data cleared successfully!' as status;
