-- Remove QuickBooks Integration from Database
-- This file removes QuickBooks integration from features and tiers

-- Remove quickbooks_integration from all tiers
UPDATE tiers 
SET features = array_remove(features, 'quickbooks_integration')
WHERE 'quickbooks_integration' = ANY(features);

-- Remove quickbooks_integration feature from features table
DELETE FROM features 
WHERE name = 'quickbooks_integration';

-- Verify the changes
SELECT name, display_name, features 
FROM tiers 
ORDER BY sort_order;

-- Check if quickbooks_integration is completely removed
SELECT name 
FROM features 
WHERE name LIKE '%quickbooks%';
