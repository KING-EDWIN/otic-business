-- FIX INVITATION SYSTEM
-- Run this script in Supabase SQL editor

-- 1. Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_invitations(text);
DROP FUNCTION IF EXISTS respond_to_invitation(uuid, text, uuid);
DROP FUNCTION IF EXISTS respond_to_invitation(uuid, uuid, text);

-- 2. Create get_user_invitations function
CREATE OR REPLACE FUNCTION get_user_invitations(
    user_email_param text
)
RETURNS TABLE (
    id uuid,
    business_id uuid,
    business_name text,
    invited_email text,
    invited_by_name text,
    role text,
    status text,
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

-- 5. Create business_invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_invitations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_email text NOT NULL,
    role text NOT NULL DEFAULT 'member',
    status text NOT NULL DEFAULT 'pending',
    message text,
    expires_at timestamp with time zone DEFAULT (NOW() + INTERVAL '7 days'),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 5a. Alter existing columns to text type if they exist
DO $$
BEGIN
    -- Alter role column if it exists and is not text
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'business_invitations' 
               AND column_name = 'role' 
               AND data_type != 'text') THEN
        ALTER TABLE business_invitations ALTER COLUMN role TYPE text;
    END IF;
    
    -- Alter status column if it exists and is not text
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'business_invitations' 
               AND column_name = 'status' 
               AND data_type != 'text') THEN
        ALTER TABLE business_invitations ALTER COLUMN status TYPE text;
    END IF;
END $$;

-- 6. Enable RLS on business_invitations
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for business_invitations
CREATE POLICY "Users can view invitations sent to their email" ON business_invitations
    FOR SELECT USING (invited_email = auth.jwt() ->> 'email');

CREATE POLICY "Business owners can manage invitations" ON business_invitations
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM business_memberships
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_invitations_email ON business_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_business_invitations_business_id ON business_invitations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);

-- 9. Test the functions
SELECT 'Invitation system fixed successfully!' as status;

-- 10. Test with existing invitation
SELECT * FROM get_user_invitations('dylanindividual@gmail.com');
