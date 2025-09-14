-- Test the complete system after fixes
-- Run this script in Supabase SQL editor

-- ==============================================
-- STEP 1: Test RPC functions
-- ==============================================

DO $$
DECLARE
    test_user_id UUID;
    test_business_id UUID;
    test_email text;
    result jsonb;
BEGIN
    -- Get test data
    SELECT id, email INTO test_user_id, test_email FROM user_profiles LIMIT 1;
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing complete system with user: %', test_user_id;
        
        -- Test 1: log_system_error
        SELECT log_system_error(
            'SYSTEM_TEST',
            'Testing system error logging',
            '{"test": true, "timestamp": "2024-01-01"}'::jsonb,
            test_user_id,
            test_business_id
        ) INTO result;
        RAISE NOTICE 'log_system_error result: %', result;
        
        -- Test 2: get_user_invitations
        PERFORM get_user_invitations(test_email);
        RAISE NOTICE 'get_user_invitations: OK';
        
        -- Test 3: get_inventory_alerts
        PERFORM get_inventory_alerts(test_user_id);
        RAISE NOTICE 'get_inventory_alerts: OK';
        
        -- Test 4: get_sales_analytics
        PERFORM get_sales_analytics(test_user_id, 'month');
        RAISE NOTICE 'get_sales_analytics: OK';
        
        -- Test 5: get_ai_insights
        PERFORM get_ai_insights(test_user_id, 'free_trial');
        RAISE NOTICE 'get_ai_insights: OK';
        
        -- Test 6: test_access
        PERFORM test_access();
        RAISE NOTICE 'test_access: OK';
        
        IF test_business_id IS NOT NULL THEN
            -- Test 7: get_user_business_permissions
            PERFORM get_user_business_permissions(test_user_id, test_business_id);
            RAISE NOTICE 'get_user_business_permissions: OK';
        END IF;
        
        RAISE NOTICE 'All RPC functions tested successfully!';
    ELSE
        RAISE NOTICE 'No test user found - please create a user first';
    END IF;
END $$;

-- ==============================================
-- STEP 2: Test table access
-- ==============================================

-- Test direct table access
SELECT 'Testing table access...' as status;

-- Test user_profiles access
SELECT COUNT(*) as user_profiles_count FROM user_profiles;

-- Test businesses access
SELECT COUNT(*) as businesses_count FROM businesses;

-- Test business_memberships access
SELECT COUNT(*) as business_memberships_count FROM business_memberships;

-- Test business_invitations access
SELECT COUNT(*) as business_invitations_count FROM business_invitations;

-- Test system_error_logs access
SELECT COUNT(*) as system_error_logs_count FROM system_error_logs;

-- ==============================================
-- STEP 3: Test invitation system
-- ==============================================

-- Create a test invitation
DO $$
DECLARE
    test_business_id UUID;
    test_user_id UUID;
    invitation_id UUID;
BEGIN
    -- Get test IDs
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    
    IF test_business_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        -- Create a test invitation
        INSERT INTO business_invitations (
            business_id,
            invited_by,
            invited_email,
            invited_name,
            role,
            status,
            invitation_token,
            expires_at,
            message
        ) VALUES (
            test_business_id,
            test_user_id,
            'test@example.com',
            'Test User',
            'manager',
            'pending',
            'test-token-123',
            NOW() + INTERVAL '7 days',
            'Test invitation for system verification'
        ) RETURNING id INTO invitation_id;
        
        RAISE NOTICE 'Test invitation created with ID: %', invitation_id;
        
        -- Test getting invitations
        PERFORM get_user_invitations('test@example.com');
        RAISE NOTICE 'Test invitation retrieval: OK';
        
        -- Test responding to invitation
        PERFORM respond_to_invitation(invitation_id, 'accepted');
        RAISE NOTICE 'Test invitation response: OK';
    END IF;
END $$;

SELECT 'Complete system test finished successfully!' as status;
