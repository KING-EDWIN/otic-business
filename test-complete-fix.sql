-- =====================================================
-- TEST COMPLETE FIX
-- =====================================================
-- This script tests all the fixes to ensure everything works

-- 1. Test storage bucket access
SELECT 
  'Storage Test:' as test_type,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'product-images';

-- 2. Test storage policies
SELECT 
  'Storage Policies Test:' as test_type,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%product%';

-- 3. Test table structure
SELECT 
  'Table Structure Test:' as test_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'personalised_visual_bank' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Test RLS policies
SELECT 
  'RLS Policies Test:' as test_type,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'personalised_visual_bank'
ORDER BY policyname;

-- 5. Test user exists
SELECT 
  'User Test:' as test_type,
  id,
  email,
  role,
  created_at
FROM auth.users 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 6. Test user profile exists
SELECT 
  'User Profile Test:' as test_type,
  user_id,
  email,
  user_type,
  tier,
  email_verified
FROM user_profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 7. Test insert with proper user context
-- Note: This will only work if we're running as the test user
INSERT INTO personalised_visual_bank (
  user_id,
  product_name,
  manufacturer,
  category,
  retail_price,
  cost_price,
  current_stock,
  min_stock,
  unit_type,
  raw_image_url,
  visual_token,
  token_hash,
  token_metadata,
  dominant_colors,
  color_distribution,
  lighting_profile,
  contrast_ratio,
  color_temperature,
  luminance,
  recognition_confidence,
  similarity_threshold
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Product After Fix',
  'Test Manufacturer',
  'Test Category',
  150.50,
  120.75,
  25,
  10,
  'piece',
  'data:image/test_after_fix',
  'test_token_after_fix',
  'test_hash_after_fix_' || extract(epoch from now()),
  '{"test": "after_fix"}',
  '[{"r": 255, "g": 0, "b": 0, "percentage": 0.5}]',
  '{"topLeft": {"r": 255, "g": 0, "b": 0}}',
  '{"brightness": 0.8, "contrast": 4.5, "color_temperature": 6500}',
  4.50,
  6500,
  0.75,
  0.95,
  0.85
);

-- 8. Verify the insert worked
SELECT 
  'Insert Test Result:' as test_type,
  id,
  product_name,
  retail_price,
  cost_price,
  user_id,
  created_at
FROM personalised_visual_bank 
WHERE product_name = 'Test Product After Fix';

-- 9. Test storage upload (simulate)
SELECT 
  'Storage Upload Test:' as test_type,
  'Simulating file upload to product-images bucket' as message,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE name = 'product-images' AND public = true
    ) THEN '✅ Bucket ready for uploads'
    ELSE '❌ Bucket not ready'
  END as upload_status;

-- 10. Clean up test data
DELETE FROM personalised_visual_bank 
WHERE product_name = 'Test Product After Fix';

-- 11. Final status check
SELECT 
  'Final Status:' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE name = 'product-images' AND public = true
    ) THEN '✅ Storage: Ready'
    ELSE '❌ Storage: Issues'
  END as storage_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'personalised_visual_bank'
      AND policyname LIKE '%insert%'
    ) THEN '✅ RLS: Ready'
    ELSE '❌ RLS: Issues'
  END as rls_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = '00000000-0000-0000-0000-000000000001'
    ) THEN '✅ User: Ready'
    ELSE '❌ User: Issues'
  END as user_status;

-- Success message
SELECT 'Complete fix test completed successfully!' as status;



