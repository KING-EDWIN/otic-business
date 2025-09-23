-- Refresh schema cache and test the existing functions
-- This should resolve the 404 errors we're seeing

-- 1. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Grant execute permissions on all existing functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 3. Test a few key functions to make sure they work
DO $$
DECLARE
    test_user_id UUID;
    test_business_id UUID;
    result_count INTEGER;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user ID: %', test_user_id;
        
        -- Test get_user_businesses
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_user_businesses(test_user_id);
            RAISE NOTICE 'get_user_businesses: % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_user_businesses ERROR: %', SQLERRM;
        END;
        
        -- Test get_individual_businesses
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_individual_businesses(test_user_id);
            RAISE NOTICE 'get_individual_businesses: % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_individual_businesses ERROR: %', SQLERRM;
        END;
        
        -- Test get_user_invitations
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_user_invitations(test_user_id);
            RAISE NOTICE 'get_user_invitations: % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_user_invitations ERROR: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
    
    -- Get a test business ID
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    
    IF test_business_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with business ID: %', test_business_id;
        
        -- Test get_business_members
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_business_members(test_business_id);
            RAISE NOTICE 'get_business_members: % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_business_members ERROR: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE 'No businesses found for testing';
    END IF;
    
END $$;

-- 4. Check RLS status on key tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN 'RLS DISABLED - Good for testing'
        ELSE 'RLS ENABLED - May cause access issues'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'businesses', 'business_memberships', 'business_invitations', 'individual_business_access')
ORDER BY tablename;

SELECT 'Schema refresh and function testing completed' as status;
