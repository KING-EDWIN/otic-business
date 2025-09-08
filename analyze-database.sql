-- Complete Database Analysis Script
-- Run this in your Supabase SQL Editor and paste the results

-- 1. Check if user_profiles table exists and its structure
SELECT 
    'user_profiles table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Check if email_verified column exists and its properties
SELECT 
    'email_verified column details' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'email_verified';

-- 3. Check all tables in the database
SELECT 
    'all tables' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. Check if user_verification_status view exists
SELECT 
    'views check' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('user_verification_status', 'unverified_users');

-- 5. Sample data from user_profiles (first 3 records)
SELECT 
    'sample user_profiles data' as info,
    id,
    email,
    business_name,
    tier,
    email_verified,
    created_at
FROM user_profiles 
ORDER BY created_at DESC
LIMIT 3;

-- 6. Count users by verification status
SELECT 
    'verification status counts' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_true,
    COUNT(CASE WHEN email_verified = false THEN 1 END) as verified_false,
    COUNT(CASE WHEN email_verified IS NULL THEN 1 END) as verified_null,
    COUNT(CASE WHEN email_verified = 'true' THEN 1 END) as verified_string_true,
    COUNT(CASE WHEN email_verified = 'false' THEN 1 END) as verified_string_false
FROM user_profiles;

-- 7. Check data types of email_verified values
SELECT 
    'email_verified data types' as info,
    email_verified,
    pg_typeof(email_verified) as data_type,
    COUNT(*) as count
FROM user_profiles 
GROUP BY email_verified, pg_typeof(email_verified);

-- 8. Check if there are any constraints on user_profiles
SELECT 
    'constraints on user_profiles' as info,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_profiles';

-- 9. Check indexes on user_profiles
SELECT 
    'indexes on user_profiles' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_profiles';

-- 10. Check if there are any triggers on user_profiles
SELECT 
    'triggers on user_profiles' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles';
