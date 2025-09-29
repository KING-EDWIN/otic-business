-- Fix Account Deletion Management System
-- Run this in Supabase SQL Editor

-- 1. Create the missing RPC function for getting deleted accounts with pagination
CREATE OR REPLACE FUNCTION get_deleted_accounts(
    page_param INTEGER DEFAULT 1,
    limit_param INTEGER DEFAULT 10
)
RETURNS TABLE(
    accounts JSONB,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'id', du.id,
                'original_user_id', du.original_user_id,
                'email', du.email,
                'full_name', du.full_name,
                'business_name', du.business_name,
                'user_type', du.user_type,
                'tier', du.tier,
                'deletion_reason', du.deletion_reason,
                'deleted_at', du.deleted_at,
                'recovery_expires_at', du.recovery_expires_at,
                'is_recovered', du.is_recovered,
                'recovered_at', du.recovered_at,
                'days_remaining', EXTRACT(DAY FROM (du.recovery_expires_at - NOW()))::INTEGER
            ) ORDER BY du.deleted_at DESC
        ),
        COUNT(*) OVER()
    FROM deleted_users du
    WHERE du.is_recovered = false
    LIMIT limit_param
    OFFSET (page_param - 1) * limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to permanently delete ALL data for a user
CREATE OR REPLACE FUNCTION permanent_delete_user_data(
    user_id_param UUID,
    admin_user_id_param UUID DEFAULT '00000000-0000-0000-0000-000000000000'
)
RETURNS JSONB AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
    error_message TEXT;
BEGIN
    BEGIN
        -- Delete from all related tables (in dependency order)
        
        -- Individual user activity tables
        DELETE FROM individual_time_entries WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM individual_tasks WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        -- Business related data
        DELETE FROM business_memberships WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM business_invitations WHERE invited_by = user_id_param OR user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM business_access_permissions WHERE business_individual_access_id IN (
            SELECT id FROM individual_business_access WHERE individual_id = user_id_param
        );
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM individual_business_access WHERE individual_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        -- Business data (if user owns businesses)
        DELETE FROM businesses WHERE created_by = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        -- Product and sales data
        DELETE FROM products WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM sales WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM customers WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM inventory WHERE business_id IN (
            SELECT id FROM businesses WHERE created_by = user_id_param
        );
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        -- Financial data
        DELETE FROM expenses WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM payment_transactions WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM accounts WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        -- Notifications and logs
        DELETE FROM notifications WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        DELETE FROM email_notifications WHERE user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        -- User profile (this should be last)
        DELETE FROM user_profiles WHERE id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        -- Finally, delete from deleted_users table
        DELETE FROM deleted_users WHERE original_user_id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        -- Delete from auth.users (this will cascade to other auth-related tables)
        DELETE FROM auth.users WHERE id = user_id_param;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'User and all related data permanently deleted',
            'deleted_records', deleted_count,
            'admin_id', admin_user_id_param
        );
        
    EXCEPTION WHEN OTHERS THEN
        error_message := SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'error', error_message,
            'deleted_records', deleted_count
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to cleanup expired accounts (permanent deletion)
CREATE OR REPLACE FUNCTION cleanup_expired_accounts()
RETURNS JSONB AS $$
DECLARE
    expired_accounts UUID[];
    deleted_count INTEGER := 0;
    account_id UUID;
BEGIN
    -- Get all expired accounts that haven't been recovered
    SELECT ARRAY_AGG(original_user_id) INTO expired_accounts
    FROM deleted_users 
    WHERE recovery_expires_at < NOW() 
    AND is_recovered = false;
    
    -- Permanently delete each expired account
    IF expired_accounts IS NOT NULL THEN
        FOREACH account_id IN ARRAY expired_accounts
        LOOP
            PERFORM permanent_delete_user_data(account_id);
            deleted_count := deleted_count + 1;
        END LOOP;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Expired accounts cleaned up',
        'deleted_count', deleted_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to permanently delete ALL accounts (nuclear option)
CREATE OR REPLACE FUNCTION permanent_delete_all_accounts()
RETURNS JSONB AS $$
DECLARE
    all_accounts UUID[];
    deleted_count INTEGER := 0;
    account_id UUID;
BEGIN
    -- Get all accounts from deleted_users table
    SELECT ARRAY_AGG(original_user_id) INTO all_accounts
    FROM deleted_users;
    
    -- Permanently delete each account
    IF all_accounts IS NOT NULL THEN
        FOREACH account_id IN ARRAY all_accounts
        LOOP
            PERFORM permanent_delete_user_data(account_id);
            deleted_count := deleted_count + 1;
        END LOOP;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'All accounts permanently deleted',
        'deleted_count', deleted_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to create test deleted account
CREATE OR REPLACE FUNCTION create_test_deleted_account()
RETURNS JSONB AS $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Insert a test deleted account
    INSERT INTO deleted_users (
        id,
        original_user_id,
        email,
        full_name,
        business_name,
        user_type,
        tier,
        deletion_reason,
        deleted_by,
        deleted_at,
        recovery_token,
        recovery_expires_at,
        is_recovered
    ) VALUES (
        gen_random_uuid(),
        test_user_id,
        'test-deleted@example.com',
        'Test User',
        'Test Business',
        'business',
        'free_trial',
        'Test account for admin portal',
        '00000000-0000-0000-0000-000000000000',
        NOW(),
        gen_random_uuid(),
        NOW() + INTERVAL '30 days',
        false
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Test deleted account created',
        'test_user_id', test_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;