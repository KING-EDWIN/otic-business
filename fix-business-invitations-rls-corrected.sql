-- Fix RLS policies for business_invitations table with correct column names
-- Run this in Supabase Dashboard SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON business_invitations;
DROP POLICY IF EXISTS "Business owners can manage invitations" ON business_invitations;
DROP POLICY IF EXISTS "Business owners can create invitations" ON business_invitations;

-- Create proper RLS policies for business_invitations
CREATE POLICY "Users can view invitations sent to their email" ON business_invitations
  FOR SELECT USING (invited_email = auth.jwt() ->> 'email');
  
CREATE POLICY "Business owners can manage invitations" ON business_invitations
  FOR ALL USING (
    business_id IN (
      SELECT id FROM business_signups 
      WHERE user_id = auth.uid()
    )
  );

-- Also create a policy for INSERT operations specifically
CREATE POLICY "Business owners can create invitations" ON business_invitations
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM business_signups 
      WHERE user_id = auth.uid()
    )
  );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'business_invitations';
