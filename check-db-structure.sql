-- Check current database structure
-- Run this in your Supabase SQL Editor to see what tables exist

-- 1. List all tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check if features table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'features' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if tiers table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tiers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if businesses table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check if business_invitations table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'business_invitations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check existing data in features table
SELECT COUNT(*) as feature_count FROM features;

-- 7. Check existing data in tiers table
SELECT COUNT(*) as tier_count FROM tiers;

-- 8. Check if there are any syntax errors by trying to describe the tables
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN ('features', 'tiers', 'businesses', 'business_invitations', 'business_memberships')
ORDER BY table_name, ordinal_position;
