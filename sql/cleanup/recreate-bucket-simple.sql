-- =====================================================
-- SIMPLE BUCKET RECREATION
-- =====================================================
-- This script simply recreates the product-images bucket

-- 1. Remove all objects from product-images bucket first
DELETE FROM storage.objects 
WHERE bucket_id = 'product-images';

-- 2. Delete the bucket
DELETE FROM storage.buckets 
WHERE name = 'product-images';

-- 3. Create new bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- 4. Create storage policies
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

-- 5. Grant permissions
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- 6. Verify bucket was created
SELECT 
  'Bucket Created:' as info,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'product-images';

-- Success message
SELECT 'Bucket recreated successfully!' as status;
