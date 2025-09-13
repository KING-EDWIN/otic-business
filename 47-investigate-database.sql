-- INVESTIGATE DATABASE STRUCTURE
-- Run this to see what actually exists before making any fixes

-- 1. Check business_memberships table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'business_memberships' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if inventory and orders tables exist
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('inventory', 'orders');

-- 3. Check what RPC functions currently exist
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%business%'
ORDER BY routine_name;

-- 4. Check if business_invitations table has the columns we need
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'business_invitations' 
AND table_schema = 'public'
ORDER BY ordinal_position;
