-- Database Check Script
-- Run this in your Supabase SQL Editor to check what tables exist

-- Check if user_profiles table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check if user_verification_status view exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('user_verification_status', 'user_profiles');

-- Check current users in user_profiles table
SELECT 
    id,
    email,
    business_name,
    tier,
    created_at
FROM user_profiles 
LIMIT 5;

-- Check if email_verified column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'email_verified';
