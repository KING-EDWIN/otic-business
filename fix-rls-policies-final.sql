-- Fix RLS policies with correct table references
-- Run this in Supabase Dashboard SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON business_invitations;
DROP POLICY IF EXISTS "Business owners can manage invitations" ON business_invitations;
DROP POLICY IF EXISTS "Business owners can create invitations" ON business_invitations;

-- Create proper RLS policies for business_invitations (references businesses table)
CREATE POLICY "Users can view invitations sent to their email" ON business_invitations
  FOR SELECT USING (invited_email = auth.jwt() ->> 'email');
  
CREATE POLICY "Business owners can manage invitations" ON business_invitations
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses 
      WHERE created_by = auth.uid()
    )
  );

-- Also create a policy for INSERT operations specifically
CREATE POLICY "Business owners can create invitations" ON business_invitations
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses 
      WHERE created_by = auth.uid()
    )
  );

-- Create RLS policies for individual_business_access (references business_signups table)
ALTER TABLE individual_business_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Individuals can view their own access" ON individual_business_access;
DROP POLICY IF EXISTS "Business owners can manage access" ON individual_business_access;

CREATE POLICY "Individuals can view their own access" ON individual_business_access
  FOR SELECT USING (
    individual_id IN (
      SELECT id FROM individual_signups 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage access" ON individual_business_access
  FOR ALL USING (
    business_id IN (
      SELECT id FROM business_signups 
      WHERE user_id = auth.uid()
    )
  );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('business_invitations', 'individual_business_access')
ORDER BY tablename, policyname;
