-- Check the existing individual-related tables to see what's causing the individual_id error

-- 1. Check individual_business_access table structure
SELECT 
    'individual_business_access table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'individual_business_access'
ORDER BY ordinal_position;

-- 2. Check individual_professions table structure
SELECT 
    'individual_professions table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'individual_professions'
ORDER BY ordinal_position;

-- 3. Check individual_signups table structure
SELECT 
    'individual_signups table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'individual_signups'
ORDER BY ordinal_position;

-- 4. Check for foreign key constraints on these tables
SELECT 
    'Foreign Key Constraints on individual tables' as info,
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
    AND tc.table_name IN ('individual_business_access', 'individual_professions', 'individual_signups')
ORDER BY tc.table_name;

-- 5. Check for any data in these tables
SELECT 
    'individual_business_access data count' as info,
    COUNT(*) as record_count
FROM public.individual_business_access;

SELECT 
    'individual_professions data count' as info,
    COUNT(*) as record_count
FROM public.individual_professions;

SELECT 
    'individual_signups data count' as info,
    COUNT(*) as record_count
FROM public.individual_signups;

-- 6. Check for any triggers on these tables
SELECT 
    'Triggers on individual tables' as info,
    trigger_schema,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('individual_business_access', 'individual_professions', 'individual_signups')
ORDER BY event_object_table, trigger_name;
