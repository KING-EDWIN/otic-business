-- Create invitation system for business invitations
-- Run this in your Supabase SQL Editor

-- Create business_invitations table
CREATE TABLE IF NOT EXISTS business_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined, expired
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_invitations_email ON business_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_business_invitations_business_id ON business_invitations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);

-- Enable RLS
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_invitations
CREATE POLICY "Users can view invitations sent to their email" ON business_invitations
  FOR SELECT USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Business members can view invitations for their business" ON business_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_memberships bm 
      WHERE bm.business_id = business_invitations.business_id 
      AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "Business admins can create invitations" ON business_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_memberships bm 
      WHERE bm.business_id = business_invitations.business_id 
      AND bm.user_id = auth.uid() 
      AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Business admins can update invitations" ON business_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_memberships bm 
      WHERE bm.business_id = business_invitations.business_id 
      AND bm.user_id = auth.uid() 
      AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Invited users can update their own invitations" ON business_invitations
  FOR UPDATE USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create RPC function to get invitations for a user
CREATE OR REPLACE FUNCTION get_user_invitations(user_email_param TEXT)
RETURNS TABLE (
  id UUID,
  business_id UUID,
  business_name VARCHAR,
  invited_email VARCHAR,
  invited_by_name VARCHAR,
  role VARCHAR,
  status VARCHAR,
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
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
  JOIN businesses b ON b.id = bi.business_id
  JOIN user_profiles up ON up.id = bi.invited_by
  WHERE bi.invited_email = user_email_param
  AND bi.status = 'pending'
  AND bi.expires_at > NOW()
  ORDER BY bi.created_at DESC;
$$;

-- Create RPC function to respond to invitation
CREATE OR REPLACE FUNCTION respond_to_invitation(
  invitation_id_param UUID,
  response_param VARCHAR, -- 'accepted' or 'declined'
  user_id_param UUID
)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH updated_invitation AS (
    UPDATE business_invitations 
    SET 
      status = response_param,
      updated_at = NOW()
    WHERE id = invitation_id_param
    AND invited_email = (SELECT email FROM auth.users WHERE id = user_id_param)
    AND status = 'pending'
    RETURNING *
  ),
  business_member_insert AS (
    INSERT INTO business_memberships (business_id, user_id, role, joined_at)
    SELECT 
      bi.business_id, 
      user_id_param, 
      bi.role, 
      NOW()
    FROM updated_invitation bi
    WHERE response_param = 'accepted'
    ON CONFLICT (business_id, user_id) DO NOTHING
    RETURNING *
  )
  SELECT json_build_object(
    'success', true,
    'invitation_updated', (SELECT COUNT(*) FROM updated_invitation) > 0,
    'member_added', (SELECT COUNT(*) FROM business_member_insert) > 0
  );
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON business_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_invitations(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_invitation(UUID, VARCHAR, UUID) TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Invitation system created successfully' as status;
