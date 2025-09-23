-- Create business management RPC functions
-- This script creates the essential RPC functions for multi-business management

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
DROP FUNCTION IF EXISTS can_create_business(uuid);
DROP FUNCTION IF EXISTS get_business_members(uuid);
DROP FUNCTION IF EXISTS switch_business_context(uuid, uuid);

-- Function to get user's businesses
CREATE OR REPLACE FUNCTION get_user_businesses(user_id_param UUID)
RETURNS TABLE(
  id UUID,
  name VARCHAR,
  description TEXT,
  business_type VARCHAR,
  industry VARCHAR,
  website VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  address TEXT,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR,
  postal_code VARCHAR,
  tax_id VARCHAR,
  registration_number VARCHAR,
  currency VARCHAR,
  timezone VARCHAR,
  logo_url TEXT,
  status VARCHAR,
  settings JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  user_role VARCHAR,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id, b.name, b.description, b.business_type, b.industry, b.website, 
    b.phone, b.email, b.address, b.city, b.state, b.country, b.postal_code, 
    b.tax_id, b.registration_number, b.currency, b.timezone, b.logo_url, 
    b.status, b.settings, b.created_at, b.updated_at, b.created_by,
    bm.role as user_role, bm.joined_at
  FROM businesses b
  INNER JOIN business_memberships bm ON b.id = bm.business_id
  WHERE bm.user_id = user_id_param 
    AND bm.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create more businesses
CREATE OR REPLACE FUNCTION can_create_business(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  business_count INTEGER;
  user_tier VARCHAR;
BEGIN
  -- Get user's current tier
  SELECT tier INTO user_tier
  FROM user_profiles
  WHERE id = user_id_param;
  
  -- Count user's current businesses
  SELECT COUNT(*) INTO business_count
  FROM business_memberships
  WHERE user_id = user_id_param AND status = 'active';
  
  -- Check tier limits
  IF user_tier = 'free_trial' THEN
    RETURN business_count < 1;
  ELSIF user_tier = 'start_smart' THEN
    RETURN business_count < 3;
  ELSIF user_tier = 'grow_intelligence' THEN
    RETURN business_count < 5;
  ELSIF user_tier = 'enterprise_advantage' THEN
    RETURN business_count < 10;
  ELSE
    RETURN business_count < 1; -- Default limit
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get business members
CREATE OR REPLACE FUNCTION get_business_members(business_id_param UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  role VARCHAR,
  status VARCHAR,
  joined_at TIMESTAMPTZ,
  user_email TEXT,
  user_business_name TEXT,
  user_phone TEXT,
  user_full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bm.id,
    bm.user_id,
    bm.role,
    bm.status,
    bm.joined_at,
    up.email as user_email,
    up.business_name as user_business_name,
    up.phone as user_phone,
    up.full_name as user_full_name
  FROM business_memberships bm
  LEFT JOIN user_profiles up ON bm.user_id = up.id
  WHERE bm.business_id = business_id_param
    AND bm.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to switch business context (for future use)
CREATE OR REPLACE FUNCTION switch_business_context(user_id_param UUID, business_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  membership_exists BOOLEAN;
BEGIN
  -- Check if user is a member of the business
  SELECT EXISTS(
    SELECT 1 FROM business_memberships 
    WHERE user_id = user_id_param 
      AND business_id = business_id_param 
      AND status = 'active'
  ) INTO membership_exists;
  
  RETURN membership_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_businesses(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_business(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION switch_business_context(uuid, uuid) TO authenticated;

-- Grant to anon for public access
GRANT EXECUTE ON FUNCTION get_user_businesses(uuid) TO anon;
GRANT EXECUTE ON FUNCTION can_create_business(uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_business_members(uuid) TO anon;
GRANT EXECUTE ON FUNCTION switch_business_context(uuid, uuid) TO anon;
