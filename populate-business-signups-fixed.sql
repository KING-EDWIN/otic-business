-- Populate business_signups table from user_profiles (fixed for NOT NULL constraints)
-- Run this in Supabase Dashboard SQL Editor

-- Insert business users from user_profiles into business_signups
INSERT INTO business_signups (
  id,
  user_id,
  company_name,
  business_name,
  email_address,
  key_contact_person,
  phone_number,
  physical_address,
  city_of_operation,
  country_of_operation,
  industry_sector,
  trial_start_date,
  trial_end_date,
  trial_active,
  created_at,
  updated_at,
  email,
  full_name,
  phone,
  address
)
SELECT 
  id,
  id as user_id,
  COALESCE(business_name, 'Business') as company_name,
  COALESCE(business_name, 'Business') as business_name,
  email as email_address,
  COALESCE(full_name, business_name, 'Business Owner') as key_contact_person,
  COALESCE(phone, '+256000000000') as phone_number,
  COALESCE(address, 'Not specified') as physical_address,
  'Kampala' as city_of_operation,
  'Uganda' as country_of_operation,
  'Technology' as industry_sector,
  created_at as trial_start_date,
  (created_at + INTERVAL '14 days') as trial_end_date,
  true as trial_active,
  created_at,
  updated_at,
  email,
  COALESCE(full_name, business_name) as full_name,
  phone,
  address
FROM user_profiles 
WHERE user_type = 'business'
  AND NOT EXISTS (
    SELECT 1 FROM business_signups 
    WHERE business_signups.id = user_profiles.id
  );

-- Verify the data was inserted
SELECT COUNT(*) as business_signups_count FROM business_signups;
SELECT COUNT(*) as user_profiles_business_count FROM user_profiles WHERE user_type = 'business';

-- Show sample data
SELECT id, business_name, company_name, email_address, phone_number, key_contact_person FROM business_signups LIMIT 5;
