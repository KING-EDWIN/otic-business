-- SIMPLE ADMIN FIX - Just disable RLS and grant permissions
-- This will allow direct table access without complex RPC functions

-- Disable RLS on user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON user_profiles TO anon, authenticated, service_role;

-- Drop existing function first
DROP FUNCTION IF EXISTS simple_user_search(TEXT);

-- Create a simple search function that works
CREATE FUNCTION simple_user_search(search_email TEXT)
RETURNS TABLE(
    id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    user_type CHARACTER VARYING,
    tier CHARACTER VARYING,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.full_name,
        up.business_name,
        up.user_type,
        COALESCE(up.tier, 'free_trial')::TEXT as tier,
        up.created_at
    FROM user_profiles up
    WHERE up.email ILIKE '%' || search_email || '%'
    ORDER BY up.created_at DESC
    LIMIT 10;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION simple_user_search(TEXT) TO anon, authenticated, service_role;

SELECT 'Simple admin fix applied!' as status;
