-- Check what tables already exist and what columns they have
-- This will help identify any conflicts

-- Check all tables in public schema
SELECT 
    'All Tables in Public Schema' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check for any columns named individual_id
SELECT 
    'Columns with individual_id' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name LIKE '%individual%'
ORDER BY table_name, column_name;

-- Check for any foreign key constraints that might reference individual_profiles
SELECT 
    'Foreign Key Constraints' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
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
    AND (ccu.table_name LIKE '%individual%' OR ccu.table_name = 'individual_profiles')
ORDER BY tc.table_name;

-- Check if individual_profiles table exists and its structure
SELECT 
    'individual_profiles table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'individual_profiles'
ORDER BY ordinal_position;

-- Check for any existing policies on individual_profiles
SELECT 
    'RLS Policies on individual_profiles' as info,
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
  AND rel.relname = 'individual_profiles'
ORDER BY pol.polname;

