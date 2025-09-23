-- Check Current Tables in Database
-- Let's see what tables we actually have and what we might be missing

-- Step 1: Get all tables in the database
SELECT 
  'CURRENT TABLES' as info,
  schemaname,
  tablename,
  tableowner,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Step 2: Check if we have the core tables we need
SELECT 
  'CORE TABLES CHECK' as info,
  'user_profiles' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
    THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
UNION ALL
SELECT 
  'CORE TABLES CHECK' as info,
  'businesses' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses')
    THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
UNION ALL
SELECT 
  'CORE TABLES CHECK' as info,
  'business_memberships' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_memberships')
    THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
UNION ALL
SELECT 
  'CORE TABLES CHECK' as info,
  'subscriptions' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions')
    THEN 'EXISTS'
    ELSE 'MISSING'
  END as status;

-- Step 3: Check what columns exist in user_profiles (our main table)
SELECT 
  'USER_PROFILES COLUMNS' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
