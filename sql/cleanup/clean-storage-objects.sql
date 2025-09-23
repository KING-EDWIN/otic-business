-- =====================================================
-- CLEAN STORAGE OBJECTS (USE WITH CAUTION)
-- =====================================================
-- This script removes existing objects from the product-images bucket
-- WARNING: This will delete all existing images in the bucket!

-- 1. Check what objects exist
SELECT 
  'Existing Objects:' as info,
  name,
  bucket_id,
  created_at,
  size
FROM storage.objects 
WHERE bucket_id = 'product-images'
ORDER BY created_at DESC;

-- 2. Count total objects
SELECT 
  'Total Objects Count:' as info,
  COUNT(*) as object_count,
  SUM(size) as total_size_bytes,
  ROUND(SUM(size) / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects 
WHERE bucket_id = 'product-images';

-- 3. Remove all objects from product-images bucket
-- WARNING: This will delete all images!
DELETE FROM storage.objects 
WHERE bucket_id = 'product-images';

-- 4. Verify objects are removed
SELECT 
  'Objects After Cleanup:' as info,
  COUNT(*) as remaining_objects
FROM storage.objects 
WHERE bucket_id = 'product-images';

-- 5. Now we can safely delete and recreate the bucket
DELETE FROM storage.buckets WHERE name = 'product-images';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- 6. Create storage policies
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

-- 7. Grant permissions
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- 8. Verify final state
SELECT 
  'Final Bucket State:' as info,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'product-images';

SELECT 
  'Final Objects Count:' as info,
  COUNT(*) as object_count
FROM storage.objects 
WHERE bucket_id = 'product-images';

-- Success message
SELECT 'Storage objects cleaned and bucket recreated successfully!' as status;
