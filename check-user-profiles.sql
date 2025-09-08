-- Check user_profiles table specifically
-- Run this in your Supabase SQL Editor

-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Count total records
SELECT 
    'total_records' as info,
    COUNT(*) as count
FROM user_profiles;

-- 3. Show sample data (if any exists)
SELECT 
    'sample_data' as info,
    id,
    email,
    business_name,
    tier,
    email_verified,
    created_at
FROM user_profiles 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check email_verified column specifically
SELECT 
    'email_verified_analysis' as info,
    email_verified,
    COUNT(*) as count,
    pg_typeof(email_verified) as data_type
FROM user_profiles 
GROUP BY email_verified, pg_typeof(email_verified);
