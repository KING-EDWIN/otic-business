-- Simple Database Check
-- Run this in your Supabase SQL Editor

-- 1. Check if user_profiles table exists
SELECT 
    'table_exists' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- 2. If table exists, show its structure
SELECT 
    'table_structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. If table exists, show sample data
SELECT 
    'sample_data' as check_type,
    id,
    email,
    business_name,
    tier,
    email_verified,
    created_at
FROM user_profiles 
LIMIT 3;

-- 4. Check all tables in the database
SELECT 
    'all_tables' as check_type,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
