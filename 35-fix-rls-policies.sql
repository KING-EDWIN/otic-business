-- Fix RLS Policies and Access Control Issues
-- Run this in your Supabase SQL Editor

-- First, let's check and fix the user_profiles table RLS policies
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_all" ON user_profiles;

-- Create comprehensive RLS policies for user_profiles
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "user_profiles_delete_own" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Allow public access to basic profile info for business invitations
CREATE POLICY "user_profiles_public_select" ON user_profiles
  FOR SELECT USING (true);

-- Fix business_memberships RLS policies
DROP POLICY IF EXISTS "Users can view all memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can insert memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can update memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can delete memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can create memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "business_memberships_all" ON business_memberships;

-- Create comprehensive RLS policies for business_memberships
CREATE POLICY "business_memberships_select_own" ON business_memberships
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM business_memberships bm2 
      WHERE bm2.business_id = business_memberships.business_id 
      AND bm2.user_id = auth.uid()
    )
  );

CREATE POLICY "business_memberships_insert_own" ON business_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "business_memberships_update_own" ON business_memberships
  FOR UPDATE USING (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM business_memberships bm2 
      WHERE bm2.business_id = business_memberships.business_id 
      AND bm2.user_id = auth.uid() 
      AND bm2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "business_memberships_delete_own" ON business_memberships
  FOR DELETE USING (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM business_memberships bm2 
      WHERE bm2.business_id = business_memberships.business_id 
      AND bm2.user_id = auth.uid() 
      AND bm2.role IN ('owner', 'admin')
    )
  );

-- Fix businesses table RLS policies
DROP POLICY IF EXISTS "Users can view all businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update businesses" ON businesses;
DROP POLICY IF EXISTS "Users can delete businesses" ON businesses;
DROP POLICY IF EXISTS "Users can create businesses" ON businesses;
DROP POLICY IF EXISTS "businesses_all" ON businesses;

-- Create comprehensive RLS policies for businesses
CREATE POLICY "businesses_select_own" ON businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_memberships bm 
      WHERE bm.business_id = businesses.id 
      AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "businesses_insert_own" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "businesses_update_own" ON businesses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_memberships bm 
      WHERE bm.business_id = businesses.id 
      AND bm.user_id = auth.uid() 
      AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "businesses_delete_own" ON businesses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_memberships bm 
      WHERE bm.business_id = businesses.id 
      AND bm.user_id = auth.uid() 
      AND bm.role = 'owner'
    )
  );

-- Ensure RLS is enabled on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Test the policies
SELECT 'RLS Policies updated successfully' as status;