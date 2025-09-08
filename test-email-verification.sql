-- Test Email Verification Data
-- Run this in your Supabase SQL Editor to check the actual data

-- Check the structure of user_profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
AND column_name = 'email_verified';

-- Check actual data in user_profiles
SELECT 
    id,
    email,
    email_verified,
    tier,
    created_at
FROM user_profiles 
ORDER BY created_at DESC
LIMIT 5;

-- Check if there are any users with email_verified = false
SELECT 
    COUNT(*) as unverified_count
FROM user_profiles 
WHERE email_verified = false;

-- Check if there are any users with email_verified = true
SELECT 
    COUNT(*) as verified_count
FROM user_profiles 
WHERE email_verified = true;

-- Check if there are any users with email_verified = null
SELECT 
    COUNT(*) as null_count
FROM user_profiles 
WHERE email_verified IS NULL;
