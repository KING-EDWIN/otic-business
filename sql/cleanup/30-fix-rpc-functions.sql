-- Fix RPC Functions for Business Management
-- Run this in your Supabase SQL Editor

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
DROP FUNCTION IF EXISTS get_individual_businesses(uuid);
DROP FUNCTION IF EXISTS get_business_members(uuid);
DROP FUNCTION IF EXISTS can_create_business(uuid);
DROP FUNCTION IF EXISTS test_user_data(uuid);

-- Create get_user_businesses function
CREATE OR REPLACE FUNCTION get_user_businesses(user_id_param UUID)
RETURNS TABLE (
  business_id UUID,
  business_name VARCHAR,
  role VARCHAR,
  status VARCHAR,
  joined_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = user_id_param) THEN
    RETURN;
  END IF;

  -- Return businesses where user is a member
  RETURN QUERY
  SELECT 
    bm.business_id,
    COALESCE(b.name, 'Unknown Business')::VARCHAR as business_name,
    COALESCE(bm.role, 'member')::VARCHAR as role,
    COALESCE(bm.status, 'active')::VARCHAR as status,
    COALESCE(bm.joined_at, bm.created_at) as joined_at
  FROM business_memberships bm
  LEFT JOIN businesses b ON b.id = bm.business_id
  WHERE bm.user_id = user_id_param
  ORDER BY bm.joined_at DESC
  LIMIT 50;
END;
$$;

-- Create get_individual_businesses function
CREATE OR REPLACE FUNCTION get_individual_businesses(user_id_param UUID)
RETURNS TABLE (
  business_id UUID,
  business_name VARCHAR,
  access_level VARCHAR,
  role VARCHAR,
  status VARCHAR,
  joined_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = user_id_param) THEN
    RETURN;
  END IF;

  -- Return businesses where user has access (simplified version)
  RETURN QUERY
  SELECT 
    bm.business_id,
    COALESCE(b.name, 'Unknown Business')::VARCHAR as business_name,
    'limited'::VARCHAR as access_level,
    COALESCE(bm.role, 'member')::VARCHAR as role,
    COALESCE(bm.status, 'active')::VARCHAR as status,
    COALESCE(bm.joined_at, bm.created_at) as joined_at
  FROM business_memberships bm
  LEFT JOIN businesses b ON b.id = bm.business_id
  WHERE bm.user_id = user_id_param
  ORDER BY bm.joined_at DESC
  LIMIT 50;
END;
$$;

-- Create get_business_members function
CREATE OR REPLACE FUNCTION get_business_members(business_id_param UUID)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  role VARCHAR,
  status VARCHAR,
  joined_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if business exists
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_id_param) THEN
    RETURN;
  END IF;

  -- Return members of the business
  RETURN QUERY
  SELECT 
    bm.user_id,
    COALESCE(up.email, 'No email')::VARCHAR as email,
    COALESCE(up.full_name, 'No name')::VARCHAR as full_name,
    COALESCE(bm.role, 'member')::VARCHAR as role,
    COALESCE(bm.status, 'active')::VARCHAR as status,
    COALESCE(bm.joined_at, bm.created_at) as joined_at
  FROM business_memberships bm
  LEFT JOIN user_profiles up ON up.id = bm.user_id
  WHERE bm.business_id = business_id_param
  ORDER BY bm.joined_at DESC
  LIMIT 100;
END;
$$;

-- Create can_create_business function
CREATE OR REPLACE FUNCTION can_create_business(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier VARCHAR;
  business_count INTEGER;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = user_id_param) THEN
    RETURN FALSE;
  END IF;

  -- Get user tier
  SELECT tier INTO user_tier FROM user_profiles WHERE user_profiles.id = user_id_param;
  
  -- Count existing businesses
  SELECT COUNT(*) INTO business_count 
  FROM business_memberships 
  WHERE user_id = user_id_param AND role = 'owner';

  -- Check tier limits
  IF user_tier = 'free_trial' AND business_count >= 1 THEN
    RETURN FALSE;
  ELSIF user_tier = 'basic' AND business_count >= 3 THEN
    RETURN FALSE;
  ELSIF user_tier = 'standard' AND business_count >= 5 THEN
    RETURN FALSE;
  ELSIF user_tier = 'premium' AND business_count >= 10 THEN
    RETURN FALSE;
  ELSIF user_tier = 'enterprise_advantage' THEN
    RETURN TRUE; -- No limit for enterprise
  ELSIF user_tier = 'start_smart' AND business_count >= 2 THEN
    RETURN FALSE;
  ELSIF user_tier = 'grow_intelligence' AND business_count >= 5 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Create test_user_data function for debugging
CREATE OR REPLACE FUNCTION test_user_data(user_id_param UUID)
RETURNS TABLE (
  has_profile BOOLEAN,
  has_businesses BOOLEAN,
  business_count BIGINT,
  user_tier VARCHAR,
  user_type VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM user_profiles WHERE user_profiles.id = user_id_param) as has_profile,
    EXISTS(SELECT 1 FROM business_memberships WHERE user_id = user_id_param) as has_businesses,
    (SELECT COUNT(*) FROM business_memberships WHERE user_id = user_id_param) as business_count,
    COALESCE((SELECT tier FROM user_profiles WHERE user_profiles.id = user_id_param), 'free_trial')::VARCHAR as user_tier,
    COALESCE((SELECT user_type FROM user_profiles WHERE user_profiles.id = user_id_param), 'individual')::VARCHAR as user_type;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_businesses(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_individual_businesses(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_business(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION test_user_data(uuid) TO authenticated;
