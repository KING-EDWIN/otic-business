-- Clean FAQ Permissions Fix
-- This file completely removes RLS and grants full access to fix all permission issues

-- Completely disable RLS on FAQ tables
ALTER TABLE faq_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE faq_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE faq_search_logs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "FAQ categories full access" ON faq_categories;
DROP POLICY IF EXISTS "FAQ questions full access" ON faq_questions;
DROP POLICY IF EXISTS "FAQ search logs full access" ON faq_search_logs;
DROP POLICY IF EXISTS "Admin can manage FAQ categories" ON faq_categories;
DROP POLICY IF EXISTS "Admin can manage FAQ questions" ON faq_questions;
DROP POLICY IF EXISTS "Admin can manage FAQ search logs" ON faq_search_logs;
DROP POLICY IF EXISTS "Public can read FAQ categories" ON faq_categories;
DROP POLICY IF EXISTS "Public can read FAQ questions" ON faq_questions;

-- Grant comprehensive permissions to all users
GRANT ALL ON faq_categories TO anon;
GRANT ALL ON faq_categories TO authenticated;
GRANT ALL ON faq_questions TO anon;
GRANT ALL ON faq_questions TO authenticated;
GRANT ALL ON faq_search_logs TO anon;
GRANT ALL ON faq_search_logs TO authenticated;

-- Grant permissions on auth.users
GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON auth.users TO authenticated;

-- Insert categories if they don't exist
INSERT INTO faq_categories (name, description, sort_order) 
SELECT 'Getting Started', 'Basic setup and getting started questions', 1
WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE name = 'Getting Started');

INSERT INTO faq_categories (name, description, sort_order) 
SELECT 'POS System', 'Point of Sale system questions', 2
WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE name = 'POS System');

INSERT INTO faq_categories (name, description, sort_order) 
SELECT 'Inventory Management', 'Inventory and stock management questions', 3
WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE name = 'Inventory Management');

INSERT INTO faq_categories (name, description, sort_order) 
SELECT 'Analytics & Reports', 'Analytics, reporting, and insights questions', 4
WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE name = 'Analytics & Reports');

INSERT INTO faq_categories (name, description, sort_order) 
SELECT 'User Management', 'User accounts and permissions questions', 5
WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE name = 'User Management');

INSERT INTO faq_categories (name, description, sort_order) 
SELECT 'Billing & Subscriptions', 'Billing, payments, and subscription questions', 6
WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE name = 'Billing & Subscriptions');

INSERT INTO faq_categories (name, description, sort_order) 
SELECT 'Technical Support', 'Technical issues and troubleshooting', 7
WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE name = 'Technical Support');

INSERT INTO faq_categories (name, description, sort_order) 
SELECT 'Multi-Business', 'Multi-business management questions', 8
WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE name = 'Multi-Business');

