-- Find all references to individual_id that might be causing the error
-- This will help identify exactly where the column reference is coming from

-- 1. Check all columns in all tables for individual_id
SELECT 
    'Columns named individual_id' as search_type,
    table_schema,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'individual_id'
ORDER BY table_schema, table_name;

-- 2. Check for any foreign key constraints that reference individual_id
SELECT 
    'Foreign Key Constraints with individual_id' as search_type,
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
    AND kcu.column_name = 'individual_id'
ORDER BY tc.table_schema, tc.table_name;

-- 3. Check for any indexes that might reference individual_id
SELECT 
    'Indexes with individual_id' as search_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE indexdef LIKE '%individual_id%'
ORDER BY schemaname, tablename;

-- 4. Check for any triggers that might reference individual_id
SELECT 
    'Triggers that might reference individual_id' as search_type,
    trigger_schema,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%individual_id%'
ORDER BY trigger_schema, trigger_name;

-- 5. Check for any views that might reference individual_id
SELECT 
    'Views with individual_id' as search_type,
    table_schema,
    table_name,
    view_definition
FROM information_schema.views 
WHERE view_definition LIKE '%individual_id%'
ORDER BY table_schema, table_name;

-- 6. Check for any functions that might reference individual_id
SELECT 
    'Functions with individual_id' as search_type,
    routine_schema,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%individual_id%'
ORDER BY routine_schema, routine_name;

-- 7. Check the auth schema specifically (this might show the issue)
SELECT 
    'Auth schema tables' as search_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- 8. Check if there are any existing tables that might have been created before
SELECT 
    'All tables in public schema' as search_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 9. Check for any existing individual-related tables
SELECT 
    'Individual-related tables' as search_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%individual%' OR table_name LIKE '%professional%')
ORDER BY table_name;
