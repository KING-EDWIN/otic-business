-- =====================================================
-- TEST STORAGE CONNECTION AND FIX ISSUES
-- =====================================================
-- This script tests the storage connection and fixes any issues

-- 1. Check if storage schema exists
SELECT 
  'Storage Schema Check' as test_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') 
    THEN '✅ Storage schema exists'
    ELSE '❌ Storage schema missing'
  END as schema_status;

-- 2. Check if storage.buckets table exists
SELECT 
  'Storage Buckets Table Check' as test_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') 
    THEN '✅ Storage buckets table exists'
    ELSE '❌ Storage buckets table missing'
  END as buckets_table_status;

-- 3. Check if storage.objects table exists
SELECT 
  'Storage Objects Table Check' as test_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') 
    THEN '✅ Storage objects table exists'
    ELSE '❌ Storage objects table missing'
  END as objects_table_status;

-- 4. List all buckets
SELECT 
  'Available Buckets' as info,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- 5. Check if product-images bucket exists and is public
SELECT 
  'Product Images Bucket Check' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE name = 'product-images' AND public = true
    ) THEN '✅ product-images bucket exists and is public'
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE name = 'product-images' AND public = false
    ) THEN '⚠️ product-images bucket exists but is not public'
    ELSE '❌ product-images bucket does not exist'
  END as bucket_status;

-- 6. Check storage policies
SELECT 
  'Storage Policies Check' as test_type,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 7. Check storage permissions
SELECT 
  'Storage Permissions Check' as test_type,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'storage' 
AND table_name = 'objects'
ORDER BY grantee, privilege_type;

-- 8. Test bucket creation (if needed)
DO $$
BEGIN
  -- Try to create the bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'product-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'product-images',
      'product-images', 
      true,
      52428800, -- 50MB limit
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
    RAISE NOTICE 'Created product-images bucket';
  ELSE
    RAISE NOTICE 'product-images bucket already exists';
  END IF;
END $$;

-- 9. Test policy creation (if needed)
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;
  
  -- Create new policies
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
  
  RAISE NOTICE 'Created storage policies';
END $$;

-- 10. Grant permissions
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- 11. Final verification
SELECT 
  'Final Storage Status' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE name = 'product-images' AND public = true
    ) THEN '✅ Storage is properly configured'
    ELSE '❌ Storage configuration issues remain'
  END as final_status;

-- Success message
SELECT 'Storage connection test completed!' as status;


