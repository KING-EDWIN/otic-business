-- Check invitation system and data
-- Run this script in Supabase SQL editor

-- ==============================================
-- STEP 1: Check invitation table structure
-- ==============================================

SELECT 'Checking business_invitations table structure...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'business_invitations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==============================================
-- STEP 2: Check existing invitations
-- ==============================================

SELECT 'Checking existing invitations...' as status;

SELECT 
    id,
    business_id,
    invited_email,
    invited_name,
    role,
    status,
    invitation_token,
    expires_at,
    created_at
FROM business_invitations 
ORDER BY created_at DESC
LIMIT 10;

-- ==============================================
-- STEP 3: Check for invitations for specific user
-- ==============================================

SELECT 'Checking invitations for user 3488046f-56cf-4711-9045-7e6e158a1c91...' as status;

-- First get the user's email
SELECT 
    id,
    email,
    full_name,
    user_type
FROM user_profiles 
WHERE id = '3488046f-56cf-4711-9045-7e6e158a1c91';

-- Then check for invitations with that email
SELECT 
    bi.id,
    bi.business_id,
    bi.invited_email,
    bi.invited_name,
    bi.role,
    bi.status,
    bi.invitation_token,
    bi.expires_at,
    bi.created_at,
    b.name as business_name
FROM business_invitations bi
LEFT JOIN businesses b ON bi.business_id = b.id
WHERE bi.invited_email = (
    SELECT email FROM user_profiles WHERE id = '3488046f-56cf-4711-9045-7e6e158a1c91'
)
ORDER BY bi.created_at DESC;

-- ==============================================
-- STEP 4: Test get_user_invitations function
-- ==============================================

SELECT 'Testing get_user_invitations function...' as status;

SELECT * FROM get_user_invitations(
    (SELECT email FROM user_profiles WHERE id = '3488046f-56cf-4711-9045-7e6e158a1c91')
);

-- ==============================================
-- STEP 5: Check business memberships
-- ==============================================

SELECT 'Checking business memberships...' as status;

SELECT 
    bm.id,
    bm.user_id,
    bm.business_id,
    bm.role,
    bm.status,
    bm.joined_at,
    b.name as business_name
FROM business_memberships bm
LEFT JOIN businesses b ON bm.business_id = b.id
WHERE bm.user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
ORDER BY bm.joined_at DESC;

-- ==============================================
-- STEP 6: Test get_user_businesses function
-- ==============================================

SELECT 'Testing get_user_businesses function...' as status;

SELECT * FROM get_user_businesses('3488046f-56cf-4711-9045-7e6e158a1c91');

-- ==============================================
-- STEP 7: Check if there are any recent invitations created
-- ==============================================

SELECT 'Checking recent invitations (last 24 hours)...' as status;

SELECT 
    id,
    business_id,
    invited_email,
    invited_name,
    role,
    status,
    created_at
FROM business_invitations 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

SELECT 'Invitation system check completed!' as status;
