-- Fix 406 error when accessing visual_filter_tags table
-- This error typically indicates RLS (Row Level Security) issues

-- First, let's check the current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'visual_filter_tags';

-- Enable RLS if not already enabled
ALTER TABLE visual_filter_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own VFTs" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can insert their own VFTs" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can update their own VFTs" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can delete their own VFTs" ON visual_filter_tags;

-- Create comprehensive RLS policies for visual_filter_tags
CREATE POLICY "Users can view their own VFTs" ON visual_filter_tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own VFTs" ON visual_filter_tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VFTs" ON visual_filter_tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own VFTs" ON visual_filter_tags
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON visual_filter_tags TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Also fix vft_products table RLS policies
ALTER TABLE vft_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for vft_products
DROP POLICY IF EXISTS "Users can view their own VFT products" ON vft_products;
DROP POLICY IF EXISTS "Users can insert their own VFT products" ON vft_products;
DROP POLICY IF EXISTS "Users can update their own VFT products" ON vft_products;
DROP POLICY IF EXISTS "Users can delete their own VFT products" ON vft_products;

-- Create RLS policies for vft_products
CREATE POLICY "Users can view their own VFT products" ON vft_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM visual_filter_tags vft 
            WHERE vft.id = vft_products.vft_id 
            AND vft.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own VFT products" ON vft_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM visual_filter_tags vft 
            WHERE vft.id = vft_products.vft_id 
            AND vft.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own VFT products" ON vft_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM visual_filter_tags vft 
            WHERE vft.id = vft_products.vft_id 
            AND vft.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own VFT products" ON vft_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM visual_filter_tags vft 
            WHERE vft.id = vft_products.vft_id 
            AND vft.user_id = auth.uid()
        )
    );

-- Grant permissions for vft_products
GRANT SELECT, INSERT, UPDATE, DELETE ON vft_products TO authenticated;

-- Fix vft_categories table RLS policies
ALTER TABLE vft_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for vft_categories
DROP POLICY IF EXISTS "Users can view VFT categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can insert VFT categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can update VFT categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can delete VFT categories" ON vft_categories;

-- Create RLS policies for vft_categories (allow all authenticated users to read)
CREATE POLICY "Users can view VFT categories" ON vft_categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert VFT categories" ON vft_categories
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update VFT categories" ON vft_categories
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete VFT categories" ON vft_categories
    FOR DELETE TO authenticated USING (true);

-- Grant permissions for vft_categories
GRANT SELECT, INSERT, UPDATE, DELETE ON vft_categories TO authenticated;

-- Fix visual_scan_history table RLS policies
ALTER TABLE visual_scan_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for visual_scan_history
DROP POLICY IF EXISTS "Users can view their own scan history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can insert their own scan history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can update their own scan history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can delete their own scan history" ON visual_scan_history;

-- Create RLS policies for visual_scan_history
CREATE POLICY "Users can view their own scan history" ON visual_scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scan history" ON visual_scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scan history" ON visual_scan_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scan history" ON visual_scan_history
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions for visual_scan_history
GRANT SELECT, INSERT, UPDATE, DELETE ON visual_scan_history TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Test query to verify access
SELECT 'RLS policies updated successfully' as status;
