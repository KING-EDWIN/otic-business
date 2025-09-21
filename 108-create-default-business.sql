-- Create Default Business for Existing Users
-- This script creates a business for users who don't have one yet

-- Insert a default business for the test user if they don't have one
INSERT INTO businesses (
    id, 
    name, 
    description, 
    business_type, 
    industry, 
    email, 
    phone, 
    address, 
    city, 
    country, 
    created_by
) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    COALESCE(up.business_name, 'My Business'),
    'Your main business account',
    'retail',
    'general',
    up.email,
    up.phone,
    up.address,
    'Kampala',
    'Uganda',
    up.id
FROM user_profiles up
WHERE up.id = '3488046f-56cf-4711-9045-7e6e158a1c91'
AND NOT EXISTS (
    SELECT 1 FROM business_memberships bm 
    WHERE bm.user_id = up.id
)
ON CONFLICT (id) DO NOTHING;

-- Create business membership for the user
INSERT INTO business_memberships (
    user_id, 
    business_id, 
    role, 
    status, 
    joined_at
)
SELECT 
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    '550e8400-e29b-41d4-a716-446655440001',
    'owner',
    'active',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM business_memberships 
    WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
);

-- Update user_profiles to link to the business
UPDATE user_profiles 
SET business_name = COALESCE(business_name, 'My Business')
WHERE id = '3488046f-56cf-4711-9045-7e6e158a1c91';




