-- Create FAQ System Database
-- This file creates the FAQ system with questions, answers, and tier information

-- Create FAQ categories table
CREATE TABLE IF NOT EXISTS faq_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ questions table
CREATE TABLE IF NOT EXISTS faq_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tier_required VARCHAR(50) REFERENCES tiers(name) ON DELETE SET NULL,
    feature_name VARCHAR(100),
    page_location VARCHAR(200),
    usage_instructions TEXT,
    keywords TEXT[], -- Array of keywords for search
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ search logs table
CREATE TABLE IF NOT EXISTS faq_search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_question_id UUID REFERENCES faq_questions(id) ON DELETE SET NULL,
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faq_questions_category_id ON faq_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_questions_tier_required ON faq_questions(tier_required);
CREATE INDEX IF NOT EXISTS idx_faq_questions_keywords ON faq_questions USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_faq_questions_is_active ON faq_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_search_logs_user_id ON faq_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_faq_search_logs_search_timestamp ON faq_search_logs(search_timestamp);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_faq_questions_search ON faq_questions USING GIN(
    to_tsvector('english', question || ' ' || answer || ' ' || COALESCE(feature_name, '') || ' ' || COALESCE(page_location, ''))
);

-- Insert default FAQ categories
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
 'What is included in the free trial?', 
 'The free trial includes full access to all features: POS system, inventory management, AI analytics, multi-user access (up to 3 users), all payment methods, and priority support.', 
 'free_trial', 
 'Free Trial', 
 '/pricing', 
 'All features are available during the 14-day free trial period with no credit card required.', 
 ARRAY['trial', 'free', 'features', 'included', '14 days']),

-- POS System
((SELECT id FROM faq_categories WHERE name = 'POS System'), 
 'How do I process a sale?', 
 'To process a sale: 1. Go to the POS page 2. Scan or search for products 3. Add quantities 4. Select payment method 5. Complete the transaction. Receipts are automatically generated.', 
 'free_trial', 
 'POS System', 
 '/pos', 
 'Navigate to POS → Scan/Search products → Add to cart → Select payment → Complete sale', 
 ARRAY['pos', 'sale', 'transaction', 'payment', 'receipt']),

((SELECT id FROM faq_categories WHERE name = 'POS System'), 
 'Can I use the POS system offline?', 
 'Yes, the POS system works offline. Sales are stored locally and sync automatically when internet connection is restored. You can process transactions without internet.', 
 'free_trial', 
 'Offline POS', 
 '/pos', 
 'The system automatically detects offline mode and continues to function normally.', 
 ARRAY['offline', 'pos', 'internet', 'connection', 'sync']),

-- Inventory Management
((SELECT id FROM faq_categories WHERE name = 'Inventory Management'), 
 'How do I add new products?', 
 'To add products: 1. Go to Inventory page 2. Click "Add Product" 3. Fill in product details (name, price, SKU, etc.) 4. Upload product image 5. Save. Products are immediately available in POS.', 
 'free_trial', 
 'Add Products', 
 '/inventory', 
 'Inventory → Add Product → Fill details → Upload image → Save', 
 ARRAY['inventory', 'products', 'add', 'new', 'stock']),

((SELECT id FROM faq_categories WHERE name = 'Inventory Management'), 
 'How do I set low stock alerts?', 
 'Set low stock alerts in the Inventory page: 1. Select a product 2. Set minimum stock level 3. Enable alerts. You will receive notifications when stock falls below the threshold.', 
 'start_smart', 
 'Low Stock Alerts', 
 '/inventory', 
 'Inventory → Select Product → Set Minimum Stock → Enable Alerts', 
 ARRAY['inventory', 'alerts', 'low stock', 'notifications', 'threshold']),

-- Analytics & Reports
((SELECT id FROM faq_categories WHERE name = 'Analytics & Reports'), 
 'Where can I view my sales reports?', 
 'Sales reports are available in the Reports page. You can view daily, weekly, monthly, and custom period reports. Export options include PDF and Excel formats.', 
 'start_smart', 
 'Sales Reports', 
 '/reports', 
 'Reports → Sales Reports → Select period → View/Export', 
 ARRAY['reports', 'sales', 'analytics', 'export', 'pdf']),

((SELECT id FROM faq_categories WHERE name = 'Analytics & Reports'), 
 'What AI insights are available?', 
 'AI insights include sales forecasting, customer behavior analysis, inventory optimization suggestions, and trend predictions. Available in the Analytics page.', 
 'grow_intelligence', 
 'AI Analytics', 
 '/analytics', 
 'Analytics → AI Insights → View predictions and recommendations', 
 ARRAY['ai', 'insights', 'analytics', 'forecasting', 'predictions']),

-- User Management
((SELECT id FROM faq_categories WHERE name = 'User Management'), 
 'How do I add team members?', 
 'To add team members: 1. Go to Settings → Users 2. Click "Invite User" 3. Enter email and select role 4. Send invitation. They will receive an email to join.', 
 'grow_intelligence', 
 'Add Users', 
 '/settings', 
 'Settings → Users → Invite User → Enter details → Send', 
 ARRAY['users', 'team', 'invite', 'permissions', 'roles']),

-- Multi-Business
((SELECT id FROM faq_categories WHERE name = 'Multi-Business'), 
 'How do I create multiple businesses?', 
 'Multi-business management is available for Enterprise Advantage tier users. Go to My Extras → My Businesses → Add Business to create additional businesses.', 
 'enterprise_advantage', 
 'Multi-Business Management', 
 '/my-extras', 
 'My Extras → My Businesses → Add Business → Fill details → Create', 
 ARRAY['multi-business', 'enterprise', 'businesses', 'create', 'management']),

-- Billing
((SELECT id FROM faq_categories WHERE name = 'Billing & Subscriptions'), 
 'How do I upgrade my plan?', 
 'To upgrade: 1. Go to My Extras page 2. Click "Upgrade Plan" 3. Select new tier 4. Complete payment. Changes take effect immediately.', 
 'free_trial', 
 'Plan Upgrade', 
 '/my-extras', 
 'My Extras → Upgrade Plan → Select Tier → Pay → Activate', 
 ARRAY['upgrade', 'plan', 'billing', 'payment', 'tier']);

-- Enable RLS
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_search_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- FAQ categories are public
CREATE POLICY "FAQ categories are viewable by everyone" ON faq_categories
    FOR SELECT USING (true);

-- FAQ questions are viewable by everyone
CREATE POLICY "FAQ questions are viewable by everyone" ON faq_questions
    FOR SELECT USING (is_active = true);

-- Only authenticated users can insert search logs
CREATE POLICY "Users can insert their own search logs" ON faq_search_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can manage FAQ content
CREATE POLICY "Admins can manage FAQ categories" ON faq_categories
    FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email IN ('admin@oticbusiness.com')));

CREATE POLICY "Admins can manage FAQ questions" ON faq_questions
    FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email IN ('admin@oticbusiness.com')));

-- Grant permissions
GRANT SELECT ON faq_categories TO authenticated;
GRANT SELECT ON faq_questions TO authenticated;
GRANT INSERT ON faq_search_logs TO authenticated;
GRANT ALL ON faq_categories TO authenticated;
GRANT ALL ON faq_questions TO authenticated;
