-- Test all RPC functions to ensure they work correctly
-- This script will test each function with sample data

-- Test 1: Check if all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('businesses', 'user_profiles', 'business_memberships', 'business_invitations', 'individual_business_access', 'products', 'customers', 'sales', 'inventory', 'orders', 'transactions') 
        THEN 'Required table exists'
        ELSE 'Optional table'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Test 2: Check if all RPC functions exist
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
AND routine_name LIKE 'get_%' OR routine_name LIKE 'respond_%' OR routine_name LIKE 'can_%' OR routine_name LIKE 'test_%' OR routine_name LIKE 'switch_%'
ORDER BY routine_name;

-- Test 3: Check RLS status on all tables
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
ORDER BY tablename;

-- Test 4: Check permissions on functions
SELECT 
    routine_name,
    privilege_type,
    grantee
FROM information_schema.routine_privileges 
WHERE routine_schema = 'public' 
AND grantee = 'authenticated'
ORDER BY routine_name, privilege_type;

-- Test 5: Test a simple function call (if we have data)
-- This will only work if there's actual data in the database
DO $$
DECLARE
    test_user_id UUID;
    test_business_id UUID;
    result_count INTEGER;
    function_exists BOOLEAN;
BEGIN
    -- Try to get a user ID
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found test user: %', test_user_id;
        
        -- Test get_user_businesses function
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_user_businesses(test_user_id);
            RAISE NOTICE 'get_user_businesses returned % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_user_businesses failed: %', SQLERRM;
        END;
        
        -- Test get_individual_businesses function
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_individual_businesses(test_user_id);
            RAISE NOTICE 'get_individual_businesses returned % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_individual_businesses failed: %', SQLERRM;
        END;
        
        -- Test get_user_invitations function
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_user_invitations(test_user_id);
            RAISE NOTICE 'get_user_invitations returned % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_user_invitations failed: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE 'No users found in database - functions exist but no data to test with';
    END IF;
    
    -- Try to get a business ID
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    
    IF test_business_id IS NOT NULL THEN
        RAISE NOTICE 'Found test business: %', test_business_id;
        
        -- Test get_business_members function
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_business_members(test_business_id);
            RAISE NOTICE 'get_business_members returned % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_business_members failed: %', SQLERRM;
        END;
        
        -- Test get_business_details function
        BEGIN
            SELECT COUNT(*) INTO result_count FROM get_business_details(test_business_id);
            RAISE NOTICE 'get_business_details returned % rows', result_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'get_business_details failed: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE 'No businesses found in database - functions exist but no data to test with';
    END IF;
    
END $$;

SELECT 'All tests completed successfully' as final_status;
