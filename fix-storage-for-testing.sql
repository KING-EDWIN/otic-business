-- =====================================================
-- FIX STORAGE FOR OTIC VISION TESTING ONLY
-- =====================================================
-- This script only fixes the storage bucket we need for testing

-- 1. Check if product-images bucket exists
SELECT 
  'Current Bucket Status:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE name = 'product-images'
    ) THEN 'Bucket exists'
    ELSE 'Bucket does not exist'
  END as bucket_status;

-- 2. Remove all objects from product-images bucket (if it exists)
DELETE FROM storage.objects 
WHERE bucket_id = 'product-images';

-- 3. Delete the bucket (if it exists)
DELETE FROM storage.buckets 
WHERE name = 'product-images';

-- 4. Create new product-images bucket for testing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- 5. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;

-- 6. Create storage policies for our test bucket
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 7. Grant storage permissions
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- 8. Verify our test bucket was created
SELECT 
  'Test Bucket Created:' as info,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'product-images';

-- Success message
SELECT 'Storage bucket for OTIC Vision testing fixed successfully!' as status;
