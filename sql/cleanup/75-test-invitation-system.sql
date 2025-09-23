-- Test the invitation system
-- Run this script in Supabase SQL editor

-- ==============================================
-- STEP 1: Create a test invitation
-- ==============================================

DO $$
DECLARE
    test_business_id UUID;
    test_user_id UUID;
    invitation_id UUID;
    test_email text := 'test@example.com';
BEGIN
    -- Get test IDs
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    
    IF test_business_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        -- Delete any existing test invitations
        DELETE FROM business_invitations WHERE invited_email = test_email;
        
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
            test_email,
            'Test User',
            'manager',
            'pending',
            'test-token-' || extract(epoch from now())::text,
            NOW() + INTERVAL '7 days',
            'Test invitation for system verification'
        ) RETURNING id INTO invitation_id;
        
        RAISE NOTICE 'Test invitation created with ID: %', invitation_id;
        
        -- Test getting invitations
        PERFORM get_user_invitations(test_email);
        RAISE NOTICE 'Test invitation retrieval: OK';
        
        -- Test responding to invitation
        PERFORM respond_to_invitation(invitation_id, 'accepted');
        RAISE NOTICE 'Test invitation response: OK';
        
        -- Verify the invitation was updated
        IF EXISTS (SELECT 1 FROM business_invitations WHERE id = invitation_id AND status = 'accepted') THEN
            RAISE NOTICE 'Invitation status updated to accepted: OK';
        ELSE
            RAISE NOTICE 'ERROR: Invitation status was not updated';
        END IF;
        
    ELSE
        RAISE NOTICE 'No test data found - please ensure you have businesses and users in the database';
    END IF;
END $$;

-- ==============================================
-- STEP 2: Test table access
-- ==============================================

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

SELECT 'Invitation system test completed successfully!' as status;




