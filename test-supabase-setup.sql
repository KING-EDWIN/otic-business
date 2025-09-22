-- =====================================================
-- SUPABASE SETUP VERIFICATION SCRIPT
-- =====================================================
-- Run this after the main setup to verify everything is working

-- 1. Check if all tables exist
SELECT 
  'Tables Check' as test_type,
  COUNT(*) as count,
  string_agg(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'personalised_visual_bank',
  'token_similarity_log', 
  'color_analysis_cache',
  'recognition_sessions'
);

-- 2. Check if all RPC functions exist
SELECT 
  'Functions Check' as test_type,
  COUNT(*) as count,
  string_agg(routine_name, ', ') as functions
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'find_best_token_match',
  'log_token_similarity',
  'get_product_by_visual_token',
  'register_visual_product'
);

-- 3. Check RLS policies
SELECT 
  'RLS Policies Check' as test_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'personalised_visual_bank',
  'token_similarity_log', 
  'color_analysis_cache',
  'recognition_sessions'
)
ORDER BY tablename, policyname;

-- 4. Check indexes
SELECT 
  'Indexes Check' as test_type,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
  'personalised_visual_bank',
  'token_similarity_log', 
  'color_analysis_cache',
  'recognition_sessions'
)
ORDER BY tablename, indexname;

-- 5. Test RPC function (should return empty result, not error)
SELECT 
  'RPC Test' as test_type,
  COUNT(*) as result_count
FROM find_best_token_match('{"tokenHash": "test"}', NULL, 0.5);

-- 6. Check storage bucket (if accessible)
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
SELECT 'Supabase setup verification completed!' as status;



