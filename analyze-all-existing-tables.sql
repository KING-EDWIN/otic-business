-- Comprehensive analysis of all existing tables in your database
-- Let's see what we're working with instead of fighting against it

-- 1. Show ALL tables in the public schema
SELECT 
    'All Tables in Public Schema' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Show ALL tables in the auth schema (if accessible)
SELECT 
    'All Tables in Auth Schema' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth' 
ORDER BY table_name;

-- 3. Show the structure of ALL individual-related tables
SELECT 
    'individual_profiles structure' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'individual_profiles'
ORDER BY ordinal_position;

SELECT 
    'individual_professions structure' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'individual_professions'
ORDER BY ordinal_position;

SELECT 
    'individual_business_access structure' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'individual_business_access'
ORDER BY ordinal_position;

SELECT 
    'individual_signups structure' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'individual_signups'
ORDER BY ordinal_position;

SELECT 
    'business_signups structure' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'business_signups'
ORDER BY ordinal_position;

-- 4. Show the structure of user_profiles table
SELECT 
    'user_profiles structure' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. Show ALL foreign key constraints in the database
SELECT 
    'All Foreign Key Constraints' as info,
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 6. Show data counts for all tables
SELECT 
    'individual_profiles count' as table_name,
    COUNT(*) as record_count
FROM public.individual_profiles
UNION ALL
SELECT 
    'individual_professions count' as table_name,
    COUNT(*) as record_count
FROM public.individual_professions
UNION ALL
SELECT 
    'individual_business_access count' as table_name,
    COUNT(*) as record_count
FROM public.individual_business_access
UNION ALL
SELECT 
    'individual_signups count' as table_name,
    COUNT(*) as record_count
FROM public.individual_signups
UNION ALL
SELECT 
    'business_signups count' as table_name,
    COUNT(*) as record_count
FROM public.business_signups
UNION ALL
SELECT 
    'user_profiles count' as table_name,
    COUNT(*) as record_count
FROM public.user_profiles;

-- 7. Show any existing RLS policies
SELECT 
    'Existing RLS Policies' as info,
    nsp.nspname AS schema_name,
    rel.relname AS table_name,
    pol.polname AS policy_name,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command
FROM pg_policy pol
JOIN pg_class rel ON rel.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
ORDER BY table_name, policy_name;

-- 8. Show any existing indexes
SELECT 
    'Existing Indexes' as info,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND (tablename LIKE '%individual%' OR tablename LIKE '%business%' OR tablename LIKE '%user%')
ORDER BY tablename, indexname;
