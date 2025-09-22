-- Add Flutterwave-specific columns to existing orders table
-- This script modifies the existing orders table to support Flutterwave payments
-- Run this in your Supabase SQL Editor

-- Step 1: Add Flutterwave-specific columns to existing orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tx_ref VARCHAR(100),
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'UGX',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS flutterwave_tx_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS flutterwave_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'flutterwave',
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) CHECK (tier IN ('basic', 'standard', 'premium')),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 2: Add unique constraint on tx_ref (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_tx_ref' 
        AND conrelid = 'orders'::regclass
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT unique_tx_ref UNIQUE (tx_ref);
    END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_tx_ref ON orders(tx_ref);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Step 4: Update existing orders to have default values for new columns
UPDATE orders 
SET 
  currency = 'UGX',
  payment_status = 'pending',
  payment_method = 'flutterwave'
WHERE currency IS NULL OR payment_status IS NULL OR payment_method IS NULL;

-- Step 5: Create a view for Flutterwave order summaries
CREATE OR REPLACE VIEW flutterwave_order_summaries AS
SELECT 
  o.id,
  o.tx_ref,
  o.transaction_id,
  o.total_amount as amount,
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
  o.flutterwave_tx_id,
  o.flutterwave_reference,
  up.full_name as user_name,
  up.business_name,
  b.name as business_name_from_business_table
FROM orders o
LEFT JOIN user_profiles up ON o.business_id = b.created_by
LEFT JOIN businesses b ON o.business_id = b.id
WHERE o.tx_ref IS NOT NULL; -- Only show Flutterwave orders

-- Step 6: Grant permissions
GRANT SELECT ON flutterwave_order_summaries TO authenticated;
GRANT ALL ON orders TO authenticated;

-- Step 7: Insert sample Flutterwave orders for testing (only if businesses exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM businesses LIMIT 1) THEN
        INSERT INTO orders (
          business_id,
          customer_id,
          order_number,
          status,
          total_amount,
          tx_ref,
          transaction_id,
          currency,
          payment_status,
          customer_name,
          customer_email,
          customer_phone,
          tier,
          description,
          payment_method,
          created_at,
          updated_at
        ) VALUES
          (
            (SELECT id FROM businesses LIMIT 1),
            NULL,
            'OTIC-1703123456789-abc123def',
            'completed',
            50000,
            'OTIC-1703123456789-abc123def',
            '123456789',
            'UGX',
            'paid',
            'John Doe',
            'john@example.com',
            '+256700000000',
            'basic',
            'Start Smart Plan - Basic Features',
            'flutterwave',
            NOW(),
            NOW()
          ),
          (
            (SELECT id FROM businesses LIMIT 1),
            NULL,
            'OTIC-1703123456790-def456ghi',
            'pending',
            150000,
            'OTIC-1703123456790-def456ghi',
            '123456790',
            'UGX',
            'pending',
            'Jane Smith',
            'jane@example.com',
            '+256700000001',
            'standard',
            'Grow with Intelligence Plan - Advanced Features',
            'flutterwave',
            NOW(),
            NOW()
          )
        ON CONFLICT (tx_ref) DO NOTHING;
    END IF;
END $$;

-- Step 8: Create function to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status(
  p_tx_ref VARCHAR(100),
  p_transaction_id VARCHAR(100),
  p_payment_status VARCHAR(20),
  p_flutterwave_tx_id VARCHAR(100) DEFAULT NULL,
  p_flutterwave_reference VARCHAR(100) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE orders 
  SET 
    transaction_id = p_transaction_id,
    payment_status = p_payment_status,
    flutterwave_tx_id = p_flutterwave_tx_id,
    flutterwave_reference = p_flutterwave_reference,
    updated_at = NOW()
  WHERE tx_ref = p_tx_ref;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_order_payment_status TO authenticated;

-- Success message
SELECT 'Flutterwave columns added to orders table successfully!' as result;
