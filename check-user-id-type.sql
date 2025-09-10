-- Check the actual user ID type in existing tables
-- This will help us understand the correct type to use

-- 1. Check user_subscriptions table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check user_profiles table structure  
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check auth.users table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 4. Check what type auth.uid() actually returns
SELECT pg_typeof(auth.uid()) as auth_uid_type;

-- 5. Check a sample user ID from user_subscriptions
SELECT 
    user_id,
    pg_typeof(user_id) as user_id_type
FROM user_subscriptions 
LIMIT 1;

-- 6. Check if there are any existing foreign key constraints that work
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'users'
AND ccu.table_schema = 'auth'
LIMIT 5;
