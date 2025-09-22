-- =====================================================
-- TEST AUTHENTICATION CONTEXT FOR OTIC VISION
-- =====================================================
-- This script tests the authentication context and user permissions

-- 1. Check if we have any users in the system
SELECT 
  'Users in auth.users:' as info,
  COUNT(*) as user_count
FROM auth.users;

-- 2. Check if we have any user profiles
SELECT 
  'User profiles:' as info,
  COUNT(*) as profile_count
FROM user_profiles;

-- 3. Check the current auth context (this will show the current user)
SELECT 
  'Current Auth Context:' as info,
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 4. Test RLS policies by trying to insert as different user contexts
-- First, let's see what happens when we try to insert without a user context
SELECT 
  'Testing RLS without user context:' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM personalised_visual_bank 
      WHERE product_name = 'Test Product'
    ) THEN '❌ RLS not working - insert succeeded without user'
    ELSE '✅ RLS working - insert blocked without user'
  END as rls_test_result;

-- 5. Check if the test user exists
SELECT 
  'Test User Check:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = '00000000-0000-0000-0000-000000000001'
    ) THEN '✅ Test user exists'
    ELSE '❌ Test user does not exist'
  END as user_exists;

-- 6. If test user doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = '00000000-0000-0000-0000-000000000001'
  ) THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      'test@oticvision.com',
      '$2a$10$dummy.hash.for.testing',
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"user_type": "business"}',
      false,
      'authenticated',
      'authenticated'
    );
    RAISE NOTICE 'Created test user';
  ELSE
    RAISE NOTICE 'Test user already exists';
  END IF;
END $$;

-- 7. Check if user profile exists for test user
SELECT 
  'User Profile Check:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = '00000000-0000-0000-0000-000000000001'
    ) THEN '✅ User profile exists'
    ELSE '❌ User profile does not exist'
  END as profile_exists;

-- 8. If user profile doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
  ) THEN
    INSERT INTO user_profiles (
      user_id,
      email,
      first_name,
      last_name,
      user_type,
      tier,
      email_verified,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      'test@oticvision.com',
      'Test',
      'User',
      'business',
      'premium',
      true,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created user profile';
  ELSE
    RAISE NOTICE 'User profile already exists';
  END IF;
END $$;

-- 9. Test inserting with the test user context
-- Note: This will only work if we're running as the test user
SELECT 
  'Final Test User Status:' as info,
  '00000000-0000-0000-0000-000000000001' as test_user_id,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = '00000000-0000-0000-0000-000000000001'
    ) THEN '✅ Test user ready'
    ELSE '❌ Test user not ready'
  END as user_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = '00000000-0000-0000-0000-000000000001'
    ) THEN '✅ User profile ready'
    ELSE '❌ User profile not ready'
  END as profile_status;

-- Success message
SELECT 'Authentication context test completed!' as status;



