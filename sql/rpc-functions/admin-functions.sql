-- Admin Functions for OTIC Business
-- These functions provide developer-focused admin capabilities
-- Run this script to create essential admin functions

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS is_admin(TEXT);
DROP FUNCTION IF EXISTS search_user_by_email(TEXT);
DROP FUNCTION IF EXISTS get_user_details(TEXT);
DROP FUNCTION IF EXISTS delete_user_completely(TEXT);

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_users au
        JOIN user_profiles up ON au.user_id = up.id
        WHERE up.email = user_email
    );
END;
$$;

-- Function to search users by email (for admin portal)
CREATE OR REPLACE FUNCTION search_user_by_email(search_email TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    user_type CHARACTER VARYING(20),
    tier CHARACTER VARYING(20),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email::TEXT,
        up.full_name::TEXT,
        up.business_name::TEXT,
        up.user_type,
        up.tier,
        up.created_at
    FROM user_profiles up
    WHERE up.email ILIKE '%' || search_email || '%'
    ORDER BY up.created_at DESC
    LIMIT 50;
END;
$$;

-- Function to get detailed user information
CREATE OR REPLACE FUNCTION get_user_details(user_email TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    user_type CHARACTER VARYING(20),
    tier CHARACTER VARYING(20),
    phone TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN,
    verification_timestamp TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email::TEXT,
        up.full_name::TEXT,
        up.business_name::TEXT,
        up.user_type,
        up.tier,
        up.phone::TEXT,
        up.country::TEXT,
        up.created_at,
        up.email_verified,
        up.verification_timestamp
    FROM user_profiles up
    WHERE up.email = user_email
    LIMIT 1;
END;
$$;

-- Function to completely delete a user and all related data
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
    
    -- Delete expense data
    DELETE FROM expenses WHERE user_id = user_id_var;
    DELETE FROM expense_categories WHERE user_id = user_id_var;
    
    -- Delete chart of accounts
    DELETE FROM chart_of_accounts WHERE user_id = user_id_var;
    DELETE FROM transactions WHERE user_id = user_id_var;
    
    -- Delete bank accounts
    DELETE FROM bank_accounts WHERE user_id = user_id_var;
    
    -- Delete categories
    DELETE FROM categories WHERE user_id = user_id_var;
    
    -- Delete suppliers
    DELETE FROM suppliers WHERE user_id = user_id_var;
    
    -- Delete reports
    DELETE FROM reports WHERE user_id = user_id_var;
    DELETE FROM report_views WHERE report_id IN (SELECT id FROM reports WHERE user_id = user_id_var);
    DELETE FROM report_schedules WHERE user_id = user_id_var;
    
    -- Delete notifications
    DELETE FROM notifications WHERE user_id = user_id_var;
    DELETE FROM notification_preferences WHERE user_id = user_id_var;
    DELETE FROM notification_settings WHERE user_id = user_id_var;
    DELETE FROM email_notifications WHERE user_id = user_id_var;
    
    -- Delete OTIC Vision data
    DELETE FROM personalised_visual_bank WHERE user_id = user_id_var;
    DELETE FROM visual_filter_tags WHERE user_id = user_id_var;
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
    
    -- Finally, delete the user profile
    DELETE FROM user_profiles WHERE id = user_id_var;
    
    -- Delete from auth.users (Supabase auth table)
    DELETE FROM auth.users WHERE id = user_id_var;
    
    RETURN 'User completely deleted: ' || user_email || ' (ID: ' || user_id_var || ')';
END;
$$;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION is_admin(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_user_by_email(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_details(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_user_completely(TEXT) TO anon, authenticated;

-- Create a simple user search function for admin portal
CREATE OR REPLACE FUNCTION simple_user_search(search_term TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    user_type CHARACTER VARYING(20),
    tier CHARACTER VARYING(20),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email::TEXT,
        up.full_name::TEXT,
        up.business_name::TEXT,
        up.user_type,
        up.tier,
        up.created_at
    FROM user_profiles up
    WHERE up.email ILIKE '%' || search_term || '%'
       OR up.full_name ILIKE '%' || search_term || '%'
       OR up.business_name ILIKE '%' || search_term || '%'
    ORDER BY up.created_at DESC
    LIMIT 100;
END;
$$;

GRANT EXECUTE ON FUNCTION simple_user_search(TEXT) TO anon, authenticated;

-- Success message
SELECT 'Admin functions created successfully!' as status;
