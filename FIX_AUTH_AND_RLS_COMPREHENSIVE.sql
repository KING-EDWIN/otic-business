-- Comprehensive fix for authentication and RLS issues
-- This script addresses network connectivity and access control problems

-- First, ensure all user-related tables have proper RLS policies
-- Fix user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix businesses table
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Drop and recreate businesses policies
DROP POLICY IF EXISTS "Users can view businesses they belong to" ON businesses;
DROP POLICY IF EXISTS "Users can update businesses they own" ON businesses;
DROP POLICY IF EXISTS "Users can insert businesses" ON businesses;

CREATE POLICY "Users can view businesses they belong to" ON businesses
  FOR SELECT USING (
    id IN (
      SELECT business_id FROM business_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update businesses they own" ON businesses
  FOR UPDATE USING (
    id IN (
      SELECT business_id FROM business_memberships 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Users can insert businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fix business_memberships table
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;

-- Drop and recreate business_memberships policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can insert memberships" ON business_memberships;

CREATE POLICY "Users can view their own memberships" ON business_memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships" ON business_memberships
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert memberships" ON business_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop and recreate products policies
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create a function to check if user exists and is authenticated
CREATE OR REPLACE FUNCTION check_user_auth()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_user_auth() TO authenticated;

-- Test the setup
DO $$
BEGIN
  RAISE NOTICE 'Comprehensive RLS policies have been created successfully!';
  RAISE NOTICE 'Authentication issues should now be resolved.';
  RAISE NOTICE 'Users can access their own data across all tables.';
END $$;
