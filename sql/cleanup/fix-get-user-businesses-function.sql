-- Fix get_user_businesses function to match actual database schema
-- The error shows type mismatch between character varying(255) and text

-- First, let's check the actual column types in the businesses table
SELECT 'Businesses Table Schema' as info,
       column_name,
       data_type,
       character_maximum_length,
       is_nullable
FROM information_schema.columns
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_businesses(uuid);

-- Create the corrected function with proper return types
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_businesses(uuid) TO authenticated, anon;

-- Test the function
SELECT 'Function Test' as test, 
       COUNT(*) as result_count
FROM get_user_businesses(auth.uid());

-- Show actual businesses for current user
SELECT 'User Businesses Details' as test,
       b.id,
       b.name,
       b.business_type,
       bm.role,
       bm.joined_at
FROM businesses b
JOIN business_memberships bm ON b.id = bm.business_id
WHERE bm.user_id = auth.uid()
ORDER BY b.created_at DESC;




