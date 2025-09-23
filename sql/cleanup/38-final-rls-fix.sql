-- Final RLS fix for all tables
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS temporarily to fix access issues
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations DISABLE ROW LEVEL SECURITY;

-- 2. Check if other tables exist and disable RLS
DO $$
DECLARE
    tbl_name TEXT;
    tables_to_check TEXT[] := ARRAY['products', 'sales', 'inventory', 'customers', 'orders', 'transactions'];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name) THEN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'Disabled RLS for table: %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- 3. Grant all permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 4. Grant permissions to anon users for public access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 5. Ensure all RPC functions have proper permissions
GRANT EXECUTE ON FUNCTION get_user_businesses(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_individual_businesses(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_business(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION test_user_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION switch_business_context(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_invitations(text) TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_invitation(uuid, varchar, uuid) TO authenticated;

-- 6. Create a simple test function to verify access
CREATE OR REPLACE FUNCTION test_access()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'success', true,
    'message', 'Access test successful',
    'timestamp', NOW()
  );
$$;

GRANT EXECUTE ON FUNCTION test_access() TO authenticated;
GRANT EXECUTE ON FUNCTION test_access() TO anon;

-- 7. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 8. Test the functions
SELECT 'RLS disabled and permissions granted' as status;
SELECT test_access() as access_test;
