-- Complete Database Setup Script
-- This script creates all tables and functions for OTIC Business
-- Run this script to set up the entire database from scratch

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Core Schema
\i sql/database-setup/core-schema.sql

-- 2. Create OTIC Vision Schema
\i sql/database-setup/otic-vision-schema.sql

-- 3. Create Admin System Schema
\i sql/database-setup/admin-system-schema.sql

-- 4. Create Multi-Business Schema
\i sql/database-setup/multi-business-schema.sql

-- 5. Create FAQ System Schema
\i sql/database-setup/faq-system-schema.sql

-- 6. Create RPC Functions
\i sql/rpc-functions/admin-functions.sql

-- 7. Create RLS Policies
\i sql/rls-scripts/rls-policies.sql

-- 8. Insert Initial Data
INSERT INTO individual_professions (name, description) VALUES
('Software Developer', 'Web and mobile application development'),
('Graphic Designer', 'Visual design and branding'),
('Marketing Specialist', 'Digital marketing and advertising'),
('Accountant', 'Financial management and bookkeeping'),
('Consultant', 'Business consulting and advisory'),
('Freelancer', 'General freelance services')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tiers (name, tier_type, price, description) VALUES
('free_trial', 'individual', 0.00, 'Free trial for individual users'),
('basic', 'individual', 9.99, 'Basic individual plan'),
('premium', 'individual', 19.99, 'Premium individual plan'),
('enterprise', 'individual', 49.99, 'Enterprise individual plan'),
('free_trial', 'business', 0.00, 'Free trial for business users'),
('starter', 'business', 29.99, 'Starter business plan'),
('professional', 'business', 59.99, 'Professional business plan'),
('enterprise', 'business', 99.99, 'Enterprise business plan')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (name, description) VALUES
('inventory_management', 'Track and manage inventory'),
('sales_tracking', 'Monitor sales performance'),
('customer_management', 'Manage customer relationships'),
('reporting', 'Generate business reports'),
('multi_branch', 'Manage multiple business locations'),
('staff_management', 'Track staff performance'),
('payment_processing', 'Process payments via Flutterwave'),
('otic_vision', 'AI-powered visual recognition'),
('quickbooks_integration', 'Sync with QuickBooks'),
('email_notifications', 'Automated email notifications')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tier_features (tier_id, feature_id) VALUES
-- Free trial features
(1, 1), (1, 2), (1, 3), (1, 4), (1, 7), (1, 8),
-- Basic individual features
(2, 1), (2, 2), (2, 3), (2, 4), (2, 7), (2, 8),
-- Premium individual features
(3, 1), (3, 2), (3, 3), (3, 4), (3, 7), (3, 8), (3, 9),
-- Enterprise individual features
(4, 1), (4, 2), (4, 3), (4, 4), (4, 7), (4, 8), (4, 9), (4, 10),
-- Business free trial features
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7), (5, 8),
-- Business starter features
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 7), (6, 8),
-- Business professional features
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7), (7, 8), (7, 9),
-- Business enterprise features
(8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 6), (8, 7), (8, 8), (8, 9), (8, 10)
ON CONFLICT (tier_id, feature_id) DO NOTHING;

INSERT INTO faq_categories (name, description, icon) VALUES
('Getting Started', 'Basic setup and getting started questions', 'play'),
('Account Management', 'Managing your account and profile', 'user'),
('Payments & Billing', 'Payment processing and billing questions', 'credit-card'),
('Inventory Management', 'Managing products and inventory', 'package'),
('Sales & Customers', 'Sales tracking and customer management', 'trending-up'),
('Reports & Analytics', 'Generating reports and viewing analytics', 'bar-chart'),
('OTIC Vision', 'AI-powered visual recognition features', 'eye'),
('Multi-Branch', 'Managing multiple business locations', 'map-pin'),
('Technical Support', 'Technical issues and troubleshooting', 'tool'),
('Business Features', 'Advanced business management features', 'briefcase')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vft_categories (name, description) VALUES
('Electronics', 'Electronic devices and components'),
('Clothing', 'Apparel and fashion items'),
('Food & Beverages', 'Food products and beverages'),
('Books & Media', 'Books, magazines, and media'),
('Home & Garden', 'Home improvement and garden items'),
('Sports & Recreation', 'Sports equipment and recreational items'),
('Health & Beauty', 'Health and beauty products'),
('Automotive', 'Automotive parts and accessories'),
('Office Supplies', 'Office equipment and supplies'),
('Toys & Games', 'Toys and gaming items')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_types (name, description) VALUES
('individual', 'Individual users and freelancers'),
('business', 'Business users and organizations'),
('admin', 'System administrators'),
('developer', 'System developers')
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Complete database setup completed successfully!' as status;
