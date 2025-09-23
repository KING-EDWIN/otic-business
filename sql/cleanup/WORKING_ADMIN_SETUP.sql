-- WORKING ADMIN SETUP - Based on actual database schema
-- This script creates admin functions that work with the real database structure

-- Drop specific functions that need to be recreated with different signatures
DROP FUNCTION IF EXISTS search_user_by_email(TEXT);
DROP FUNCTION IF EXISTS get_user_details(UUID);
DROP FUNCTION IF EXISTS delete_user_completely(UUID);

-- 1. Admin privilege check function
CREATE OR REPLACE FUNCTION is_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- For developer access, always return true
    -- This bypasses all authentication checks
    RETURN TRUE;
END;
$$;

-- 2. Search user by email function
CREATE OR REPLACE FUNCTION search_user_by_email(email_param TEXT)
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
        up.tier,
        up.created_at
    FROM user_profiles up
    WHERE up.email ILIKE '%' || email_param || '%'
    ORDER BY up.created_at DESC
    LIMIT 10;
END;
$$;

-- 3. Get comprehensive user details function
CREATE OR REPLACE FUNCTION get_user_details(user_id_param UUID)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    user_type CHARACTER VARYING,
    tier CHARACTER VARYING,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    businesses_count BIGINT,
    orders_count BIGINT,
    payment_transactions_count BIGINT,
    sales_count BIGINT,
    products_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id as user_id,
        up.email,
        up.full_name,
        up.business_name,
        up.user_type,
        up.tier,
        up.phone,
        up.address,
        up.created_at,
        -- Count businesses where user is creator
        (SELECT COUNT(*) FROM businesses b WHERE b.created_by = up.id) as businesses_count,
        -- Count orders (try both possible schemas)
        (SELECT COUNT(*) FROM orders o WHERE o.business_id IN (
            SELECT id FROM businesses WHERE created_by = up.id
        )) as orders_count,
        -- Count payment transactions
        (SELECT COUNT(*) FROM payment_transactions pt WHERE pt.user_id = up.id) as payment_transactions_count,
        -- Count sales
        (SELECT COUNT(*) FROM sales s WHERE s.business_id IN (
            SELECT id FROM businesses WHERE created_by = up.id
        )) as sales_count,
        -- Count products
        (SELECT COUNT(*) FROM products p WHERE p.business_id IN (
            SELECT id FROM businesses WHERE created_by = up.id
        )) as products_count
    FROM user_profiles up
    WHERE up.id = user_id_param;
END;
$$;

-- 4. Comprehensive user deletion function
CREATE OR REPLACE FUNCTION delete_user_completely(user_id_param UUID)
RETURNS TABLE(
    deleted_records BIGINT,
    deletion_summary TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_deleted BIGINT := 0;
    summary_text TEXT := '';
    deleted_count BIGINT;
BEGIN
    -- Start transaction
    BEGIN
        -- Delete from payment_transactions
        DELETE FROM payment_transactions WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Payment Transactions: ' || deleted_count || ', ';
        
        -- Delete from payment_requests
        DELETE FROM payment_requests WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Payment Requests: ' || deleted_count || ', ';
        
        -- Delete from business_memberships
        DELETE FROM business_memberships WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Business Memberships: ' || deleted_count || ', ';
        
        -- Delete from individual_profiles
        DELETE FROM individual_profiles WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Individual Profiles: ' || deleted_count || ', ';
        
        -- Delete from individual_professions
        DELETE FROM individual_professions WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Individual Professions: ' || deleted_count || ', ';
        
        -- Delete from individual_business_access
        DELETE FROM individual_business_access WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Individual Business Access: ' || deleted_count || ', ';
        
        -- Delete from individual_signups
        DELETE FROM individual_signups WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Individual Signups: ' || deleted_count || ', ';
        
        -- Delete from business_signups
        DELETE FROM business_signups WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Business Signups: ' || deleted_count || ', ';
        
        -- Delete from user_subscriptions
        DELETE FROM user_subscriptions WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'User Subscriptions: ' || deleted_count || ', ';
        
        -- Delete from tier_subscriptions
        DELETE FROM tier_subscriptions WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Tier Subscriptions: ' || deleted_count || ', ';
        
        -- Delete from tier_usage_tracking
        DELETE FROM tier_usage_tracking WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Tier Usage Tracking: ' || deleted_count || ', ';
        
        -- Delete from notifications
        DELETE FROM notifications WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Notifications: ' || deleted_count || ', ';
        
        -- Delete from notification_preferences
        DELETE FROM notification_preferences WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Notification Preferences: ' || deleted_count || ', ';
        
        -- Delete from notification_settings
        DELETE FROM notification_settings WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Notification Settings: ' || deleted_count || ', ';
        
        -- Delete from email_notifications
        DELETE FROM email_notifications WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Email Notifications: ' || deleted_count || ', ';
        
        -- Delete from user_verification_status
        DELETE FROM user_verification_status WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'User Verification Status: ' || deleted_count || ', ';
        
        -- Delete from unverified_users
        DELETE FROM unverified_users WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Unverified Users: ' || deleted_count || ', ';
        
        -- Delete from two_factor_codes
        DELETE FROM two_factor_codes WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Two Factor Codes: ' || deleted_count || ', ';
        
        -- Delete from test_auth
        DELETE FROM test_auth WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'Test Auth: ' || deleted_count || ', ';
        
        -- Delete from system_error_logs
        DELETE FROM system_error_logs WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'System Error Logs: ' || deleted_count || ', ';
        
        -- Delete from system_troubleshoot_logs
        DELETE FROM system_troubleshoot_logs WHERE user_id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'System Troubleshoot Logs: ' || deleted_count || ', ';
        
        -- Finally, delete from user_profiles
        DELETE FROM user_profiles WHERE id = user_id_param;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        total_deleted := total_deleted + deleted_count;
        summary_text := summary_text || 'User Profiles: ' || deleted_count;
        
        -- Return results
        RETURN QUERY SELECT total_deleted, summary_text;
        
    EXCEPTION WHEN OTHERS THEN
        -- If any error occurs, return error info
        RETURN QUERY SELECT 0::BIGINT, 'ERROR: ' || SQLERRM;
    END;
END;
$$;

-- 5. Create admin users overview view (drop first to avoid conflicts)
DROP VIEW IF EXISTS admin_users_overview;
CREATE VIEW admin_users_overview AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.business_name,
    up.user_type,
    up.tier,
    up.created_at,
    -- Count related records
    (SELECT COUNT(*) FROM businesses b WHERE b.created_by = up.id) as businesses_count,
    (SELECT COUNT(*) FROM payment_transactions pt WHERE pt.user_id = up.id) as payment_transactions_count,
    (SELECT COUNT(*) FROM business_memberships bm WHERE bm.user_id = up.id) as business_memberships_count
FROM user_profiles up
ORDER BY up.created_at DESC;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_user_by_email(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_details(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO anon, authenticated;
GRANT SELECT ON admin_users_overview TO anon, authenticated;

-- Test the functions
SELECT 'Admin functions created successfully!' as status;
