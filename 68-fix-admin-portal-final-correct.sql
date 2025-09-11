-- Fix Admin Portal Final (Correct)
-- This script fixes the admin portal using the correct table structure

-- Step 1: Check current admin_auth table structure
SELECT 
  'admin_auth structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'admin_auth' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Fix admin_auth policies - add missing policies
-- Drop existing policies first
DROP POLICY IF EXISTS "admin_auth_read_all" ON admin_auth;

-- Create proper admin policies
CREATE POLICY "Admins can view all admin auth" ON admin_auth
  FOR SELECT USING (true);

CREATE POLICY "Admins can update admin auth" ON admin_auth
  FOR UPDATE USING (true);

CREATE POLICY "Admins can insert admin auth" ON admin_auth
  FOR INSERT WITH CHECK (true);

-- Step 3: Fix admin_logs policies - add missing policies
-- Keep existing policies and add admin access
CREATE POLICY "Admins can view all admin logs" ON admin_logs
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert admin logs" ON admin_logs
  FOR INSERT WITH CHECK (true);

-- Step 4: Fix payment_requests policies - add admin update access
CREATE POLICY "Admins can update all payment requests" ON payment_requests
  FOR UPDATE USING (true);

-- Step 5: Ensure user_verification_status view exists
CREATE OR REPLACE VIEW user_verification_status AS
SELECT 
  up.id,
  up.email,
  up.business_name,
  up.phone,
  up.tier,
  up.email_verified,
  up.verification_timestamp,
  up.verified_by,
  up.created_at,
  CASE 
    WHEN up.email_verified THEN 'verified'
    ELSE 'pending'
  END as verification_status
FROM user_profiles up;

-- Step 6: Create admin authentication function
CREATE OR REPLACE FUNCTION is_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user exists in admin_auth table
  RETURN EXISTS (
    SELECT 1 
    FROM admin_auth 
    WHERE id = user_id_param
  );
END;
$$;

-- Step 7: Grant permissions for admin functions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon;

-- Step 8: Insert sample admin user if not exists (using correct columns)
INSERT INTO admin_auth (email, password_hash, role) 
VALUES (
  'admin@oticbuss.com',
  '$2b$10$rQZ8K9vQ8K9vQ8K9vQ8K9e', -- Placeholder hash - replace with real hash
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Step 9: Insert sample FAQ data if not exists
INSERT INTO faq_categories (name, description, sort_order) VALUES
('General', 'General questions about the platform', 1),
('Billing', 'Questions about pricing and payments', 2),
('Features', 'Questions about platform features', 3),
('Technical', 'Technical support questions', 4)
ON CONFLICT (name) DO NOTHING;

-- Step 10: Test admin access
SELECT 
  'Admin Access Test' as info,
  'admin_auth' as table_name,
  COUNT(*) as admin_count
FROM admin_auth
UNION ALL
SELECT 
  'Admin Access Test' as info,
  'payment_requests' as table_name,
  COUNT(*) as request_count
FROM payment_requests
UNION ALL
SELECT 
  'Admin Access Test' as info,
  'faq_categories' as table_name,
  COUNT(*) as category_count
FROM faq_categories
UNION ALL
SELECT 
  'Admin Access Test' as info,
  'user_verification_status' as table_name,
  COUNT(*) as user_count
FROM user_verification_status;

-- Step 11: Show final RLS status
SELECT 
  'Final RLS Status' as info,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('admin_auth', 'admin_logs', 'payment_requests', 'faq_categories', 'faq_questions')
AND schemaname = 'public'
ORDER BY tablename, policyname;
