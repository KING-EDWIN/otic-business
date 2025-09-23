-- FIX INVITATION SYSTEM - CORRECTED VERSION
-- Run this script in Supabase SQL editor

-- 1. Drop existing functions
DROP FUNCTION IF EXISTS get_user_invitations(text);
DROP FUNCTION IF EXISTS respond_to_invitation(uuid, text, uuid);
DROP FUNCTION IF EXISTS respond_to_invitation(uuid, uuid, text);

-- 2. Create get_user_invitations function with correct types
-- Based on the error, column 4 (invited_email) is character varying(255), not text
CREATE OR REPLACE FUNCTION get_user_invitations(
    user_email_param text
)
RETURNS TABLE (
    id uuid,
    business_id uuid,
    business_name character varying(255),
    invited_email character varying(255),
    invited_by_name character varying(255),
    role character varying(50),
    status character varying(20),
    message text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bi.id,
        bi.business_id,
        b.name as business_name,
        bi.invited_email,
        up.full_name as invited_by_name,
        bi.role,
        bi.status,
        bi.message,
        bi.expires_at,
        bi.created_at
    FROM business_invitations bi
    JOIN businesses b ON bi.business_id = b.id
    JOIN user_profiles up ON bi.invited_by = up.id
    WHERE bi.invited_email = user_email_param
    AND bi.status = 'pending'
    AND bi.expires_at > NOW()
    ORDER BY bi.created_at DESC;
END;
$$;

-- 3. Create respond_to_invitation function
CREATE OR REPLACE FUNCTION respond_to_invitation(
    invitation_id_param uuid,
    response_param text,
    user_id_param uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record business_invitations%ROWTYPE;
    business_membership_id uuid;
    result json;
BEGIN
    -- Get the invitation
    SELECT * INTO invitation_record
    FROM business_invitations
    WHERE id = invitation_id_param
    AND status = 'pending'
    AND expires_at > NOW();
    
    -- Check if invitation exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invitation not found or expired'
        );
    END IF;
    
    -- Update invitation status
    UPDATE business_invitations
    SET status = response_param,
        updated_at = NOW()
    WHERE id = invitation_id_param;
    
    -- If accepted, create business membership
    IF response_param = 'accepted' THEN
        -- Check if user already has membership
        IF NOT EXISTS (
            SELECT 1 FROM business_memberships
            WHERE user_id = user_id_param
            AND business_id = invitation_record.business_id
        ) THEN
            -- Create business membership
            INSERT INTO business_memberships (
                user_id,
                business_id,
                role,
                status,
                joined_at
            ) VALUES (
                user_id_param,
                invitation_record.business_id,
                invitation_record.role,
                'active',
                NOW()
            );
            
            -- Get the membership ID
            SELECT id INTO business_membership_id
            FROM business_memberships
            WHERE user_id = user_id_param
            AND business_id = invitation_record.business_id;
        END IF;
        
        result := json_build_object(
            'success', true,
            'invitation_updated', true,
            'member_added', true,
            'business_membership_id', business_membership_id
        );
    ELSE
        result := json_build_object(
            'success', true,
            'invitation_updated', true,
            'member_added', false
        );
    END IF;
    
    RETURN result;
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION get_user_invitations(text) TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_invitation(uuid, text, uuid) TO authenticated;

-- 5. Test the functions
SELECT 'Invitation system corrected successfully!' as status;

-- 6. Test with existing invitation
SELECT * FROM get_user_invitations('dylanindividual@gmail.com');
