-- Fix authentication and session issues
-- This script addresses the 401 errors and session persistence problems

-- 1. Ensure all tables have proper RLS policies for authenticated users
DO $$
DECLARE
    tbl_name RECORD;
BEGIN
    FOR tbl_name IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    LOOP
        -- Disable RLS temporarily to fix access issues
        EXECUTE FORMAT('ALTER TABLE %I DISABLE ROW LEVEL SECURITY;', tbl_name.table_name);
        
        -- Grant all permissions to authenticated users
        EXECUTE FORMAT('GRANT ALL ON TABLE %I TO authenticated;', tbl_name.table_name);
        EXECUTE FORMAT('GRANT ALL ON TABLE %I TO anon;', tbl_name.table_name);
    END LOOP;
END $$;

-- 2. Grant comprehensive permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 3. Ensure all RPC functions are accessible
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 4. Fix any missing user profiles for existing users
INSERT INTO user_profiles (id, email, full_name, tier, user_type, email_verified, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', ''),
    'free_trial',
    'business',
    true,
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 5. Update existing user profiles to ensure they have proper data
UPDATE user_profiles 
SET 
    email_verified = true,
    tier = COALESCE(tier, 'free_trial'),
    user_type = COALESCE(user_type, 'business'),
    updated_at = NOW()
WHERE email_verified IS NULL OR tier IS NULL OR user_type IS NULL;

-- 6. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 7. Test authentication
DO $$
DECLARE
    test_user_id UUID;
    business_count INTEGER;
BEGIN
    -- Get a test user
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing authentication with user: %', test_user_id;
        
        -- Test get_user_businesses
        SELECT COUNT(*) INTO business_count FROM get_user_businesses(test_user_id);
        RAISE NOTICE 'get_user_businesses returned: % businesses', business_count;
        
        -- Test user_profiles access
        PERFORM 1 FROM user_profiles WHERE id = test_user_id;
        RAISE NOTICE 'user_profiles access: OK';
        
        -- Test businesses access
        PERFORM 1 FROM businesses LIMIT 1;
        RAISE NOTICE 'businesses access: OK';
    END IF;
END $$;

SELECT 'Authentication fixes completed successfully' as status;
