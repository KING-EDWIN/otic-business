-- Fix RLS policy for individual_business_access to use correct column reference
-- Run this in Supabase Dashboard SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Individuals can view their own access" ON individual_business_access;
DROP POLICY IF EXISTS "Individuals can accept invitations" ON individual_business_access;
DROP POLICY IF EXISTS "Business owners can manage access" ON individual_business_access;

-- Create new policies that use correct column reference
-- user_profiles.id = auth.uid() (the user's UUID from auth.users)
CREATE POLICY "Individuals can view their own access" ON individual_business_access
  FOR SELECT USING (
    individual_id IN (
      SELECT id FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'individual'
    )
  );

CREATE POLICY "Individuals can accept invitations" ON individual_business_access
  FOR INSERT WITH CHECK (
    individual_id IN (
      SELECT id FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'individual'
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
WHERE tablename = 'individual_business_access'
ORDER BY policyname;
