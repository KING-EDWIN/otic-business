-- Quick fix for QuickBooks tables
-- Run this in Supabase SQL Editor

-- Create quickbooks_tokens table
CREATE TABLE IF NOT EXISTS quickbooks_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  company_id TEXT NOT NULL,
  company_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quickbooks_sync_log table
CREATE TABLE IF NOT EXISTS quickbooks_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily for testing
ALTER TABLE quickbooks_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE quickbooks_sync_log DISABLE ROW LEVEL SECURITY;

-- Insert a test token for any existing user
INSERT INTO quickbooks_tokens (
  user_id,
  access_token,
  refresh_token,
  company_id,
  company_name,
  expires_at
) 
SELECT 
  id as user_id,
  'sandbox_access_token' as access_token,
  'sandbox_refresh_token' as refresh_token,
  '9341455307021048' as company_id,
  'Sandbox Company_US_1' as company_name,
  NOW() + INTERVAL '1 hour' as expires_at
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;
