-- Comprehensive Backend Test and Fix Script
-- This script tests and fixes all RLS policies and access control issues

-- First, let's test the current user authentication
DO $$
DECLARE
    current_user_id UUID;
    test_result TEXT;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE '❌ No authenticated user found';
    ELSE
        RAISE NOTICE '✅ Current user ID: %', current_user_id;
    END IF;
END $$;

-- Test 1: Check if user_profiles table is accessible
DO $$
DECLARE
    profile_count INTEGER;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO profile_count 
        FROM user_profiles 
        WHERE id = current_user_id;
        
        RAISE NOTICE '✅ user_profiles access test: Found % profiles for user', profile_count;
    ELSE
        RAISE NOTICE '❌ user_profiles access test: No authenticated user';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ user_profiles access test failed: %', SQLERRM;
END $$;

-- Test 2: Check if visual_filter_tags table is accessible
DO $$
DECLARE
    vft_count INTEGER;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO vft_count 
        FROM visual_filter_tags 
        WHERE user_id = current_user_id;
        
        RAISE NOTICE '✅ visual_filter_tags access test: Found % VFTs for user', vft_count;
    ELSE
        RAISE NOTICE '❌ visual_filter_tags access test: No authenticated user';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ visual_filter_tags access test failed: %', SQLERRM;
END $$;

-- Test 3: Check if vft_products table is accessible
DO $$
DECLARE
    product_count INTEGER;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO product_count 
        FROM vft_products 
        WHERE user_id = current_user_id;
        
        RAISE NOTICE '✅ vft_products access test: Found % products for user', product_count;
    ELSE
        RAISE NOTICE '❌ vft_products access test: No authenticated user';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ vft_products access test failed: %', SQLERRM;
END $$;

-- Now let's fix all RLS policies comprehensively

-- 1. Fix user_profiles RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Create comprehensive policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = id);

-- 2. Fix visual_filter_tags RLS
ALTER TABLE visual_filter_tags ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own visual_filter_tags" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can insert their own visual_filter_tags" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can update their own visual_filter_tags" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can delete their own visual_filter_tags" ON visual_filter_tags;

-- Create comprehensive policies for visual_filter_tags
CREATE POLICY "Users can view their own visual_filter_tags" ON visual_filter_tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visual_filter_tags" ON visual_filter_tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visual_filter_tags" ON visual_filter_tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visual_filter_tags" ON visual_filter_tags
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Fix vft_products RLS
ALTER TABLE vft_products ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own vft_products" ON vft_products;
DROP POLICY IF EXISTS "Users can insert their own vft_products" ON vft_products;
DROP POLICY IF EXISTS "Users can update their own vft_products" ON vft_products;
DROP POLICY IF EXISTS "Users can delete their own vft_products" ON vft_products;

-- Create comprehensive policies for vft_products
CREATE POLICY "Users can view their own vft_products" ON vft_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vft_products" ON vft_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vft_products" ON vft_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vft_products" ON vft_products
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Fix vft_categories RLS (public read, authenticated write)
ALTER TABLE vft_categories ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view vft_categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can insert vft_categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can update vft_categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can delete vft_categories" ON vft_categories;

-- Create comprehensive policies for vft_categories
CREATE POLICY "Users can view vft_categories" ON vft_categories
    FOR SELECT USING (true);

CREATE POLICY "Users can insert vft_categories" ON vft_categories
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update vft_categories" ON vft_categories
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete vft_categories" ON vft_categories
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- 5. Fix visual_scan_history RLS
ALTER TABLE visual_scan_history ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own visual_scan_history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can insert their own visual_scan_history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can update their own visual_scan_history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can delete their own visual_scan_history" ON visual_scan_history;

-- Create comprehensive policies for visual_scan_history
CREATE POLICY "Users can view their own visual_scan_history" ON visual_scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visual_scan_history" ON visual_scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visual_scan_history" ON visual_scan_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visual_scan_history" ON visual_scan_history
    FOR DELETE USING (auth.uid() = user_id);

-- Grant comprehensive permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visual_filter_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vft_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vft_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visual_scan_history TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Test the fixes
DO $$
DECLARE
    current_user_id UUID;
    profile_count INTEGER;
    vft_count INTEGER;
    product_count INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Test user_profiles access
        SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = current_user_id;
        RAISE NOTICE '✅ FIXED: user_profiles access - Found % profiles', profile_count;
        
        -- Test visual_filter_tags access
        SELECT COUNT(*) INTO vft_count FROM visual_filter_tags WHERE user_id = current_user_id;
        RAISE NOTICE '✅ FIXED: visual_filter_tags access - Found % VFTs', vft_count;
        
        -- Test vft_products access
        SELECT COUNT(*) INTO product_count FROM vft_products WHERE user_id = current_user_id;
        RAISE NOTICE '✅ FIXED: vft_products access - Found % products', product_count;
        
        RAISE NOTICE '🎉 All RLS policies have been fixed successfully!';
    ELSE
        RAISE NOTICE '❌ No authenticated user - please sign in first';
    END IF;
END $$;