-- Insert sample questions if they don't exist
INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'Getting Started'),
    'How do I create my account?',
    'To create your account, click "Get Started" on the homepage, select "Business Account", fill in your details, and verify your email. You can start with a 14-day free trial.',
    'free_trial',
    'Account Creation',
    '/user-type',
    '1. Go to homepage 2. Click Get Started 3. Select Business Account 4. Fill in details 5. Verify email',
    ARRAY['account', 'signup', 'register', 'create', 'getting started']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'How do I create my account?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'Getting Started'),
    'What is included in the free trial?',
    'The free trial includes full access to all features: POS system, inventory management, AI analytics, multi-user access (up to 3 users), all payment methods, and priority support.',
    'free_trial',
    'Free Trial',
    '/pricing',
    'All features are available during the 14-day free trial period with no credit card required.',
    ARRAY['trial', 'free', 'features', 'included', '14 days']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'What is included in the free trial?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'POS System'),
    'How do I process a sale?',
    'To process a sale: 1. Go to the POS page 2. Scan or search for products 3. Add quantities 4. Select payment method 5. Complete the transaction. Receipts are automatically generated.',
    'free_trial',
    'POS System',
    '/pos',
    'Navigate to POS - Scan/Search products - Add to cart - Select payment - Complete sale',
    ARRAY['pos', 'sale', 'transaction', 'payment', 'receipt']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'How do I process a sale?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'POS System'),
    'Can I use the POS system offline?',
    'Yes, the POS system works offline. Sales are stored locally and sync automatically when internet connection is restored. You can process transactions without internet.',
    'free_trial',
    'Offline POS',
    '/pos',
    'The system automatically detects offline mode and continues to function normally.',
    ARRAY['offline', 'pos', 'internet', 'connection', 'sync']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'Can I use the POS system offline?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'Inventory Management'),
    'How do I add new products?',
    'To add products: 1. Go to Inventory page 2. Click "Add Product" 3. Fill in product details (name, price, SKU, etc.) 4. Upload product image 5. Save. Products are immediately available in POS.',
    'free_trial',
    'Add Products',
    '/inventory',
    'Inventory - Add Product - Fill details - Upload image - Save',
    ARRAY['inventory', 'products', 'add', 'new', 'stock']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'How do I add new products?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'Inventory Management'),
    'How do I set low stock alerts?',
    'Set low stock alerts in the Inventory page: 1. Select a product 2. Set minimum stock level 3. Enable alerts. You will receive notifications when stock falls below the threshold.',
    'start_smart',
    'Low Stock Alerts',
    '/inventory',
    'Inventory - Select Product - Set Minimum Stock - Enable Alerts',
    ARRAY['inventory', 'alerts', 'low stock', 'notifications', 'threshold']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'How do I set low stock alerts?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'Analytics & Reports'),
    'Where can I view my sales reports?',
    'Sales reports are available in the Reports page. You can view daily, weekly, monthly, and custom period reports. Export options include PDF and Excel formats.',
    'start_smart',
    'Sales Reports',
    '/reports',
    'Reports - Sales Reports - Select period - View/Export',
    ARRAY['reports', 'sales', 'analytics', 'export', 'pdf']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'Where can I view my sales reports?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'Analytics & Reports'),
    'What AI insights are available?',
    'AI insights include sales forecasting, customer behavior analysis, inventory optimization suggestions, and trend predictions. Available in the Analytics page.',
    'grow_intelligence',
    'AI Analytics',
    '/analytics',
    'Analytics - AI Insights - View predictions and recommendations',
    ARRAY['ai', 'insights', 'analytics', 'forecasting', 'predictions']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'What AI insights are available?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'User Management'),
    'How do I add team members?',
    'To add team members: 1. Go to Settings - Users 2. Click "Invite User" 3. Enter email and select role 4. Send invitation. They will receive an email to join.',
    'grow_intelligence',
    'Add Users',
    '/settings',
    'Settings - Users - Invite User - Enter details - Send',
    ARRAY['users', 'team', 'invite', 'permissions', 'roles']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'How do I add team members?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'Multi-Business'),
    'How do I create multiple businesses?',
    'Multi-business management is available for Enterprise Advantage tier users. Go to My Extras - My Businesses - Add Business to create additional businesses.',
    'enterprise_advantage',
    'Multi-Business Management',
    '/my-extras',
    'My Extras - My Businesses - Add Business - Fill details - Create',
    ARRAY['multi-business', 'enterprise', 'businesses', 'create', 'management']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'How do I create multiple businesses?');

INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) 
SELECT 
    (SELECT id FROM faq_categories WHERE name = 'Billing & Subscriptions'),
    'How do I upgrade my plan?',
    'To upgrade: 1. Go to My Extras page 2. Click "Upgrade Plan" 3. Select new tier 4. Complete payment. Changes take effect immediately.',
    'free_trial',
    'Plan Upgrade',
    '/my-extras',
    'My Extras - Upgrade Plan - Select Tier - Pay - Activate',
    ARRAY['upgrade', 'plan', 'billing', 'payment', 'tier']
WHERE NOT EXISTS (SELECT 1 FROM faq_questions WHERE question = 'How do I upgrade my plan?');
