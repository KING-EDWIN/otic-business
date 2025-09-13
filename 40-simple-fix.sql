-- Simple fix for access control issues
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS on core tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations DISABLE ROW LEVEL SECURITY;

-- 2. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 3. Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'Simple fix applied' as status;
