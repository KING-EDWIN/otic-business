-- Check Supabase Setup and Fix Missing Tables
-- Run this in your Supabase SQL Editor to diagnose issues

-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'products', 'sales', 'sale_items', 'subscriptions', 'payment_requests')
ORDER BY tablename;

-- Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if auth.uid() function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'auth' 
AND routine_name = 'uid';

-- Check user_profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any users in the system
SELECT COUNT(*) as user_count FROM auth.users;

-- Check if there are any user_profiles
SELECT COUNT(*) as profile_count FROM user_profiles;

-- Test auth.uid() function
SELECT auth.uid() as current_user_id;

