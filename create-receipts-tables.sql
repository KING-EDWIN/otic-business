-- Create receipts and receipt_items tables for POS system
-- This script creates the missing tables needed for sales processing

-- 1. Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    receipt_number TEXT NOT NULL UNIQUE,
    total_amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit', 'mobile_money', 'card')),
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    customer_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Create receipt_items table
CREATE TABLE IF NOT EXISTS receipt_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_business_id ON receipts(business_id);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_product_id ON receipt_items(product_id);

-- 4. Enable Row Level Security
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for receipts
DROP POLICY IF EXISTS "Allow business owners to manage receipts" ON receipts;
CREATE POLICY "Allow business owners to manage receipts" ON receipts
    FOR ALL USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

-- 6. Create RLS policies for receipt_items
DROP POLICY IF EXISTS "Allow business owners to manage receipt_items" ON receipt_items;
CREATE POLICY "Allow business owners to manage receipt_items" ON receipt_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM receipts r 
            WHERE r.id = receipt_id AND r.business_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM receipts r 
            WHERE r.id = receipt_id AND r.business_id = auth.uid()
        )
    );

-- 7. Grant permissions
GRANT ALL ON receipts TO authenticated;
GRANT ALL ON receipt_items TO authenticated;
GRANT ALL ON receipts TO service_role;
GRANT ALL ON receipt_items TO service_role;

-- 8. Create function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    receipt_num TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate receipt number in format RCP-YYYYMMDD-XXXX
        receipt_num := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if receipt number already exists
        SELECT COUNT(*) INTO exists_count FROM receipts WHERE receipt_number = receipt_num;
        
        -- If receipt number doesn't exist, return it
        IF exists_count = 0 THEN
            RETURN receipt_num;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION generate_receipt_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_receipt_number() TO service_role;

-- 10. Verify the setup
SELECT 'Receipts tables created successfully!' as status;
