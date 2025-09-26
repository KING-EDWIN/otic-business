-- Comprehensive Database Fix for FAQ and User Profiles Issues
-- This script fixes the 406 errors and timeout issues

-- 1. Fix FAQ Tables - Use consistent UUID schema
-- Drop existing FAQ tables if they exist
DROP TABLE IF EXISTS faq_search_logs CASCADE;
DROP TABLE IF EXISTS faq_questions CASCADE;
DROP TABLE IF EXISTS faq_categories CASCADE;

-- Create FAQ categories table with UUID
CREATE TABLE faq_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ questions table with UUID
CREATE TABLE faq_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tier_required VARCHAR(50),
    feature_name VARCHAR(100),
    page_location VARCHAR(200),
    usage_instructions TEXT,
    keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ search logs table
CREATE TABLE faq_search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_question_id UUID REFERENCES faq_questions(id) ON DELETE SET NULL,
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Fix RLS Policies for FAQ tables
-- Disable RLS temporarily
ALTER TABLE faq_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE faq_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE faq_search_logs DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON faq_categories TO anon;
GRANT ALL ON faq_categories TO authenticated;
GRANT ALL ON faq_questions TO anon;
GRANT ALL ON faq_questions TO authenticated;
GRANT ALL ON faq_search_logs TO anon;
GRANT ALL ON faq_search_logs TO authenticated;

-- Re-enable RLS
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_search_logs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "faq_categories_all" ON faq_categories
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "faq_questions_all" ON faq_questions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "faq_search_logs_all" ON faq_search_logs
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Fix User Profiles RLS Policies
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_public_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON user_profiles;

-- Create simple, working policies for user_profiles
CREATE POLICY "user_profiles_select" ON user_profiles 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "user_profiles_insert" ON user_profiles 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "user_profiles_update" ON user_profiles 
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "user_profiles_delete" ON user_profiles 
    FOR DELETE TO authenticated USING (true);

-- 4. Fix Business Management Context Issues
-- Drop existing policies on business_memberships
DROP POLICY IF EXISTS "Users can view memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can create memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can update memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can delete memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "business_memberships_select_own" ON business_memberships;
DROP POLICY IF EXISTS "business_memberships_insert_own" ON business_memberships;
DROP POLICY IF EXISTS "business_memberships_update_own" ON business_memberships;
DROP POLICY IF EXISTS "business_memberships_delete_own" ON business_memberships;

-- Create simple policies for business_memberships
CREATE POLICY "business_memberships_select" ON business_memberships 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "business_memberships_insert" ON business_memberships 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "business_memberships_update" ON business_memberships 
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "business_memberships_delete" ON business_memberships 
    FOR DELETE TO authenticated USING (true);

