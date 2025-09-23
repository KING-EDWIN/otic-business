-- Fix return types to match actual database schema
-- Run this script in Supabase SQL editor

-- ==============================================
-- STEP 1: Drop and recreate get_user_invitations with correct types
-- ==============================================

DROP FUNCTION IF EXISTS get_user_invitations(text);

CREATE OR REPLACE FUNCTION get_user_invitations(
    p_user_email text
)
RETURNS TABLE (
    id uuid,
    business_id uuid,
    invited_by uuid,
    invited_email character varying(255),
    invited_name character varying(255),
    role character varying(50),
    status character varying(50),
    invitation_token character varying(255),
    expires_at timestamp with time zone,
    created_at timestamp with time zone,
    business_name character varying(255)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bi.id,
        bi.business_id,
        bi.invited_by,
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
    WHERE bi.invited_email = p_user_email
      AND bi.status = 'pending'
      AND bi.expires_at > NOW()
    ORDER BY bi.created_at DESC;
END;
$$;

-- ==============================================
-- STEP 2: Test the corrected function
-- ==============================================

DO $$
DECLARE
    test_email text := 'test@example.com';
    result_count integer;
BEGIN
    -- Test the function
    SELECT COUNT(*) INTO result_count FROM get_user_invitations(test_email);
    RAISE NOTICE 'get_user_invitations test completed. Found % invitations for %', result_count, test_email;
    
    RAISE NOTICE 'Function return types fixed successfully!';
END $$;

-- ==============================================
-- STEP 3: Refresh schema cache
-- ==============================================

NOTIFY pgrst, 'reload schema';

SELECT 'Return types fixed successfully' as status;




