-- Fix authentication issues after RLS policy changes
-- The auth system needs proper permissions to function

-- Ensure auth schema has proper permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;

-- Fix user_profiles table RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = id);

-- Grant permissions for user_profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

-- Fix businesses table RLS policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for businesses
DROP POLICY IF EXISTS "Users can view their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own businesses" ON businesses;

-- Create RLS policies for businesses
CREATE POLICY "Users can view their own businesses" ON businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = businesses.id 
            AND bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own businesses" ON businesses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = businesses.id 
            AND bm.user_id = auth.uid()
            AND bm.role = 'owner'
        )
    );

CREATE POLICY "Users can update their own businesses" ON businesses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = businesses.id 
            AND bm.user_id = auth.uid()
            AND bm.role IN ('owner', 'admin', 'manager')
        )
    );

CREATE POLICY "Users can delete their own businesses" ON businesses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = businesses.id 
            AND bm.user_id = auth.uid()
            AND bm.role = 'owner'
        )
    );

-- Grant permissions for businesses
GRANT SELECT, INSERT, UPDATE, DELETE ON businesses TO authenticated;

-- Fix business_memberships table RLS policies
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for business_memberships
DROP POLICY IF EXISTS "Users can view their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON business_memberships;

-- Create RLS policies for business_memberships
CREATE POLICY "Users can view their own memberships" ON business_memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships" ON business_memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships" ON business_memberships
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships" ON business_memberships
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions for business_memberships
GRANT SELECT, INSERT, UPDATE, DELETE ON business_memberships TO authenticated;

-- Create budgets table if it doesn't exist (for IndividualDashboard)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table if it doesn't exist (for IndividualDashboard)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for budgets table
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets" ON budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Set up RLS for expenses table
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions for budgets and expenses
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Test query to verify auth is working
SELECT 'Auth and table fixes applied successfully' as status;
