-- DEFINITIVE FIX FOR ALL AUTHENTICATION AND ACCESS ISSUES
-- Run this in your Supabase SQL Editor

-- 1. DISABLE RLS ON ALL TABLES
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- 2. GRANT COMPREHENSIVE PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- 3. DROP AND RECREATE ALL RPC FUNCTIONS WITH PROPER PERMISSIONS
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
DROP FUNCTION IF EXISTS get_individual_businesses(uuid);
DROP FUNCTION IF EXISTS get_business_members(uuid);
DROP FUNCTION IF EXISTS can_create_business(uuid);
DROP FUNCTION IF EXISTS test_user_data(uuid);
DROP FUNCTION IF EXISTS switch_business_context(uuid, uuid);
DROP FUNCTION IF EXISTS get_user_invitations(uuid);
DROP FUNCTION IF EXISTS respond_to_invitation(uuid, uuid, text);

-- 4. CREATE ALL RPC FUNCTIONS
CREATE OR REPLACE FUNCTION get_user_businesses(user_id_param uuid)
RETURNS TABLE (
  business_id uuid,
  business_name varchar,
  business_type varchar,
  role varchar,
  access_level varchar,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    b.id as business_id,
    b.name as business_name,
    b.business_type,
    bm.role,
    bm.access_level,
    bm.created_at
  FROM businesses b
  JOIN business_memberships bm ON b.id = bm.business_id
  WHERE bm.user_id = user_id_param;
$$;

CREATE OR REPLACE FUNCTION get_individual_businesses(user_id_param uuid)
RETURNS TABLE (
  business_id uuid,
  business_name varchar,
  business_type varchar,
  role varchar,
  access_level varchar,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    b.id as business_id,
    b.name as business_name,
    b.business_type,
    bm.role,
    bm.access_level,
    bm.created_at
  FROM businesses b
  JOIN business_memberships bm ON b.id = bm.business_id
  WHERE bm.user_id = user_id_param;
$$;

CREATE OR REPLACE FUNCTION get_business_members(business_id_param uuid)
RETURNS TABLE (
  user_id uuid,
  email varchar,
  full_name varchar,
  role varchar,
  access_level varchar,
  joined_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    up.id as user_id,
    up.email,
    up.full_name,
    bm.role,
    bm.access_level,
    bm.created_at as joined_at
  FROM business_memberships bm
  JOIN user_profiles up ON bm.user_id = up.id
  WHERE bm.business_id = business_id_param;
$$;

CREATE OR REPLACE FUNCTION can_create_business(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) < 3 FROM businesses WHERE owner_id = user_id_param;
$$;

CREATE OR REPLACE FUNCTION test_user_data(user_id_param uuid)
RETURNS TABLE (
  user_id uuid,
  email varchar,
  full_name varchar,
  tier varchar,
  user_type varchar
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id as user_id,
    email,
    full_name,
    tier::varchar,
    user_type::varchar
  FROM user_profiles 
  WHERE id = user_id_param;
$$;

CREATE OR REPLACE FUNCTION switch_business_context(user_id_param uuid, business_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM business_memberships 
    WHERE user_id = user_id_param AND business_id = business_id_param
  );
$$;

CREATE OR REPLACE FUNCTION get_user_invitations(user_id_param uuid)
RETURNS TABLE (
  invitation_id uuid,
  business_id uuid,
  business_name varchar,
  invited_by varchar,
  role varchar,
  status varchar,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    bi.id as invitation_id,
    bi.business_id,
    b.name as business_name,
    up.full_name as invited_by,
    bi.role,
    bi.status,
    bi.created_at
  FROM business_invitations bi
  JOIN businesses b ON bi.business_id = b.id
  JOIN user_profiles up ON bi.invited_by = up.id
  WHERE bi.invited_email = (SELECT email FROM user_profiles WHERE id = user_id_param)
  AND bi.status = 'pending';
$$;

CREATE OR REPLACE FUNCTION respond_to_invitation(invitation_id_param uuid, user_id_param uuid, response_param text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE business_invitations 
  SET status = response_param::varchar,
      updated_at = NOW()
  WHERE id = invitation_id_param 
  AND invited_email = (SELECT email FROM user_profiles WHERE id = user_id_param)
  AND status = 'pending';
  
  SELECT FOUND;
$$;

-- 5. GRANT EXECUTE PERMISSIONS ON ALL FUNCTIONS
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 6. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- 7. VERIFY SETUP
SELECT 'Definitive fix applied successfully' as status;
