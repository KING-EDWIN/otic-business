-- =====================================================
-- CHECK ACTUAL SCHEMA
-- =====================================================
-- This script checks what columns actually exist in your database

-- 1. Check user_profiles table structure
SELECT 
  'user_profiles columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check auth.users table structure
SELECT 
  'auth.users columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 3. Check existing storage policies
SELECT 
  'Existing storage policies:' as info,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 4. Check existing buckets
SELECT 
  'Existing buckets:' as info,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 5. Check if personalised_visual_bank table exists
SELECT 
  'personalised_visual_bank exists:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'personalised_visual_bank' 
      AND table_schema = 'public'
    ) THEN 'YES'
    ELSE 'NO'
  END as table_exists;

-- 6. If table exists, check its structure
SELECT 
  'personalised_visual_bank columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'personalised_visual_bank' 
AND table_schema = 'public'
ORDER BY ordinal_position;


