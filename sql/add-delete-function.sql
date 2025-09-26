-- Add delete_user_completely function to database
-- This function permanently deletes a user and all related data

CREATE OR REPLACE FUNCTION delete_user_completely(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id_var UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Get user ID
    SELECT id INTO user_id_var FROM user_profiles WHERE email = user_email;
    
    IF user_id_var IS NULL THEN
        RETURN 'User not found: ' || user_email;
    END IF;
    
    -- Delete from all related tables (in order to respect foreign key constraints)
    -- Start with dependent tables first
    
    -- Delete analytics and tracking data
    DELETE FROM analytics_data WHERE user_id = user_id_var;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete business-related data
    DELETE FROM business_memberships WHERE user_id = user_id_var;
    DELETE FROM business_switches WHERE user_id = user_id_var;
    DELETE FROM businesses WHERE created_by = user_id_var;
    
    -- Delete payment and transaction data
    DELETE FROM payment_history WHERE user_id = user_id_var;
    DELETE FROM payment_requests WHERE user_id = user_id_var;
    DELETE FROM payment_transactions WHERE user_id = user_id_var;
    DELETE FROM subscriptions WHERE user_id = user_id_var;
    DELETE FROM payments WHERE user_id = user_id_var;
    
    -- Delete inventory and product data
    DELETE FROM products WHERE user_id = user_id_var;
    DELETE FROM inventory WHERE business_id IN (SELECT id FROM businesses WHERE created_by = user_id_var);
    DELETE FROM stock_movements WHERE business_id IN (SELECT id FROM businesses WHERE created_by = user_id_var);
    
    -- Delete sales data
    DELETE FROM sales WHERE user_id = user_id_var;
    DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE user_id = user_id_var);
    
    -- Delete customer data
    DELETE FROM customers WHERE user_id = user_id_var;
    DELETE FROM customer_communications WHERE user_id = user_id_var;
    
    -- Delete invoice data
    DELETE FROM invoices WHERE user_id = user_id_var;
    DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = user_id_var);
    
    -- Delete notification data
    DELETE FROM notifications WHERE user_id = user_id_var;
    DELETE FROM notification_preferences WHERE user_id = user_id_var;
    
    -- Delete contact messages
    DELETE FROM contact_messages WHERE user_id = user_id_var;
    
    -- Delete FAQ data
    DELETE FROM faq_items WHERE created_by = user_id_var;
    
    -- Delete visual scan data
    DELETE FROM vft_products WHERE user_id = user_id_var;
    DELETE FROM visual_scan_history WHERE user_id = user_id_var;
    DELETE FROM detected_objects WHERE user_id = user_id_var;
    DELETE FROM detection_sessions WHERE user_id = user_id_var;
    DELETE FROM object_matches WHERE detected_object_id IN (SELECT id FROM detected_objects WHERE user_id = user_id_var);
    
    -- Delete individual signup data
    DELETE FROM individual_signups WHERE user_id = user_id_var;
    
    -- Delete business signup data
    DELETE FROM business_signups WHERE user_id = user_id_var;
    
    -- Delete tier-related data
    DELETE FROM tier_usage_tracking WHERE user_id = user_id_var;
    DELETE FROM tier_subscriptions WHERE user_id = user_id_var;
    
    -- Delete system logs
    DELETE FROM system_error_logs WHERE user_id = user_id_var;
    DELETE FROM system_troubleshoot_logs WHERE user_id = user_id_var;
    
    -- Handle foreign key constraint: Set individual_profession_id to NULL first
    UPDATE user_profiles SET individual_profession_id = NULL WHERE id = user_id_var;
    
    -- Finally, delete the user profile
    DELETE FROM user_profiles WHERE id = user_id_var;
    
    -- Delete from auth.users (Supabase auth table)
    DELETE FROM auth.users WHERE id = user_id_var;
    
    RETURN 'User completely deleted: ' || user_email || ' (ID: ' || user_id_var || ')';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_user_completely(TEXT) TO anon, authenticated;
