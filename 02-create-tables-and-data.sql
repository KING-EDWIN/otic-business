-- Step 2: Create Tables and Insert Data
-- Run this SECOND in your Supabase SQL Editor (after running 01-create-enums.sql)

-- Create features table
CREATE TABLE IF NOT EXISTS features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- 'core', 'analytics', 'integration', 'support', 'system'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tiers table
CREATE TABLE IF NOT EXISTS tiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  tier_type user_tier NOT NULL UNIQUE,
  price_usd DECIMAL(10,2) NOT NULL,
  price_ugx DECIMAL(10,2) NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  trial_days INTEGER DEFAULT 0,
  description TEXT,
  features TEXT[], -- Array of feature names
  max_users INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tier_features junction table
CREATE TABLE IF NOT EXISTS tier_features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tier_id UUID REFERENCES tiers(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
  is_included BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tier_id, feature_id)
);

-- Create user_subscriptions table (updated)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES tiers(id) ON DELETE CASCADE NOT NULL,
  status subscription_status DEFAULT 'trial',
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT false,
  payment_method VARCHAR(50),
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'UGX',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One active subscription per user
);

-- Create payments table (updated)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES tiers(id) ON DELETE CASCADE NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  amount_ugx DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
  status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  payment_proof_url TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tier_usage_tracking table
CREATE TABLE IF NOT EXISTS tier_usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES tiers(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT -1, -- -1 means unlimited
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert features (only if they don't exist)
INSERT INTO features (name, description, category) VALUES
-- Core Features
('pos_system', 'Point of Sale system with barcode scanning', 'core'),
('inventory_management', 'Complete inventory management system', 'core'),
('sales_reporting', 'Daily, weekly, monthly sales reports', 'core'),
('receipt_generation', 'Generate and print receipts', 'core'),
('csv_pdf_exports', 'Export data in CSV and PDF formats', 'core'),
('multi_user_access', 'Support for multiple users', 'core'),
('role_based_permissions', 'User roles and permission management', 'core'),

-- Analytics Features
('ai_analytics', 'AI-powered analytics and insights', 'analytics'),
('ai_sales_trends', 'AI sales trend analytics', 'analytics'),
('ai_forecasting', 'AI financial forecasting', 'analytics'),
('financial_reports', 'Automated financial reports', 'analytics'),
('tax_computation', 'Tax computation and VAT analysis', 'analytics'),
('compliance_reporting', 'Advanced compliance reporting', 'analytics'),

-- Integration Features
('quickbooks_integration', 'QuickBooks API integration', 'integration'),
('third_party_apis', 'Third-party API integrations', 'integration'),
('multi_branch_sync', 'Multi-branch synchronization', 'integration'),

-- Support Features
('email_support', 'Email support', 'support'),
('priority_support', 'Priority support during trial', 'support'),
('dedicated_manager', 'Dedicated account manager', 'support'),
('phone_support', '24/7 phone support', 'support'),

-- System Features
('audit_logs', 'Audit logs and advanced permissions', 'system'),
('unlimited_users', 'Unlimited user access', 'system')
ON CONFLICT (name) DO NOTHING;

-- Insert tiers (only if they don't exist)
INSERT INTO tiers (name, display_name, tier_type, price_usd, price_ugx, trial_days, description, features, max_users, sort_order) VALUES
('free_trial', 'Free Trial', 'free_trial', 0.00, 0.00, 30, 'Try everything for free - no credit card required', 
 ARRAY['pos_system', 'inventory_management', 'ai_analytics', 'multi_user_access', 'all_payment_methods', 'priority_support'], 
 -1, 1),

('start_smart', 'Start Smart', 'start_smart', 300.00, 300.00, 0, 'Perfect for small businesses starting their digital transformation',
 ARRAY['pos_system', 'inventory_management', 'sales_reporting', 'receipt_generation', 'csv_pdf_exports', 'email_support'],
 1, 2),

('grow_intelligence', 'Grow with Intelligence', 'grow_intelligence', 852.45, 852.45, 0, 'Ideal for growing SMEs ready for advanced automation',
 ARRAY['pos_system', 'inventory_management', 'sales_reporting', 'receipt_generation', 'csv_pdf_exports', 'quickbooks_integration', 'tax_computation', 'ai_sales_trends', 'multi_user_access', 'role_based_permissions', 'financial_reports', 'priority_support'],
 5, 3),

('enterprise_advantage', 'Enterprise Advantage', 'enterprise_advantage', 1420.00, 1420.00, 0, 'Enterprise solution for multi-branch operations',
 ARRAY['pos_system', 'inventory_management', 'sales_reporting', 'receipt_generation', 'csv_pdf_exports', 'quickbooks_integration', 'tax_computation', 'ai_sales_trends', 'multi_user_access', 'role_based_permissions', 'financial_reports', 'multi_branch_sync', 'ai_forecasting', 'compliance_reporting', 'unlimited_users', 'third_party_apis', 'audit_logs', 'dedicated_manager', 'phone_support'],
 -1, 4)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier_id ON user_subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_tier_usage_tracking_user_id ON tier_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_usage_tracking_tier_id ON tier_usage_tracking(tier_id);

-- Enable RLS
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Features are public read
CREATE POLICY "Features are publicly readable" ON features FOR SELECT USING (true);

-- Tiers are public read
CREATE POLICY "Tiers are publicly readable" ON tiers FOR SELECT USING (true);

-- Tier features are public read
CREATE POLICY "Tier features are publicly readable" ON tier_features FOR SELECT USING (true);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own usage tracking
CREATE POLICY "Users can view own usage tracking" ON tier_usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage tracking" ON tier_usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage tracking" ON tier_usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (temporarily allow all for admin operations)
CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions FOR ALL USING (true);
CREATE POLICY "Admins can manage all payments" ON payments FOR ALL USING (true);
CREATE POLICY "Admins can manage all usage tracking" ON tier_usage_tracking FOR ALL USING (true);
