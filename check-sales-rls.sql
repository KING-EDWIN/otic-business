-- Check RLS status and policies on sales table
-- This script will help identify and fix RLS issues

-- Check if RLS is enabled on sales table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'sales';

-- Check existing policies on sales table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'sales';

-- If no policies exist, create appropriate RLS policies
-- Enable RLS on sales table
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own sales
CREATE POLICY "Users can view their own sales" ON sales
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own sales
CREATE POLICY "Users can insert their own sales" ON sales
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own sales
CREATE POLICY "Users can update their own sales" ON sales
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own sales
CREATE POLICY "Users can delete their own sales" ON sales
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'sales';
