-- Temporarily disable RLS on user_profiles for admin access
-- This allows the admin portal to access user data without authentication

-- Disable RLS on user_profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Grant full access to user_profiles for admin operations
GRANT ALL ON user_profiles TO anon, authenticated, service_role;

-- Also grant access to related tables
GRANT ALL ON businesses TO anon, authenticated, service_role;
GRANT ALL ON business_memberships TO anon, authenticated, service_role;
GRANT ALL ON payment_transactions TO anon, authenticated, service_role;
GRANT ALL ON payment_requests TO anon, authenticated, service_role;
GRANT ALL ON individual_profiles TO anon, authenticated, service_role;
GRANT ALL ON individual_professions TO anon, authenticated, service_role;
GRANT ALL ON individual_business_access TO anon, authenticated, service_role;
GRANT ALL ON individual_signups TO anon, authenticated, service_role;
GRANT ALL ON business_signups TO anon, authenticated, service_role;
GRANT ALL ON user_subscriptions TO anon, authenticated, service_role;
GRANT ALL ON tier_subscriptions TO anon, authenticated, service_role;
GRANT ALL ON tier_usage_tracking TO anon, authenticated, service_role;
GRANT ALL ON notifications TO anon, authenticated, service_role;
GRANT ALL ON notification_preferences TO anon, authenticated, service_role;
GRANT ALL ON notification_settings TO anon, authenticated, service_role;
GRANT ALL ON email_notifications TO anon, authenticated, service_role;
GRANT ALL ON user_verification_status TO anon, authenticated, service_role;
GRANT ALL ON unverified_users TO anon, authenticated, service_role;
GRANT ALL ON two_factor_codes TO anon, authenticated, service_role;
GRANT ALL ON test_auth TO anon, authenticated, service_role;
GRANT ALL ON system_error_logs TO anon, authenticated, service_role;
GRANT ALL ON system_troubleshoot_logs TO anon, authenticated, service_role;

SELECT 'RLS disabled and permissions granted for admin access!' as status;
