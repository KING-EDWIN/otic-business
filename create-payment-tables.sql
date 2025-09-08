-- Payment System Tables
-- Run this in your Supabase SQL Editor

-- Payment requests table
CREATE TABLE payment_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_proof_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  notes TEXT
);

-- Payment history table (for tracking all payments)
CREATE TABLE payment_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  payment_request_id UUID REFERENCES payment_requests(id) ON DELETE SET NULL,
  tier VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payment requests" ON payment_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment requests" ON payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment requests" ON payment_requests
  FOR ALL USING (true); -- In production, add proper admin check

CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert payment history" ON payment_history
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_created_at ON payment_requests(created_at);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);

-- Insert sample payment methods data
INSERT INTO payment_requests (user_id, tier, amount, payment_method, status, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'premium', 300000, 'mtn_mobile_money', 'verified', 'Demo payment - verified'),
  ('00000000-0000-0000-0000-000000000001', 'standard', 150000, 'bank_transfer', 'verified', 'Demo payment - verified')
ON CONFLICT DO NOTHING;

