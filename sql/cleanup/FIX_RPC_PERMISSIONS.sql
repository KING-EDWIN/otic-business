-- Fix RPC function permissions
-- This script ensures the RPC functions are accessible

-- Grant execute permissions on all admin functions
GRANT EXECUTE ON FUNCTION search_user_by_email(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_details(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated, service_role;

-- Grant select permissions on the view
GRANT SELECT ON admin_users_overview TO anon, authenticated, service_role;

-- Also grant permissions on user_profiles table for fallback access
GRANT SELECT ON user_profiles TO anon, authenticated, service_role;

SELECT 'RPC permissions granted successfully!' as status;
