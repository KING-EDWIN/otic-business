-- Simple Flutterwave Setup - Run this if the main script has issues
-- This is a simplified version that adds Flutterwave columns to existing orders table

-- Step 1: Add Flutterwave columns to existing orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tx_ref VARCHAR(100),
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'UGX',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS flutterwave_tx_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS flutterwave_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'flutterwave',
ADD COLUMN IF NOT EXISTS tier VARCHAR(20),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 2: Add constraint for tx_ref uniqueness
ALTER TABLE orders ADD CONSTRAINT unique_tx_ref UNIQUE (tx_ref);

-- Step 3: Create indexes
CREATE INDEX idx_orders_tx_ref ON orders(tx_ref);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Step 4: Update existing orders with default values
UPDATE orders 
SET 
  currency = 'UGX',
  payment_status = 'pending',
  payment_method = 'flutterwave'
WHERE currency IS NULL OR payment_status IS NULL OR payment_method IS NULL;

-- Success message
SELECT 'Flutterwave columns added successfully!' as result;
