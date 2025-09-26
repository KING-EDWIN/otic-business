-- Fix the 30-day deletion system to work properly
-- This creates a proper cleanup function that handles Supabase constraints

-- 1. Create a function to clean up expired accounts (this will be called by a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_deleted_accounts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
    account_record RECORD;
BEGIN
    -- Get all expired accounts that haven't been recovered
    FOR account_record IN 
        SELECT original_user_id, email, full_name
        FROM deleted_users 
        WHERE recovery_expires_at < NOW() 
        AND is_recovered = false
    LOOP
        -- Delete from all related tables first (in order to respect foreign key constraints)
        
        -- Delete analytics and tracking data
        DELETE FROM analytics_data WHERE user_id = account_record.original_user_id;
        
        -- Delete business-related data
        DELETE FROM business_memberships WHERE user_id = account_record.original_user_id;
        DELETE FROM business_switches WHERE user_id = account_record.original_user_id;
        DELETE FROM businesses WHERE created_by = account_record.original_user_id;
        
        -- Delete payment and transaction data
        DELETE FROM payment_history WHERE user_id = account_record.original_user_id;
        DELETE FROM payment_requests WHERE user_id = account_record.original_user_id;
        DELETE FROM payment_transactions WHERE user_id = account_record.original_user_id;
        DELETE FROM subscriptions WHERE user_id = account_record.original_user_id;
        DELETE FROM payments WHERE user_id = account_record.original_user_id;
        
        -- Delete inventory and product data
        DELETE FROM products WHERE user_id = account_record.original_user_id;
        DELETE FROM inventory WHERE business_id IN (SELECT id FROM businesses WHERE created_by = account_record.original_user_id);
        DELETE FROM stock_movements WHERE business_id IN (SELECT id FROM businesses WHERE created_by = account_record.original_user_id);
        
        -- Delete sales data
        DELETE FROM sales WHERE user_id = account_record.original_user_id;
        DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE user_id = account_record.original_user_id);
        
        -- Delete customer data
        DELETE FROM customers WHERE user_id = account_record.original_user_id;
        DELETE FROM customer_communications WHERE user_id = account_record.original_user_id;
        
        -- Delete invoice data
        DELETE FROM invoices WHERE user_id = account_record.original_user_id;
        DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = account_record.original_user_id);
        
        -- Delete notification data
        DELETE FROM notifications WHERE user_id = account_record.original_user_id;
        DELETE FROM notification_preferences WHERE user_id = account_record.original_user_id;
        
        -- Delete contact messages
        DELETE FROM contact_messages WHERE user_id = account_record.original_user_id;
        
        -- Delete FAQ data
        DELETE FROM faq_items WHERE created_by = account_record.original_user_id;
        
        -- Delete visual scan data
        DELETE FROM vft_products WHERE user_id = account_record.original_user_id;
        DELETE FROM visual_scan_history WHERE user_id = account_record.original_user_id;
        DELETE FROM detected_objects WHERE user_id = account_record.original_user_id;
        DELETE FROM detection_sessions WHERE user_id = account_record.original_user_id;
        DELETE FROM object_matches WHERE detected_object_id IN (SELECT id FROM detected_objects WHERE user_id = account_record.original_user_id);
        
        -- Delete individual signup data
        DELETE FROM individual_signups WHERE user_id = account_record.original_user_id;
        
        -- Delete business signup data
        DELETE FROM business_signups WHERE user_id = account_record.original_user_id;
        
        -- Delete tier-related data
        DELETE FROM tier_usage_tracking WHERE user_id = account_record.original_user_id;
        DELETE FROM tier_subscriptions WHERE user_id = account_record.original_user_id;
        
        -- Delete system logs
        DELETE FROM system_error_logs WHERE user_id = account_record.original_user_id;
        DELETE FROM system_troubleshoot_logs WHERE user_id = account_record.original_user_id;
        
        -- Handle foreign key constraint: Set individual_profession_id to NULL first
        UPDATE user_profiles SET individual_profession_id = NULL WHERE id = account_record.original_user_id;
        
        -- Delete the user profile
        DELETE FROM user_profiles WHERE id = account_record.original_user_id;
        
        -- Delete from deleted_users table
        DELETE FROM deleted_users WHERE original_user_id = account_record.original_user_id;
        
        -- Note: We CANNOT delete from auth.users programmatically due to Supabase constraints
        -- This will need to be done manually or through the Supabase Admin API
        
        deleted_count := deleted_count + 1;
        
        -- Log the deletion
        INSERT INTO system_error_logs (user_id, error_type, error_message, created_at)
        VALUES (
            account_record.original_user_id,
            'ACCOUNT_CLEANUP',
            'Account permanently deleted after 30-day recovery period: ' || account_record.email,
            NOW()
        );
        
    END LOOP;
    
    RETURN deleted_count;
END;
$$;

-- 2. Create a function to get accounts that need manual auth.users deletion
CREATE OR REPLACE FUNCTION get_accounts_needing_auth_deletion()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    full_name TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    days_expired INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.original_user_id,
        d.email,
        d.full_name,
        d.deleted_at,
        EXTRACT(DAY FROM NOW() - d.recovery_expires_at)::INTEGER as days_expired
    FROM deleted_users d
    WHERE d.recovery_expires_at < NOW() 
    AND d.is_recovered = false
    ORDER BY d.deleted_at ASC;
END;
$$;

-- 3. Create a function to mark accounts as "ready for manual deletion"
CREATE OR REPLACE FUNCTION mark_accounts_for_manual_deletion()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    marked_count INTEGER := 0;
    account_record RECORD;
BEGIN
    -- First, clean up all the data
    SELECT cleanup_expired_deleted_accounts() INTO marked_count;
    
    -- Then mark remaining accounts as "needs manual deletion"
    UPDATE deleted_users 
    SET is_recovered = true -- Mark as "processed" to prevent re-processing
    WHERE recovery_expires_at < NOW() 
    AND is_recovered = false;
    
    RETURN marked_count;
END;
$$;

-- 4. Create a view to easily see accounts that need manual deletion
CREATE OR REPLACE VIEW accounts_needing_manual_deletion AS
SELECT 
    d.original_user_id,
    d.email,
    d.full_name,
    d.deleted_at,
    d.recovery_expires_at,
    EXTRACT(DAY FROM NOW() - d.recovery_expires_at)::INTEGER as days_expired,
    'MANUAL_DELETION_REQUIRED' as status
FROM deleted_users d
WHERE d.recovery_expires_at < NOW() 
AND d.is_recovered = false
ORDER BY d.deleted_at ASC;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_deleted_accounts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_accounts_needing_auth_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_accounts_for_manual_deletion() TO authenticated;
GRANT SELECT ON accounts_needing_manual_deletion TO authenticated;

-- 6. Create a comment explaining the system
COMMENT ON FUNCTION cleanup_expired_deleted_accounts() IS 
'Cleans up expired deleted accounts by removing all related data. Returns count of accounts processed. Note: auth.users deletion must be done manually through Supabase dashboard due to internal constraints.';

COMMENT ON FUNCTION get_accounts_needing_auth_deletion() IS 
'Returns list of accounts that need manual deletion from auth.users table. These accounts have been cleaned of all other data but still exist in auth.users.';

COMMENT ON FUNCTION mark_accounts_for_manual_deletion() IS 
'Marks expired accounts as processed and returns count of accounts cleaned. Use this function in cron jobs to automatically clean up expired accounts.';
