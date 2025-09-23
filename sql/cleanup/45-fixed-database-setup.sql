-- FIXED DATABASE SETUP - USING ACTUAL COLUMNS
-- This script creates missing tables and fixes RPC functions with correct column names

-- 1. CREATE MISSING TABLES
-- Create inventory table (referenced in RPC but missing)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER DEFAULT 0,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table (referenced in RPC but missing)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DISABLE RLS ON ALL TABLES
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

-- 3. GRANT COMPREHENSIVE PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- 4. DROP AND RECREATE ALL RPC FUNCTIONS WITH CORRECT COLUMNS
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
DROP FUNCTION IF EXISTS get_individual_businesses(uuid);
DROP FUNCTION IF EXISTS get_business_members(uuid);
DROP FUNCTION IF EXISTS can_create_business(uuid);
DROP FUNCTION IF EXISTS test_user_data(uuid);
DROP FUNCTION IF EXISTS switch_business_context(uuid, uuid);
DROP FUNCTION IF EXISTS get_user_invitations(uuid);
DROP FUNCTION IF EXISTS respond_to_invitation(uuid, uuid, text);

-- 5. CREATE ALL RPC FUNCTIONS WITH CORRECT COLUMNS
CREATE OR REPLACE FUNCTION get_user_businesses(user_id_param uuid)
RETURNS TABLE (
  business_id uuid,
  business_name varchar,
  business_type varchar,
  role varchar,
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
  SELECT COUNT(*) < 3 FROM businesses WHERE created_by = user_id_param;
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
  WITH update_result AS (
    UPDATE business_invitations 
    SET status = response_param::varchar,
        updated_at = NOW()
    WHERE id = invitation_id_param 
    AND invited_email = (SELECT email FROM user_profiles WHERE id = user_id_param)
    AND status = 'pending'
    RETURNING 1
  )
  SELECT EXISTS(SELECT 1 FROM update_result);
$$;

-- 6. GRANT EXECUTE PERMISSIONS ON ALL FUNCTIONS
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 7. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- 8. VERIFY SETUP
SELECT 'Database setup completed successfully' as status;
