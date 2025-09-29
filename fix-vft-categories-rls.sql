-- Fix vft_categories RLS policy and access control
-- This script fixes the access control error for vft_categories table

-- First, check if vft_categories table exists
DO $$
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vft_categories') THEN
        CREATE TABLE vft_categories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert some default categories
        INSERT INTO vft_categories (name, description) VALUES
        ('Electronics', 'Electronic devices and accessories'),
        ('Food & Beverages', 'Food items and drinks'),
        ('Clothing', 'Clothing and fashion items'),
        ('Home & Garden', 'Home improvement and garden supplies'),
        ('Health & Beauty', 'Health and beauty products'),
        ('Sports & Outdoors', 'Sports equipment and outdoor gear'),
        ('Books & Media', 'Books, movies, and media'),
        ('Automotive', 'Car parts and automotive supplies'),
        ('Toys & Games', 'Toys and games for children'),
        ('Office Supplies', 'Office and stationery supplies');
    END IF;
END $$;

-- Enable RLS
ALTER TABLE vft_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read vft_categories" ON vft_categories;
DROP POLICY IF EXISTS "Allow service role to manage vft_categories" ON vft_categories;

-- Create RLS Policies
CREATE POLICY "Allow authenticated users to read vft_categories" ON vft_categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage vft_categories" ON vft_categories
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON vft_categories TO authenticated;
GRANT ALL ON vft_categories TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vft_categories_name ON vft_categories(name);

-- Verify the setup
SELECT 'vft_categories table setup completed successfully!' as status;
SELECT COUNT(*) as category_count FROM vft_categories;
