-- Setup Payment Transactions Table for Flutterwave Integration
-- Run this script in your Supabase SQL Editor

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_ref TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  payment_method VARCHAR(50) NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  description TEXT,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flutterwave_tx_id TEXT,
  flutterwave_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_business_id ON payment_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_tx_ref ON payment_transactions(tx_ref);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Enable Row Level Security
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own payment transactions
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payment transactions
CREATE POLICY "Users can insert own payment transactions" ON payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment transactions
CREATE POLICY "Users can update own payment transactions" ON payment_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Business owners can see transactions for their businesses
CREATE POLICY "Business owners can view business transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_memberships bm
      WHERE bm.business_id = payment_transactions.business_id
      AND bm.user_id = auth.uid()
      AND bm.role = 'owner'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transactions_updated_at();

-- Create function to get payment statistics
CREATE OR REPLACE FUNCTION get_payment_stats(user_id_param UUID, business_id_param UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_transactions', COUNT(*),
    'successful_transactions', COUNT(*) FILTER (WHERE status = 'successful'),
    'failed_transactions', COUNT(*) FILTER (WHERE status = 'failed'),
    'pending_transactions', COUNT(*) FILTER (WHERE status = 'pending'),
    'total_amount', COALESCE(SUM(amount) FILTER (WHERE status = 'successful'), 0),
    'total_amount_ugx', COALESCE(SUM(amount) FILTER (WHERE status = 'successful' AND currency = 'UGX'), 0),
    'total_amount_usd', COALESCE(SUM(amount) FILTER (WHERE status = 'successful' AND currency = 'USD'), 0),
    'average_transaction', COALESCE(AVG(amount) FILTER (WHERE status = 'successful'), 0),
    'last_transaction_date', MAX(created_at) FILTER (WHERE status = 'successful')
  ) INTO result
  FROM payment_transactions
  WHERE user_id = user_id_param
  AND (business_id_param IS NULL OR business_id = business_id_param);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_payment_stats(UUID, UUID) TO authenticated;

-- Create function to get recent payment transactions
CREATE OR REPLACE FUNCTION get_recent_payments(user_id_param UUID, business_id_param UUID DEFAULT NULL, limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  tx_ref TEXT,
  amount DECIMAL(12,2),
  currency VARCHAR(3),
  status VARCHAR(20),
  payment_method VARCHAR(50),
  customer_email TEXT,
  customer_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id,
    pt.tx_ref,
    pt.amount,
    pt.currency,
    pt.status,
    pt.payment_method,
    pt.customer_email,
    pt.customer_name,
    pt.description,
    pt.created_at,
    pt.updated_at
  FROM payment_transactions pt
  WHERE pt.user_id = user_id_param
  AND (business_id_param IS NULL OR pt.business_id = business_id_param)
  ORDER BY pt.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_recent_payments(UUID, UUID, INTEGER) TO authenticated;

-- Insert sample payment methods data
INSERT INTO payment_transactions (tx_ref, amount, currency, status, payment_method, customer_email, customer_name, description, user_id)
VALUES 
  ('sample_001', 50000.00, 'UGX', 'successful', 'mobilemoney', 'sample@example.com', 'Sample Customer', 'Sample payment transaction', auth.uid())
ON CONFLICT (tx_ref) DO NOTHING;

-- Create view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as payment_date,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'successful') as successful_transactions,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_transactions,
  SUM(amount) FILTER (WHERE status = 'successful') as total_amount,
  AVG(amount) FILTER (WHERE status = 'successful') as average_amount,
  currency
FROM payment_transactions
GROUP BY DATE_TRUNC('day', created_at), currency
ORDER BY payment_date DESC;

-- Grant access to the view
GRANT SELECT ON payment_analytics TO authenticated;

COMMENT ON TABLE payment_transactions IS 'Stores payment transaction data from Flutterwave';
COMMENT ON COLUMN payment_transactions.tx_ref IS 'Unique transaction reference';
COMMENT ON COLUMN payment_transactions.flutterwave_tx_id IS 'Flutterwave transaction ID';
COMMENT ON COLUMN payment_transactions.flutterwave_reference IS 'Flutterwave reference number';
