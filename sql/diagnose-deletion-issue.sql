-- Diagnostic script to understand why accounts aren't being deleted
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check if the delete_user_completely function exists and works
SELECT 
    'Function exists' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'delete_user_completely'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- 2. Test the function with a specific email (replace with an email you want to test)
-- SELECT delete_user_completely('damanifesta0@gmail.com');

-- 3. Check what's in the deleted_users table
SELECT 
    'deleted_users count' as check_type,
    COUNT(*) as result
FROM deleted_users;

-- 4. Check what's in user_profiles table
SELECT 
    'user_profiles count' as check_type,
    COUNT(*) as result
FROM user_profiles;

-- 5. Check what's in auth.users table
SELECT 
    'auth.users count' as check_type,
    COUNT(*) as result
FROM auth.users;

-- 6. Show some sample emails from each table
SELECT 
    'deleted_users emails' as table_name,
    email,
    deleted_at
FROM deleted_users 
ORDER BY deleted_at DESC 
LIMIT 5;

SELECT 
    'user_profiles emails' as table_name,
    email,
    created_at
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 
    'auth.users emails' as table_name,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check if there are any foreign key constraints preventing deletion
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'user_profiles' OR tc.table_name = 'auth.users')
ORDER BY tc.table_name, kcu.column_name;