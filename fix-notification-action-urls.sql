-- Fix notification action URLs to point to correct pages
-- This script updates existing notifications to have proper action URLs

-- Update welcome notifications to point to dashboard instead of inventory
UPDATE notifications 
SET action_url = '/dashboard'
WHERE title = 'Welcome to Otic Business!' 
AND action_url = '/inventory';

-- Update low stock notifications to point to inventory (this is correct)
UPDATE notifications 
SET action_url = '/inventory'
WHERE type = 'low_stock' 
AND action_url IS NOT NULL;

-- Update sale notifications to point to POS (this is correct)
UPDATE notifications 
SET action_url = '/pos'
WHERE type = 'sale' 
AND action_url IS NOT NULL;

-- Update invitation notifications to point to business management
UPDATE notifications 
SET action_url = '/business-management'
WHERE type = 'invitation' 
AND action_url IS NOT NULL;

-- Show updated notifications
SELECT id, title, type, action_url, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
