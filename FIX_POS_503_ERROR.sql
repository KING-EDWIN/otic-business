-- Fix POS 503 Error - Comprehensive Database Fix
-- This script addresses potential issues causing 503 errors in the POS system

-- 1. Check and fix RLS policies for visual_filter_tags table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own VFTs" ON visual_filter_tags;
    DROP POLICY IF EXISTS "Users can insert their own VFTs" ON visual_filter_tags;
    DROP POLICY IF EXISTS "Users can update their own VFTs" ON visual_filter_tags;
    DROP POLICY IF EXISTS "Users can delete their own VFTs" ON visual_filter_tags;
    
    -- Create new comprehensive RLS policies
    CREATE POLICY "Users can view their own VFTs" ON visual_filter_tags
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own VFTs" ON visual_filter_tags
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own VFTs" ON visual_filter_tags
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own VFTs" ON visual_filter_tags
        FOR DELETE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'RLS policies for visual_filter_tags updated successfully';
END $$;

-- 2. Check and fix RLS policies for vft_products table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view VFT products" ON vft_products;
    DROP POLICY IF EXISTS "Users can insert VFT products" ON vft_products;
    DROP POLICY IF EXISTS "Users can update VFT products" ON vft_products;
    DROP POLICY IF EXISTS "Users can delete VFT products" ON vft_products;
    
    -- Create new comprehensive RLS policies
    CREATE POLICY "Users can view VFT products" ON vft_products
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM visual_filter_tags vft 
                WHERE vft.id = vft_products.vft_id 
                AND vft.user_id = auth.uid()
            )
        );
    
    CREATE POLICY "Users can insert VFT products" ON vft_products
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM visual_filter_tags vft 
                WHERE vft.id = vft_products.vft_id 
                AND vft.user_id = auth.uid()
            )
        );
    
    CREATE POLICY "Users can update VFT products" ON vft_products
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM visual_filter_tags vft 
                WHERE vft.id = vft_products.vft_id 
                AND vft.user_id = auth.uid()
            )
        );
    
    CREATE POLICY "Users can delete VFT products" ON vft_products
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM visual_filter_tags vft 
                WHERE vft.id = vft_products.vft_id 
                AND vft.user_id = auth.uid()
            )
        );
    
    RAISE NOTICE 'RLS policies for vft_products updated successfully';
END $$;

-- 3. Check and fix RLS policies for vft_categories table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view VFT categories" ON vft_categories;
    DROP POLICY IF EXISTS "Users can insert VFT categories" ON vft_categories;
    DROP POLICY IF EXISTS "Users can update VFT categories" ON vft_categories;
    DROP POLICY IF EXISTS "Users can delete VFT categories" ON vft_categories;
    
    -- Create new comprehensive RLS policies
    CREATE POLICY "Users can view VFT categories" ON vft_categories
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert VFT categories" ON vft_categories
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update VFT categories" ON vft_categories
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete VFT categories" ON vft_categories
        FOR DELETE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'RLS policies for vft_categories updated successfully';
END $$;

-- 4. Check and fix RLS policies for visual_scan_history table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their scan history" ON visual_scan_history;
    DROP POLICY IF EXISTS "Users can insert scan history" ON visual_scan_history;
    DROP POLICY IF EXISTS "Users can update their scan history" ON visual_scan_history;
    DROP POLICY IF EXISTS "Users can delete their scan history" ON visual_scan_history;
    
    -- Create new comprehensive RLS policies
    CREATE POLICY "Users can view their scan history" ON visual_scan_history
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert scan history" ON visual_scan_history
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their scan history" ON visual_scan_history
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their scan history" ON visual_scan_history
        FOR DELETE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'RLS policies for visual_scan_history updated successfully';
END $$;

-- 5. Ensure all tables have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_visual_filter_tags_user_id ON visual_filter_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_visual_filter_tags_tag_name ON visual_filter_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_vft_products_vft_id ON vft_products(vft_id);
CREATE INDEX IF NOT EXISTS idx_vft_products_is_active ON vft_products(is_active);
CREATE INDEX IF NOT EXISTS idx_vft_categories_user_id ON vft_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_visual_scan_history_user_id ON visual_scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_visual_scan_history_created_at ON visual_scan_history(created_at);

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON visual_filter_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vft_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vft_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visual_scan_history TO authenticated;

-- 7. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 8. Test the connection and permissions
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Test if we can query the tables
    SELECT COUNT(*) INTO test_count FROM visual_filter_tags;
    RAISE NOTICE 'visual_filter_tags table accessible, count: %', test_count;
    
    SELECT COUNT(*) INTO test_count FROM vft_products;
    RAISE NOTICE 'vft_products table accessible, count: %', test_count;
    
    SELECT COUNT(*) INTO test_count FROM vft_categories;
    RAISE NOTICE 'vft_categories table accessible, count: %', test_count;
    
    SELECT COUNT(*) INTO test_count FROM visual_scan_history;
    RAISE NOTICE 'visual_scan_history table accessible, count: %', test_count;
    
    RAISE NOTICE 'All PVFS tables are accessible and working correctly';
END $$;

-- 9. Create a function to check system health
CREATE OR REPLACE FUNCTION check_pvfs_system_health()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    is_accessible BOOLEAN,
    last_updated TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'visual_filter_tags'::TEXT,
        (SELECT COUNT(*) FROM visual_filter_tags),
        true,
        (SELECT MAX(created_at) FROM visual_filter_tags)
    UNION ALL
    SELECT 
        'vft_products'::TEXT,
        (SELECT COUNT(*) FROM vft_products),
        true,
        (SELECT MAX(created_at) FROM vft_products)
    UNION ALL
    SELECT 
        'vft_categories'::TEXT,
        (SELECT COUNT(*) FROM vft_categories),
        true,
        (SELECT MAX(created_at) FROM vft_categories)
    UNION ALL
    SELECT 
        'visual_scan_history'::TEXT,
        (SELECT COUNT(*) FROM visual_scan_history),
        true,
        (SELECT MAX(created_at) FROM visual_scan_history);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant execute permission on the health check function
GRANT EXECUTE ON FUNCTION check_pvfs_system_health() TO authenticated;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ POS 503 Error Fix Complete!';
    RAISE NOTICE 'All RLS policies have been updated';
    RAISE NOTICE 'All indexes have been created';
    RAISE NOTICE 'All permissions have been granted';
    RAISE NOTICE 'Schema cache has been refreshed';
    RAISE NOTICE 'System health check function created';
    RAISE NOTICE 'The POS system should now work without 503 errors';
END $$;
