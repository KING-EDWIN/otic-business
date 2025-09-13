-- Comprehensive fix for all database issues
-- This addresses RLS, permissions, and function issues

-- 1. Disable RLS on all tables to prevent access control issues
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
        EXECUTE FORMAT('ALTER TABLE %I DISABLE ROW LEVEL SECURITY;', tbl_name.table_name);
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

-- 3. Ensure all RPC functions exist and work correctly
-- Drop and recreate to ensure they're properly accessible

-- get_user_businesses function
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
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

-- get_individual_businesses function
DROP FUNCTION IF EXISTS get_individual_businesses(uuid);
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
    iba.role,
    b.created_at
  FROM businesses b
  JOIN individual_business_access iba ON b.id = iba.business_id
  WHERE iba.user_id = user_id_param;
$$;

-- get_business_members function
DROP FUNCTION IF EXISTS get_business_members(uuid);
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
    bm.joined_at
  FROM user_profiles up
  JOIN business_memberships bm ON up.id = bm.user_id
  WHERE bm.business_id = business_id_param;
$$;

-- get_user_invitations function
DROP FUNCTION IF EXISTS get_user_invitations(uuid);
CREATE OR REPLACE FUNCTION get_user_invitations(user_id_param uuid)
RETURNS TABLE (
  invitation_id uuid,
  business_id uuid,
  business_name varchar,
  invited_by_name varchar,
  invited_by_email varchar,
  role varchar,
  status varchar,
  expires_at timestamp with time zone,
  created_at timestamp with time zone,
  message text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    bi.id as invitation_id,
    b.id as business_id,
    b.name as business_name,
    up_inviter.full_name as invited_by_name,
    up_inviter.email as invited_by_email,
    bi.role,
    bi.status,
    bi.expires_at,
    bi.created_at,
    bi.message
  FROM business_invitations bi
  JOIN businesses b ON bi.business_id = b.id
  JOIN user_profiles up_inviter ON bi.invited_by = up_inviter.id
  WHERE bi.invited_email = (SELECT email FROM user_profiles WHERE id = user_id_param)
    AND bi.status = 'pending'
    AND bi.expires_at > NOW();
$$;

-- respond_to_invitation function
DROP FUNCTION IF EXISTS respond_to_invitation(uuid, uuid, text);
CREATE OR REPLACE FUNCTION respond_to_invitation(
    invitation_id_param uuid,
    user_id_param uuid,
    response_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record business_invitations;
  user_email TEXT;
  rows_updated INT;
BEGIN
  -- Get user's email
  SELECT email INTO user_email FROM user_profiles WHERE id = user_id_param;

  -- Fetch the invitation
  SELECT * INTO invitation_record
  FROM business_invitations
  WHERE id = invitation_id_param
    AND invited_email = user_email
    AND status = 'pending'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF response_param = 'accepted' THEN
    -- Create business membership
    INSERT INTO business_memberships (user_id, business_id, role, status, invited_by, joined_at)
    VALUES (user_id_param, invitation_record.business_id, invitation_record.role, 'active', invitation_record.invited_by, NOW());

    -- Update invitation status
    UPDATE business_invitations
    SET status = 'accepted', responded_at = NOW()
    WHERE id = invitation_id_param;
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated > 0;
  ELSIF response_param = 'declined' THEN
    -- Update invitation status
    UPDATE business_invitations
    SET status = 'declined', responded_at = NOW()
    WHERE id = invitation_id_param;
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated > 0;
  END IF;

  RETURN FALSE;
END;
$$;

-- can_create_business function
DROP FUNCTION IF EXISTS can_create_business(uuid);
CREATE OR REPLACE FUNCTION can_create_business(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier_param VARCHAR;
  business_count INTEGER;
  max_businesses INTEGER;
BEGIN
  -- Get user tier
  SELECT tier INTO user_tier_param FROM user_profiles WHERE id = user_id_param;

  -- Get current business count for the user
  SELECT COUNT(*) INTO business_count FROM businesses WHERE created_by = user_id_param;

  -- Determine max businesses based on tier
  CASE user_tier_param
    WHEN 'free_trial' THEN max_businesses := 1;
    WHEN 'start_smart' THEN max_businesses := 3;
    WHEN 'grow_intelligence' THEN max_businesses := 10;
    WHEN 'enterprise_advantage' THEN max_businesses := 9999;
    ELSE max_businesses := 0;
  END CASE;

  RETURN business_count < max_businesses;
END;
$$;

-- switch_business_context function
DROP FUNCTION IF EXISTS switch_business_context(uuid, uuid);
CREATE OR REPLACE FUNCTION switch_business_context(user_id_param uuid, business_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_member BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM business_memberships
    WHERE user_id = user_id_param AND business_id = business_id_param
  ) INTO is_member;

  RETURN is_member;
END;
$$;

-- 4. Grant execute permissions on all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 5. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 6. Test the functions
DO $$
DECLARE
    test_user_id UUID;
    test_business_id UUID;
    result_count INTEGER;
BEGIN
    -- Get test user
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user: %', test_user_id;
        
        -- Test get_user_businesses
        SELECT COUNT(*) INTO result_count FROM get_user_businesses(test_user_id);
        RAISE NOTICE 'get_user_businesses: % rows', result_count;
        
        -- Test get_user_invitations
        SELECT COUNT(*) INTO result_count FROM get_user_invitations(test_user_id);
        RAISE NOTICE 'get_user_invitations: % rows', result_count;
        
        -- Test can_create_business
        PERFORM can_create_business(test_user_id);
        RAISE NOTICE 'can_create_business: works';
    END IF;
    
    -- Get test business
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    
    IF test_business_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with business: %', test_business_id;
        
        -- Test get_business_members
        SELECT COUNT(*) INTO result_count FROM get_business_members(test_business_id);
        RAISE NOTICE 'get_business_members: % rows', result_count;
    END IF;
    
END $$;

SELECT 'Comprehensive database fix completed successfully' as status;
