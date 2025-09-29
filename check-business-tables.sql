-- Check what business-related tables exist
-- Run this in Supabase Dashboard SQL Editor

-- List all tables that start with 'business'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'business%'
ORDER BY table_name;

-- Check if 'businesses' table exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
ORDER BY ordinal_position;

-- Check if 'individual_business_access' table exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'individual_business_access' 
ORDER BY ordinal_position;
