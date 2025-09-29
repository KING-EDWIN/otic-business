-- Create tables for individual business access functionality

-- Table for tracking individual user access to businesses
CREATE TABLE IF NOT EXISTS business_individual_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'limited' CHECK (access_level IN ('limited', 'standard', 'full')),
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- Table for business invitations to individual users
CREATE TABLE IF NOT EXISTS business_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, invited_user_id)
);

-- Enable RLS
ALTER TABLE business_individual_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_individual_access
CREATE POLICY "Users can view their own business access" ON business_individual_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Business owners can manage access to their business" ON business_individual_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_individual_access.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for business_invitations
CREATE POLICY "Users can view invitations sent to them" ON business_invitations
  FOR SELECT USING (auth.uid() = invited_user_id);

CREATE POLICY "Business owners can manage invitations for their business" ON business_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_invitations.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invitation status" ON business_invitations
  FOR UPDATE USING (auth.uid() = invited_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_individual_access_user_id ON business_individual_access(user_id);
CREATE INDEX IF NOT EXISTS idx_business_individual_access_business_id ON business_individual_access(business_id);
CREATE INDEX IF NOT EXISTS idx_business_individual_access_active ON business_individual_access(is_active);

CREATE INDEX IF NOT EXISTS idx_business_invitations_invited_user ON business_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_business_id ON business_invitations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);
CREATE INDEX IF NOT EXISTS idx_business_invitations_expires_at ON business_invitations(expires_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_individual_access_updated_at 
  BEFORE UPDATE ON business_individual_access 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_invitations_updated_at 
  BEFORE UPDATE ON business_invitations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
