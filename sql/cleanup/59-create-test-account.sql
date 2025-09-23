-- Create a test account with all credentials
-- This creates a complete user account for testing

-- 1. Create a test user in auth.users (this would normally be done through Supabase Auth)
-- Note: In production, this would be done through the signup flow
-- For testing, we'll create the user profile directly

-- Insert test user profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  tier,
  user_type,
  email_verified,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'test@example.com',
  'Test User',
  'free_trial',
  'business',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  tier = EXCLUDED.tier,
  user_type = EXCLUDED.user_type,
  email_verified = EXCLUDED.email_verified,
  updated_at = NOW();

-- 2. Create a test business for this user
INSERT INTO businesses (
  id,
  name,
  description,
  business_type,
  industry,
  email,
  phone,
  address,
  city,
  state,
  country,
  postal_code,
  currency,
  timezone,
  status,
  settings,
  created_by,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Test Business',
  'A test business for development',
  'retail',
  'Technology',
  'test@example.com',
  '+1234567890',
  '123 Test Street',
  'Test City',
  'Test State',
  'Uganda',
  '12345',
  'UGX',
  'Africa/Kampala',
  'active',
  '{}',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 3. Create business membership for the test user
INSERT INTO business_memberships (
  id,
  user_id,
  business_id,
  role,
  status,
  joined_at,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'owner',
  'active',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 4. Create another test user for individual account testing
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  tier,
  user_type,
  email_verified,
  created_at,
  updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'individual@example.com',
  'Individual User',
  'free_trial',
  'individual',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  tier = EXCLUDED.tier,
  user_type = EXCLUDED.user_type,
  email_verified = EXCLUDED.email_verified,
  updated_at = NOW();

-- 5. Create individual business access for the individual user
INSERT INTO individual_business_access (
  id,
  user_id,
  business_id,
  access_level,
  granted_by,
  granted_at,
  created_at,
  updated_at
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'read_write',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  access_level = EXCLUDED.access_level,
  updated_at = NOW();

-- 6. Test the setup
DO $$
DECLARE
    business_count INTEGER;
    user_count INTEGER;
    membership_count INTEGER;
BEGIN
    -- Count businesses for test user
    SELECT COUNT(*) INTO business_count 
    FROM get_user_businesses('11111111-1111-1111-1111-111111111111');
    
    -- Count individual businesses for individual user
    SELECT COUNT(*) INTO user_count 
    FROM get_individual_businesses('44444444-4444-4444-4444-444444444444');
    
    -- Count memberships
    SELECT COUNT(*) INTO membership_count 
    FROM business_memberships 
    WHERE user_id = '11111111-1111-1111-1111-111111111111';
    
    RAISE NOTICE 'Test setup completed:';
    RAISE NOTICE 'Businesses for test user: %', business_count;
    RAISE NOTICE 'Individual businesses for individual user: %', user_count;
    RAISE NOTICE 'Memberships for test user: %', membership_count;
END $$;

SELECT 'Test account created successfully' as status;
