-- =====================================================
-- VERIFY OTIC VISION SETUP
-- =====================================================
-- Run this after fixing tables and functions to verify everything works

-- 1. Check all tables exist with correct columns
SELECT 
  'Tables Check' as test_type,
  table_name,
  column_count,
  string_agg(column_name, ', ') as columns
FROM (
  SELECT 
    table_name,
    COUNT(*) as column_count,
    string_agg(column_name, ', ') as column_name
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'personalised_visual_bank',
    'token_similarity_log', 
    'color_analysis_cache',
    'recognition_sessions'
  )
  GROUP BY table_name
) t
GROUP BY table_name, column_count
ORDER BY table_name;

-- 2. Check RLS policies
SELECT 
  'RLS Policies Check' as test_type,
  tablename,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ') as policies
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'personalised_visual_bank',
  'token_similarity_log', 
  'color_analysis_cache',
  'recognition_sessions'
)
GROUP BY tablename
ORDER BY tablename;

-- 3. Check RPC functions
SELECT 
  'Functions Check' as test_type,
  COUNT(*) as function_count,
  string_agg(routine_name, ', ') as functions
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'find_best_token_match',
  'log_token_similarity',
  'get_product_by_visual_token',
  'register_visual_product'
);

-- 4. Test register_visual_product function
SELECT 'Testing register_visual_product...' as test_step;

SELECT register_visual_product(
  '00000000-0000-0000-0000-000000000001',
  'Test Product',
  'Test Manufacturer',
  'Test Category',
  100.00,
  80.00,
  'data:image/test',
  'test_token',
  'test_hash_' || extract(epoch from now()),
  '{"test": "metadata"}',
  '[{"r": 255, "g": 0, "b": 0, "percentage": 0.5}]',
  '{"topLeft": {"r": 255, "g": 0, "b": 0}}',
  '{"brightness": 0.8}',
  4.5,
  6500,
  0.75
) as test_product_id;

-- 5. Test log_token_similarity function
SELECT 'Testing log_token_similarity...' as test_step;

SELECT log_token_similarity(
  (SELECT id FROM personalised_visual_bank WHERE product_name = 'Test Product' LIMIT 1),
  '00000000-0000-0000-0000-000000000001',
  '{"test": "data"}',
  0.85,
  true
) as test_log_id;

-- 6. Test find_best_token_match function
SELECT 'Testing find_best_token_match...' as test_step;

SELECT 
  id,
  product_name,
  manufacturer,
  category,
  retail_price,
  cost_price,
  similarity_score,
  confidence_level
FROM find_best_token_match(
  '{"tokenHash": "test123", "histogram": [0.1, 0.2, 0.3], "dominantColors": [], "spatialDistribution": {}}',
  NULL,
  0.5
)
LIMIT 5;

-- 7. Test get_product_by_visual_token function
SELECT 'Testing get_product_by_visual_token...' as test_step;

SELECT 
  id,
  product_name,
  manufacturer,
  category,
  retail_price,
  cost_price,
  raw_image_url,
  token_metadata
FROM get_product_by_visual_token(
  (SELECT token_hash FROM personalised_visual_bank WHERE product_name = 'Test Product' LIMIT 1),
  NULL
);

-- 8. Clean up test data
SELECT 'Cleaning up test data...' as test_step;

DELETE FROM token_similarity_log 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

DELETE FROM personalised_visual_bank 
WHERE product_name = 'Test Product' 
AND manufacturer = 'Test Manufacturer';

-- 9. Check storage bucket
SELECT 
  'Storage Check' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE name = 'product-images'
    ) THEN 'product-images bucket exists'
    ELSE 'product-images bucket not found'
  END as bucket_status;

-- Final success message
SELECT 'OTIC Vision setup verification completed successfully!' as status;
