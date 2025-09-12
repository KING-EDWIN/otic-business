-- Create business invitations table for managing invitations to individual users
-- This table will store invitations sent to individual users to join businesses

-- Create business_invitations table
CREATE TABLE IF NOT EXISTS business_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee', 'viewer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    invitation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_invitations_business_id ON business_invitations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_invited_email ON business_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);
CREATE INDEX IF NOT EXISTS idx_business_invitations_token ON business_invitations(invitation_token);

-- Enable RLS
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view invitations for their businesses" ON business_invitations;
    DROP POLICY IF EXISTS "Users can create invitations for their businesses" ON business_invitations;
    DROP POLICY IF EXISTS "Users can update invitations they created" ON business_invitations;
    DROP POLICY IF EXISTS "Users can delete invitations they created" ON business_invitations;
    DROP POLICY IF EXISTS "Invited users can view their invitations" ON business_invitations;
    DROP POLICY IF EXISTS "Invited users can accept/decline their invitations" ON business_invitations;
    
    -- Create new policies
    CREATE POLICY "Users can view invitations for their businesses" ON business_invitations
        FOR SELECT USING (
            business_id IN (
                SELECT bm.business_id 
                FROM business_memberships bm 
                WHERE bm.user_id = auth.uid()
            )
        );
    
    CREATE POLICY "Users can create invitations for their businesses" ON business_invitations
        FOR INSERT WITH CHECK (
            business_id IN (
                SELECT bm.business_id 
                FROM business_memberships bm 
                WHERE bm.user_id = auth.uid() 
                AND bm.role IN ('owner', 'admin')
            )
        );
    
    CREATE POLICY "Users can update invitations they created" ON business_invitations
        FOR UPDATE USING (
            invited_by = auth.uid() OR
            business_id IN (
                SELECT bm.business_id 
                FROM business_memberships bm 
                WHERE bm.user_id = auth.uid() 
                AND bm.role IN ('owner', 'admin')
            )
        );
    
    CREATE POLICY "Users can delete invitations they created" ON business_invitations
        FOR DELETE USING (
            invited_by = auth.uid() OR
            business_id IN (
                SELECT bm.business_id 
                FROM business_memberships bm 
                WHERE bm.user_id = auth.uid() 
                AND bm.role IN ('owner', 'admin')
            )
        );
    
    CREATE POLICY "Invited users can view their invitations" ON business_invitations
        FOR SELECT USING (
            invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        );
    
    CREATE POLICY "Invited users can accept/decline their invitations" ON business_invitations
        FOR UPDATE USING (
            invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        );
END $$;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_business_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_business_invitations_updated_at ON business_invitations;
CREATE TRIGGER trigger_update_business_invitations_updated_at
    BEFORE UPDATE ON business_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_business_invitations_updated_at();

-- Create function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE business_invitations 
    SET status = 'expired' 
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to get business invitations
CREATE OR REPLACE FUNCTION get_business_invitations(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    invited_email TEXT,
    invited_by_email TEXT,
    role TEXT,
    status TEXT,
    invitation_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bi.id,
        bi.invited_email,
        au.email as invited_by_email,
        bi.role,
        bi.status,
        bi.invitation_token,
        bi.expires_at,
        bi.accepted_at,
        bi.declined_at,
        bi.created_at
    FROM business_invitations bi
    JOIN auth.users au ON bi.invited_by = au.id
    WHERE bi.business_id = business_id_param
    ORDER BY bi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create business invitation
CREATE OR REPLACE FUNCTION create_business_invitation(
    business_id_param UUID,
    invited_email_param TEXT,
    role_param TEXT DEFAULT 'employee'
)
RETURNS TABLE (
    success BOOLEAN,
    invitation_id UUID,
    error_message TEXT
) AS $$
DECLARE
    invitation_id UUID;
    user_id UUID;
BEGIN
    -- Get current user ID
    user_id := auth.uid();
    
    -- Check if user has permission to invite (owner or admin)
    IF NOT EXISTS (
        SELECT 1 FROM business_memberships bm 
        WHERE bm.business_id = business_id_param 
        AND bm.user_id = user_id 
        AND bm.role IN ('owner', 'admin')
    ) THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Insufficient permissions'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM business_memberships bm 
        JOIN auth.users au ON bm.user_id = au.id
        WHERE bm.business_id = business_id_param 
        AND au.email = invited_email_param
    ) THEN
        RETURN QUERY SELECT false, NULL::UUID, 'User is already a member'::TEXT;
        RETURN;
    END IF;
    
    -- Check if there's already a pending invitation
    IF EXISTS (
        SELECT 1 FROM business_invitations 
        WHERE business_id = business_id_param 
        AND invited_email = invited_email_param 
        AND status = 'pending'
    ) THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Invitation already exists'::TEXT;
        RETURN;
    END IF;
    
    -- Create invitation
    INSERT INTO business_invitations (business_id, invited_email, invited_by, role)
    VALUES (business_id_param, invited_email_param, user_id, role_param)
    RETURNING id INTO invitation_id;
    
    RETURN QUERY SELECT true, invitation_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
