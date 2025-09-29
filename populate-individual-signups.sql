-- Populate individual_signups table from user_profiles
-- Run this in Supabase Dashboard SQL Editor

-- Insert individual users from user_profiles into individual_signups
INSERT INTO individual_signups (
  id,
  email,
  full_name,
  phone,
  address,
  created_at,
  updated_at,
  user_id
)
SELECT 
  id,
  email,
  COALESCE(full_name, 'Individual User') as full_name,
  phone,
  address,
  created_at,
  updated_at,
  id as user_id
FROM user_profiles 
WHERE user_type = 'individual'
  AND NOT EXISTS (
    SELECT 1 FROM individual_signups 
    WHERE individual_signups.id = user_profiles.id
  );

-- Verify the data was inserted
SELECT COUNT(*) as individual_signups_count FROM individual_signups;
SELECT COUNT(*) as user_profiles_individual_count FROM user_profiles WHERE user_type = 'individual';

-- Show sample data
SELECT id, email, full_name, created_at FROM individual_signups LIMIT 5;