-- 5. Insert FAQ Data
INSERT INTO faq_categories (name, description, sort_order) VALUES
('Getting Started', 'Basic setup and getting started questions', 1),
('POS System', 'Point of Sale system questions', 2),
('Inventory Management', 'Inventory and stock management questions', 3),
('Analytics & Reports', 'Analytics, reporting, and insights questions', 4),
('User Management', 'User accounts and permissions questions', 5),
('Billing & Subscriptions', 'Billing, payments, and subscription questions', 6),
('Technical Support', 'Technical issues and troubleshooting', 7),
('Multi-Business', 'Multi-business management questions', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert sample FAQ questions
INSERT INTO faq_questions (category_id, question, answer, tier_required, feature_name, page_location, usage_instructions, keywords) VALUES
-- Getting Started
((SELECT id FROM faq_categories WHERE name = 'Getting Started'), 
 'How do I create my account?', 
 'To create your account, click "Get Started" on the homepage, select "Business Account", fill in your details, and verify your email. You can start with a 14-day free trial.', 
 'free_trial', 
 'Account Creation', 
 '/user-type', 
 '1. Go to homepage 2. Click "Get Started" 3. Select "Business Account" 4. Fill in details 5. Verify email', 
 ARRAY['account', 'signup', 'register', 'create', 'getting started']),

((SELECT id FROM faq_categories WHERE name = 'Getting Started'), 
 'How do I verify my email?', 
 'After creating your account, check your email inbox for a verification link. Click the link to verify your email address. If you don''t see the email, check your spam folder.', 
 'free_trial', 
 'Email Verification', 
 '/verify-email', 
 '1. Check email inbox 2. Look for verification email 3. Click verification link 4. Check spam if not found', 
 ARRAY['email', 'verify', 'verification', 'confirm', 'account']),

-- POS System
((SELECT id FROM faq_categories WHERE name = 'POS System'), 
 'How do I process a sale?', 
 'Go to the POS page, scan or search for products, add them to cart, and complete the payment. You can accept cash, card, or mobile payments.', 
 'free_trial', 
 'POS System', 
 '/pos', 
 '1. Go to POS page 2. Scan/search products 3. Add to cart 4. Process payment 5. Complete sale', 
 ARRAY['pos', 'sale', 'payment', 'transaction', 'cash', 'card']),

((SELECT id FROM faq_categories WHERE name = 'POS System'), 
 'How do I handle returns?', 
 'To process a return, go to the POS page, select "Return" mode, scan or search for the original product, and process the refund.', 
 'free_trial', 
 'Returns', 
 '/pos', 
 '1. Go to POS page 2. Select Return mode 3. Scan original product 4. Process refund', 
 ARRAY['return', 'refund', 'exchange', 'pos']),

-- Inventory Management
((SELECT id FROM faq_categories WHERE name = 'Inventory Management'), 
 'How do I add new products?', 
 'Go to the Inventory page, click "Add Product", fill in the product details including name, price, and stock quantity, then save.', 
 'free_trial', 
 'Add Product', 
 '/inventory', 
 '1. Go to Inventory page 2. Click Add Product 3. Fill product details 4. Set price and stock 5. Save', 
 ARRAY['inventory', 'product', 'add', 'stock', 'price']),

((SELECT id FROM faq_categories WHERE name = 'Inventory Management'), 
 'How do I track low stock?', 
 'The system automatically tracks low stock items. You can view them in the Inventory page under "Low Stock" section.', 
 'free_trial', 
 'Low Stock Tracking', 
 '/inventory', 
 '1. Go to Inventory page 2. Check Low Stock section 3. Review items 4. Reorder as needed', 
 ARRAY['inventory', 'low stock', 'tracking', 'reorder', 'alert']),

-- Analytics & Reports
((SELECT id FROM faq_categories WHERE name = 'Analytics & Reports'), 
 'How do I view my sales reports?', 
 'Go to the Analytics page to view detailed sales reports, including daily, weekly, and monthly summaries.', 
 'free_trial', 
 'Sales Reports', 
 '/analytics', 
 '1. Go to Analytics page 2. Select date range 3. View sales data 4. Export if needed', 
 ARRAY['analytics', 'reports', 'sales', 'data', 'summary']),

-- Technical Support
((SELECT id FROM faq_categories WHERE name = 'Technical Support'), 
 'What should I do if the app is slow?', 
 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If issues persist, contact support.', 
 'free_trial', 
 'Performance', 
 '/support', 
 '1. Refresh page 2. Clear browser cache 3. Check internet 4. Contact support if needed', 
 ARRAY['slow', 'performance', 'speed', 'cache', 'internet']),

((SELECT id FROM faq_categories WHERE name = 'Technical Support'), 
 'How do I contact support?', 
 'You can contact support through the Contact page or email support@oticbusiness.com for assistance.', 
 'free_trial', 
 'Support Contact', 
 '/contact', 
 '1. Go to Contact page 2. Fill contact form 3. Or email support@oticbusiness.com', 
 ARRAY['support', 'contact', 'help', 'assistance', 'email'])
ON CONFLICT DO NOTHING;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faq_questions_category_id ON faq_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_questions_is_active ON faq_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_questions_view_count ON faq_questions(view_count);
CREATE INDEX IF NOT EXISTS idx_faq_categories_sort_order ON faq_categories(sort_order);

-- 7. Verify the setup
SELECT 'FAQ Categories Count' as info, COUNT(*) as count FROM faq_categories;
SELECT 'FAQ Questions Count' as info, COUNT(*) as count FROM faq_questions;
SELECT 'User Profiles Policies' as info, COUNT(*) as count FROM pg_policies WHERE tablename = 'user_profiles';
SELECT 'Business Memberships Policies' as info, COUNT(*) as count FROM pg_policies WHERE tablename = 'business_memberships';
