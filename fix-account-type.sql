-- Fix account type for dylankats2@gmail.com
-- Update the user_type from 'business' to 'individual'

UPDATE user_profiles 
SET 
  user_type = 'individual',
  business_name = NULL,
  full_name = 'Individual User',
  updated_at = NOW()
WHERE email = 'dylankats2@gmail.com';

-- Verify the change
SELECT 
  id,
  email,
  user_type,
  business_name,
  full_name,
  created_at,
  updated_at
FROM user_profiles 
WHERE email = 'dylankats2@gmail.com';
