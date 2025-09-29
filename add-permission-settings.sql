-- Add permission_settings column to individual_business_access table
-- Run this in Supabase Dashboard SQL Editor

-- Add permission_settings column
ALTER TABLE individual_business_access 
ADD COLUMN IF NOT EXISTS permission_settings JSONB DEFAULT '{
  "pos": true,
  "inventory": false,
  "accounting": false,
  "payments": false,
  "customers": false
}'::jsonb;

-- Update existing records with default permissions based on invitation_type
UPDATE individual_business_access 
SET permission_settings = CASE 
  WHEN invitation_type = 'manager' THEN '{
    "pos": true,
    "inventory": true,
    "accounting": true,
    "payments": true,
    "customers": true
  }'::jsonb
  ELSE '{
    "pos": true,
    "inventory": false,
    "accounting": false,
    "payments": false,
    "customers": false
  }'::jsonb
END
WHERE permission_settings IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN individual_business_access.permission_settings IS 'JSON object containing permission settings for each business module (pos, inventory, accounting, payments, customers)';

-- Verify the changes
SELECT 
  id,
  individual_id,
  business_id,
  invitation_type,
  permission_settings,
  created_at
FROM individual_business_access 
LIMIT 5;
