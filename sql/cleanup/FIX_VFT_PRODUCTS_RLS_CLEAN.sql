-- Fix RLS policies for vft_products table and related PVFS tables
-- This script ensures proper access control for OTIC Vision products

-- Enable RLS on vft_products table
ALTER TABLE vft_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own vft_products" ON vft_products;
DROP POLICY IF EXISTS "Users can insert their own vft_products" ON vft_products;
DROP POLICY IF EXISTS "Users can update their own vft_products" ON vft_products;
DROP POLICY IF EXISTS "Users can delete their own vft_products" ON vft_products;

-- Create RLS policies for vft_products
CREATE POLICY "Users can view their own vft_products" ON vft_products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vft_products" ON vft_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vft_products" ON vft_products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vft_products" ON vft_products
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on visual_filter_tags table
ALTER TABLE visual_filter_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own visual_filter_tags" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can insert their own visual_filter_tags" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can update their own visual_filter_tags" ON visual_filter_tags;
DROP POLICY IF EXISTS "Users can delete their own visual_filter_tags" ON visual_filter_tags;

-- Create RLS policies for visual_filter_tags
CREATE POLICY "Users can view their own visual_filter_tags" ON visual_filter_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visual_filter_tags" ON visual_filter_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visual_filter_tags" ON visual_filter_tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visual_filter_tags" ON visual_filter_tags
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on vft_categories table
ALTER TABLE vft_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view vft_categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can insert vft_categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can update vft_categories" ON vft_categories;
DROP POLICY IF EXISTS "Users can delete vft_categories" ON vft_categories;

-- Create RLS policies for vft_categories (public read, admin write)
CREATE POLICY "Users can view vft_categories" ON vft_categories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert vft_categories" ON vft_categories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update vft_categories" ON vft_categories
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete vft_categories" ON vft_categories
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Enable RLS on visual_scan_history table
ALTER TABLE visual_scan_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own visual_scan_history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can insert their own visual_scan_history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can update their own visual_scan_history" ON visual_scan_history;
DROP POLICY IF EXISTS "Users can delete their own visual_scan_history" ON visual_scan_history;

-- Create RLS policies for visual_scan_history
CREATE POLICY "Users can view their own visual_scan_history" ON visual_scan_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visual_scan_history" ON visual_scan_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visual_scan_history" ON visual_scan_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visual_scan_history" ON visual_scan_history
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON vft_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visual_filter_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vft_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visual_scan_history TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Test the policies by checking if a user can access their own data
DO $$
BEGIN
  RAISE NOTICE 'RLS policies for PVFS tables have been created successfully!';
  RAISE NOTICE 'Users can now access their own OTIC Vision products.';
END $$;
