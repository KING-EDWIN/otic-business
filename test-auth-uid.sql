-- Test auth.uid() type and create a simple working table
-- This will help us understand the exact issue

-- 1. Test what auth.uid() returns
SELECT 
    auth.uid() as current_uid,
    pg_typeof(auth.uid()) as uid_type;

-- 2. Test if we can compare auth.uid() with UUID directly
SELECT 
    auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid as can_compare_with_uuid;

-- 3. Create a simple test table to see what works
CREATE TABLE IF NOT EXISTS test_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT
);

-- 4. Enable RLS on test table
ALTER TABLE test_auth ENABLE ROW LEVEL SECURITY;

-- 5. Try different RLS policy patterns to see which one works
-- Pattern 1: Direct comparison (like user_profiles)
CREATE POLICY "test_direct_comparison" ON test_auth
    FOR SELECT USING (user_id = auth.uid());

-- 6. Test if the policy works by trying to select
SELECT * FROM test_auth;
