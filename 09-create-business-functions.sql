-- Create Business Management Functions
-- This file creates the necessary functions for business management

-- Function to check if user can create businesses (Enterprise Advantage tier)
CREATE OR REPLACE FUNCTION can_create_business(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has Enterprise Advantage tier
  RETURN EXISTS (
    SELECT 1 
    FROM user_subscriptions us
    JOIN tiers t ON us.tier_id = t.id
    WHERE us.user_id = user_uuid 
    AND t.name = 'enterprise_advantage'
    AND us.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's businesses
CREATE OR REPLACE FUNCTION get_user_businesses(user_uuid UUID)
RETURNS TABLE (
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
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.business_type,
    b.industry,
    b.website,
    b.phone,
    b.email,
    b.address,
    b.city,
    b.state,
    b.country,
    b.postal_code,
    b.tax_id,
    b.registration_number,
    b.currency,
    b.timezone,
    b.logo_url,
    b.status,
    b.settings,
    b.created_at,
    b.updated_at,
    b.created_by
  FROM businesses b
  JOIN business_memberships bm ON b.id = bm.business_id
  WHERE bm.user_id = user_uuid
  AND bm.status = 'active'
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new business
CREATE OR REPLACE FUNCTION create_business(
  business_name VARCHAR,
  business_description TEXT,
  business_type VARCHAR,
  industry VARCHAR,
  owner_uuid UUID
)
RETURNS UUID AS $$
DECLARE
  new_business_id UUID;
BEGIN
  -- Check if user can create businesses
  IF NOT can_create_business(owner_uuid) THEN
    RAISE EXCEPTION 'User does not have permission to create businesses. Enterprise Advantage tier required.';
  END IF;

  -- Create the business
  INSERT INTO businesses (
    name,
    description,
    business_type,
    industry,
    currency,
    timezone,
    status,
    settings,
    created_by
  ) VALUES (
    business_name,
    business_description,
    business_type,
    industry,
    'UGX',
    'Africa/Kampala',
    'active',
    '{}',
    owner_uuid
  ) RETURNING id INTO new_business_id;

  -- Add owner as admin member
  INSERT INTO business_memberships (
    user_id,
    business_id,
    role,
    permissions,
    status,
    joined_at
  ) VALUES (
    owner_uuid,
    new_business_id,
    'owner',
    '{"all": true}',
    'active',
    NOW()
  );

  RETURN new_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to switch business context
CREATE OR REPLACE FUNCTION switch_business_context(
  user_uuid UUID,
  business_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is a member of the business
  IF NOT EXISTS (
    SELECT 1 
    FROM business_memberships 
    WHERE user_id = user_uuid 
    AND business_id = business_uuid 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User is not a member of this business';
  END IF;

  -- Update or insert business switch record
  INSERT INTO business_switches (user_id, business_id, switched_at)
  VALUES (user_uuid, business_uuid, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    business_id = business_uuid,
    switched_at = NOW();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current business context
CREATE OR REPLACE FUNCTION get_current_business_context(user_uuid UUID)
RETURNS TABLE (
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
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.business_type,
    b.industry,
    b.website,
    b.phone,
    b.email,
    b.address,
    b.city,
    b.state,
    b.country,
    b.postal_code,
    b.tax_id,
    b.registration_number,
    b.currency,
    b.timezone,
    b.logo_url,
    b.status,
    b.settings,
    b.created_at,
    b.updated_at,
    b.created_by
  FROM businesses b
  JOIN business_switches bs ON b.id = bs.business_id
  WHERE bs.user_id = user_uuid
  ORDER BY bs.switched_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION can_create_business(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_businesses(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_business(VARCHAR, TEXT, VARCHAR, VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION switch_business_context(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_business_context(UUID) TO authenticated;
