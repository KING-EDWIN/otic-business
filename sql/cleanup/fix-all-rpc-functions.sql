-- Fix all RPC functions to match actual database schema
-- This script fixes type mismatches in all business-related functions

-- Check the actual schema of all tables
SELECT 'Table Schemas' as info, 
       table_name,
       column_name,
       data_type,
       character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('businesses', 'business_memberships', 'user_profiles')
ORDER BY table_name, ordinal_position;

-- Drop all existing functions
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
DROP FUNCTION IF EXISTS can_create_business(uuid);
DROP FUNCTION IF EXISTS get_business_members(uuid);

-- Fix get_user_businesses function
CREATE OR REPLACE FUNCTION get_user_businesses(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    business_type VARCHAR(100),
    industry VARCHAR(100),
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(100),
    registration_number VARCHAR(100),
    currency VARCHAR(3),
    timezone VARCHAR(50),
    logo_url TEXT,
    status VARCHAR(20),
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    user_role VARCHAR(50),
    joined_at TIMESTAMP WITH TIME ZONE
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
        b.created_by,
        bm.role as user_role,
        bm.joined_at
    FROM businesses b
    INNER JOIN business_memberships bm ON b.id = bm.business_id
    WHERE bm.user_id = user_id_param
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix can_create_business function
CREATE OR REPLACE FUNCTION can_create_business(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    business_count INTEGER;
    user_tier TEXT;
BEGIN
    -- Get user's tier
    SELECT tier INTO user_tier
    FROM user_profiles
    WHERE id = user_id_param;
    
    -- Count user's businesses
    SELECT COUNT(*) INTO business_count
    FROM business_memberships
    WHERE user_id = user_id_param AND role = 'owner';
    
    -- Check tier limits
    CASE user_tier
        WHEN 'free_trial' THEN RETURN business_count < 1;
        WHEN 'start_smart' THEN RETURN business_count < 3;
        WHEN 'grow_intelligence' THEN RETURN business_count < 10;
        WHEN 'enterprise_advantage' THEN RETURN true;
        ELSE RETURN business_count < 1;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_business_members function
CREATE OR REPLACE FUNCTION get_business_members(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    role VARCHAR(50),
    status VARCHAR(20),
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bm.id,
        bm.user_id,
        up.email,
        up.full_name,
        up.business_name,
        bm.role,
        bm.status,
        bm.joined_at
    FROM business_memberships bm
    INNER JOIN user_profiles up ON bm.user_id = up.id
    WHERE bm.business_id = business_id_param
    ORDER BY bm.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_businesses(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION can_create_business(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_business_members(uuid) TO authenticated, anon;

-- Test all functions
SELECT 'Function Tests' as test_type,
       'get_user_businesses' as function_name,
       COUNT(*) as result_count
FROM get_user_businesses(auth.uid())
UNION ALL
SELECT 'Function Tests' as test_type,
       'can_create_business' as function_name,
       CASE WHEN can_create_business(auth.uid()) THEN 1 ELSE 0 END as result_count
UNION ALL
SELECT 'Function Tests' as test_type,
       'get_business_members' as function_name,
       COUNT(*) as result_count
FROM get_business_members(
    (SELECT id FROM businesses LIMIT 1)
);

-- Show current user's businesses
SELECT 'Current User Businesses' as info,
       b.id,
       b.name,
       b.business_type,
       bm.role,
       b.created_at
FROM businesses b
JOIN business_memberships bm ON b.id = bm.business_id
WHERE bm.user_id = auth.uid()
ORDER BY b.created_at DESC;




