-- Check and create missing tables if needed
-- This script will check for inventory and orders tables and create them if they don't exist

-- Check if inventory table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory' AND table_schema = 'public') THEN
        -- Create inventory table
        CREATE TABLE inventory (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            location VARCHAR(255),
            quantity INTEGER NOT NULL DEFAULT 0,
            last_restock_date TIMESTAMP WITH TIME ZONE,
            expiry_date TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_inventory_business_id ON inventory(business_id);
        CREATE INDEX idx_inventory_product_id ON inventory(product_id);
        CREATE INDEX idx_inventory_location ON inventory(location);
        
        -- Disable RLS
        ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
        
        -- Grant permissions
        GRANT ALL ON TABLE inventory TO authenticated;
        
        RAISE NOTICE 'Created inventory table';
    ELSE
        RAISE NOTICE 'inventory table already exists';
    END IF;
END $$;

-- Check if orders table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        -- Create orders table
        CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
            customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
            order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
            order_status VARCHAR(50) NOT NULL DEFAULT 'pending',
            shipping_address JSONB,
            billing_address JSONB,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_orders_business_id ON orders(business_id);
        CREATE INDEX idx_orders_customer_id ON orders(customer_id);
        CREATE INDEX idx_orders_order_date ON orders(order_date);
        CREATE INDEX idx_orders_status ON orders(order_status);
        
        -- Disable RLS
        ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
        
        -- Grant permissions
        GRANT ALL ON TABLE orders TO authenticated;
        
        RAISE NOTICE 'Created orders table';
    ELSE
        RAISE NOTICE 'orders table already exists';
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Missing tables check and creation completed' as status;
