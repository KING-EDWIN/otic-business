-- Flutterwave Orders Table Setup
-- Following the OTIC Business integration plan specification
-- Run this in your Supabase SQL Editor

-- Orders table for Flutterwave payments
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tx_ref VARCHAR(100) UNIQUE NOT NULL,
  transaction_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'UGX',
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  tier VARCHAR(20) CHECK (tier IN ('basic', 'standard', 'premium')),
  description TEXT,
  flutterwave_tx_id VARCHAR(100),
  flutterwave_reference VARCHAR(100),
  payment_method VARCHAR(50) DEFAULT 'flutterwave',
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_tx_ref ON orders(tx_ref);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);

-- Enable RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL USING (true); -- In production, add proper admin check

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO orders (tx_ref, amount, currency, customer_name, customer_email, customer_phone, user_id, tier, description, payment_status) VALUES
  ('OTIC-1703123456789-abc123def', 50000, 'UGX', 'John Doe', 'john@example.com', '+256700000000', '00000000-0000-0000-0000-000000000001', 'basic', 'Start Smart Plan - Basic Features', 'paid'),
  ('OTIC-1703123456790-def456ghi', 150000, 'UGX', 'Jane Smith', 'jane@example.com', '+256700000001', '00000000-0000-0000-0000-000000000001', 'standard', 'Grow with Intelligence Plan - Advanced Features', 'pending')
ON CONFLICT (tx_ref) DO NOTHING;

-- Create a view for order summaries
CREATE OR REPLACE VIEW order_summaries AS
SELECT 
  o.id,
  o.tx_ref,
  o.transaction_id,
  o.amount,
  o.currency,
  o.payment_status,
  o.customer_name,
  o.customer_email,
  o.customer_phone,
  o.created_at,
  o.updated_at,
  o.tier,
  o.description,
  o.payment_method,
  up.full_name as user_name,
  up.business_name,
  b.name as business_name_from_business_table
FROM orders o
LEFT JOIN user_profiles up ON o.user_id = up.id
LEFT JOIN businesses b ON o.business_id = b.id;

-- Grant permissions
GRANT SELECT ON order_summaries TO authenticated;
GRANT ALL ON orders TO authenticated;
