-- User Flow Database Tables
-- This script creates all necessary tables for the new business/individual signup flow

-- 1. User Types Table
CREATE TABLE IF NOT EXISTS user_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert user types
INSERT INTO user_types (name, description) VALUES 
('business', 'Business owners and organizations'),
('individual', 'Individual professionals and managers')
ON CONFLICT (name) DO NOTHING;

-- 2. Individual Professions Table
CREATE TABLE IF NOT EXISTS individual_professions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert professions
INSERT INTO individual_professions (name, description) VALUES 
('finance', 'Finance professionals, accountants, financial analysts'),
('manager', 'Business managers, operations managers, team leaders')
ON CONFLICT (name) DO NOTHING;

-- 3. Business Signup Table (extends user_profiles)
CREATE TABLE IF NOT EXISTS business_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry_sector VARCHAR(100) NOT NULL,
  city_of_operation VARCHAR(100) NOT NULL,
  country_of_operation VARCHAR(100) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  physical_address TEXT NOT NULL,
  key_contact_person VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  trial_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Individual Signup Table
CREATE TABLE IF NOT EXISTS individual_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profession_id UUID REFERENCES individual_professions(id),
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tier Subscriptions Table
CREATE TABLE IF NOT EXISTS tier_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES business_signups(id) ON DELETE CASCADE,
  tier_name VARCHAR(50) NOT NULL, -- 'basic', 'standard', 'premium'
  tier_display_name VARCHAR(100) NOT NULL, -- 'Start Smart', 'Grow with Intelligence', 'Enterprise Advantage'
  price_ugx INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'trial', -- 'trial', 'active', 'cancelled', 'expired'
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Business Invitations Table
CREATE TABLE IF NOT EXISTS business_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES business_signups(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invited_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'manager', -- 'manager', 'viewer', 'admin'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  invitation_token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Individual Business Access Table
CREATE TABLE IF NOT EXISTS individual_business_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  individual_id UUID REFERENCES individual_signups(id) ON DELETE CASCADE,
  business_id UUID REFERENCES business_signups(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES business_invitations(id) ON DELETE CASCADE,
  access_level VARCHAR(50) DEFAULT 'manager', -- 'manager', 'viewer', 'admin'
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tier Recommendation Questions Table
CREATE TABLE IF NOT EXISTS tier_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'number', 'text'
  options JSONB, -- For multiple choice questions
  tier_weights JSONB NOT NULL, -- Weights for each tier based on answer
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert tier recommendation questions
INSERT INTO tier_questions (question_text, question_type, options, tier_weights, order_index) VALUES 
('How many employees does your business have?', 'multiple_choice', 
 '["1-5", "6-20", "21-50", "51-100", "100+"]',
 '{"basic": 0.8, "standard": 0.6, "premium": 0.2}',
 1),
('What is your monthly revenue in UGX?', 'multiple_choice',
 '["Under 1M", "1M-5M", "5M-20M", "20M-50M", "50M+"]',
 '{"basic": 0.9, "standard": 0.7, "premium": 0.3}',
 2),
('How many locations do you operate from?', 'multiple_choice',
 '["1 location", "2-3 locations", "4-10 locations", "10+ locations"]',
 '{"basic": 0.9, "standard": 0.6, "premium": 0.2}',
 3),
('Do you need multi-user access?', 'multiple_choice',
 '["No, just me", "2-5 users", "6-20 users", "20+ users"]',
 '{"basic": 0.2, "standard": 0.7, "premium": 0.9}',
 4),
('Do you need advanced reporting and analytics?', 'multiple_choice',
 '["Basic reports only", "Standard reports", "Advanced analytics", "AI-powered insights"]',
 '{"basic": 0.8, "standard": 0.6, "premium": 0.3}',
 5),
('Do you need third-party integrations?', 'multiple_choice',
 '["No integrations needed", "Basic integrations", "Advanced integrations", "Custom integrations"]',
 '{"basic": 0.9, "standard": 0.5, "premium": 0.2}',
 6);

-- 9. Tier Recommendation Responses Table
CREATE TABLE IF NOT EXISTS tier_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  question_id UUID REFERENCES tier_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Update user_profiles table to include user_type
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'business';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS individual_profession_id UUID REFERENCES individual_professions(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_signups_user_id ON business_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_signups_user_id ON individual_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_subscriptions_user_id ON tier_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_email ON business_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_individual_business_access_individual_id ON individual_business_access(individual_id);
CREATE INDEX IF NOT EXISTS idx_individual_business_access_business_id ON individual_business_access(business_id);

-- RLS Policies
ALTER TABLE business_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_business_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_responses ENABLE ROW LEVEL SECURITY;

-- Business signups policies
CREATE POLICY "Users can view their own business signup" ON business_signups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business signup" ON business_signups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business signup" ON business_signups
  FOR UPDATE USING (auth.uid() = user_id);

-- Individual signups policies
CREATE POLICY "Users can view their own individual signup" ON individual_signups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own individual signup" ON individual_signups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own individual signup" ON individual_signups
  FOR UPDATE USING (auth.uid() = user_id);

-- Tier subscriptions policies
CREATE POLICY "Users can view their own tier subscriptions" ON tier_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tier subscriptions" ON tier_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Business invitations policies
CREATE POLICY "Users can view invitations for their businesses" ON business_invitations
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM business_signups WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invitations for their businesses" ON business_invitations
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM business_signups WHERE user_id = auth.uid()
    )
  );

-- Individual business access policies
CREATE POLICY "Users can view their business access" ON individual_business_access
  FOR SELECT USING (
    individual_id IN (
      SELECT id FROM individual_signups WHERE user_id = auth.uid()
    )
  );

-- Tier responses policies (public for anonymous users)
CREATE POLICY "Anyone can insert tier responses" ON tier_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view tier responses" ON tier_responses
  FOR SELECT USING (true);
