-- Fix business_invitations table structure
-- Run this in Supabase Dashboard SQL Editor

-- First, check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'business_invitations' 
ORDER BY ordinal_position;

-- Add missing columns to business_invitations table
ALTER TABLE business_invitations 
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
ADD COLUMN IF NOT EXISTS message TEXT DEFAULT 'You have been invited to join our business!';

-- If the above fails, recreate the table with proper structure
-- (Uncomment the following if needed)

/*
DROP TABLE IF EXISTS business_invitations CASCADE;

CREATE TABLE business_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES business_signups(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT DEFAULT 'You have been invited to join our business!',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view invitations sent to their email" ON business_invitations
  FOR SELECT USING (invited_email = auth.jwt() ->> 'email');
  
CREATE POLICY "Business owners can manage invitations" ON business_invitations
  FOR ALL USING (
    business_id IN (
      SELECT id FROM business_signups 
      WHERE owner_id = auth.uid()
    )
  );
*/

-- Verify the table structure after changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'business_invitations' 
ORDER BY ordinal_position;
