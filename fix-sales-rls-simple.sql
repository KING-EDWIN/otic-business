-- Simple RLS fix for sales table
-- Run this in Supabase SQL Editor

-- Enable RLS on sales table
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;

-- Create new policies
CREATE POLICY "Users can view their own sales" ON sales
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" ON sales
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" ON sales
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" ON sales
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verify the policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'sales';
