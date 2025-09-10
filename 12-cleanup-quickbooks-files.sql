-- Cleanup QuickBooks References from Database
-- This file removes all QuickBooks-related data and tables

-- Drop QuickBooks-related tables if they exist
DROP TABLE IF EXISTS quickbooks_tokens CASCADE;
DROP TABLE IF EXISTS quickbooks_sync_log CASCADE;
DROP TABLE IF EXISTS quickbooks_company_info CASCADE;

-- Remove any remaining QuickBooks references from features
DELETE FROM features WHERE name LIKE '%quickbooks%';

-- Remove QuickBooks from all tiers
UPDATE tiers 
SET features = array_remove(features, 'quickbooks_integration')
WHERE 'quickbooks_integration' = ANY(features);

-- Verify cleanup
SELECT 'Features after cleanup:' as status;
SELECT name FROM features WHERE name LIKE '%quickbooks%';

SELECT 'Tiers after cleanup:' as status;
SELECT name, features FROM tiers ORDER BY sort_order;
