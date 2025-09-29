-- Create tokens table for payment system
-- Run this in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  value INTEGER NOT NULL, -- Token value in UGX
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  discount_percentage INTEGER,
  discount_amount INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tokens
CREATE POLICY "Users can view active tokens" ON tokens
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can use tokens" ON tokens
  FOR UPDATE USING (
    is_active = true 
    AND is_used = false 
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Create RLS policies for coupons
CREATE POLICY "Users can view active coupons" ON coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can use coupons" ON coupons
  FOR UPDATE USING (
    is_active = true 
    AND is_used = false 
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Insert sample tokens
INSERT INTO tokens (code, value, description, expires_at) VALUES
('TOKEN001', 50000, '50,000 UGX Token', NOW() + INTERVAL '1 year'),
('TOKEN002', 100000, '100,000 UGX Token', NOW() + INTERVAL '1 year'),
('TOKEN003', 200000, '200,000 UGX Token', NOW() + INTERVAL '1 year'),
('TOKEN004', 500000, '500,000 UGX Token', NOW() + INTERVAL '1 year'),
('TOKEN005', 1000000, '1,000,000 UGX Token', NOW() + INTERVAL '1 year');

-- Insert sample coupons
INSERT INTO coupons (code, discount_percentage, description, expires_at) VALUES
('SAVE10', 10, '10% Discount', NOW() + INTERVAL '1 year'),
('SAVE20', 20, '20% Discount', NOW() + INTERVAL '1 year'),
('SAVE50', 50, '50% Discount', NOW() + INTERVAL '1 year'),
('FREE01', 100, 'Free Trial', NOW() + INTERVAL '1 year');

-- Verify the tables were created
SELECT 'tokens' as table_name, COUNT(*) as count FROM tokens
UNION ALL
SELECT 'coupons' as table_name, COUNT(*) as count FROM coupons;
