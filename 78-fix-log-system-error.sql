-- Fix log_system_error function creation
-- Run this script in Supabase SQL editor

-- ==============================================
-- STEP 1: Drop existing function if it exists
-- ==============================================

DROP FUNCTION IF EXISTS log_system_error(text, text, jsonb, uuid, uuid);
DROP FUNCTION IF EXISTS log_system_error(text, text, jsonb, uuid, uuid, text);

-- ==============================================
-- STEP 2: Create the log_system_error function with correct signature
-- ==============================================

CREATE OR REPLACE FUNCTION log_system_error(
    p_error_type text,
    p_error_message text,
    p_error_details jsonb DEFAULT NULL,
    p_user_id uuid DEFAULT NULL,
    p_business_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id uuid;
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_error_logs') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'System error logs table not found'
        );
    END IF;
    
    -- Insert error log
    INSERT INTO system_error_logs (
        error_type,
        error_message,
        error_details,
        user_id,
        business_id,
        status
    ) VALUES (
        p_error_type,
        p_error_message,
        p_error_details,
        p_user_id,
        p_business_id,
        'active'
    ) RETURNING id INTO log_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'log_id', log_id
    );
END;
$$;

-- ==============================================
-- STEP 3: Grant execute permissions
-- ==============================================

GRANT EXECUTE ON FUNCTION log_system_error(text, text, jsonb, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION log_system_error(text, text, jsonb, uuid, uuid) TO anon;

-- ==============================================
-- STEP 4: Test the function
-- ==============================================

DO $$
DECLARE
    test_user_id UUID;
    test_business_id UUID;
    result jsonb;
BEGIN
    -- Get test data
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_business_id IS NOT NULL THEN
        RAISE NOTICE 'Testing log_system_error function...';
        
        -- Test the function
        SELECT log_system_error(
            'SYSTEM_TEST'::text,
            'Testing system error logging'::text,
            '{"test": true, "timestamp": "2024-01-01"}'::jsonb,
            test_user_id,
            test_business_id
        ) INTO result;
        
        RAISE NOTICE 'log_system_error result: %', result;
        
        IF (result->>'success')::boolean THEN
            RAISE NOTICE '✅ log_system_error function working correctly!';
        ELSE
            RAISE NOTICE '❌ log_system_error function failed: %', result->>'error';
        END IF;
        
    ELSE
        RAISE NOTICE 'No test data found - creating test data...';
        
        -- Create test user if none exists
        IF test_user_id IS NULL THEN
            INSERT INTO user_profiles (id, email, full_name, tier, user_type, email_verified)
            VALUES (
                gen_random_uuid(),
                'test@example.com',
                'Test User',
                'free_trial',
                'business',
                true
            ) RETURNING id INTO test_user_id;
            RAISE NOTICE 'Created test user: %', test_user_id;
        END IF;
        
        -- Create test business if none exists
        IF test_business_id IS NULL THEN
            INSERT INTO businesses (id, name, owner_id, business_type, status)
            VALUES (
                gen_random_uuid(),
                'Test Business',
                test_user_id,
                'retail',
                'active'
            ) RETURNING id INTO test_business_id;
            RAISE NOTICE 'Created test business: %', test_business_id;
        END IF;
        
        -- Now test the function
        SELECT log_system_error(
            'SYSTEM_TEST'::text,
            'Testing system error logging'::text,
            '{"test": true, "timestamp": "2024-01-01"}'::jsonb,
            test_user_id,
            test_business_id
        ) INTO result;
        
        RAISE NOTICE 'log_system_error result: %', result;
        
        IF (result->>'success')::boolean THEN
            RAISE NOTICE '✅ log_system_error function working correctly!';
        ELSE
            RAISE NOTICE '❌ log_system_error function failed: %', result->>'error';
        END IF;
    END IF;
END $$;

-- ==============================================
-- STEP 5: Verify function exists
-- ==============================================

SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'log_system_error' 
  AND routine_schema = 'public';

SELECT 'log_system_error function created and tested successfully!' as status;
