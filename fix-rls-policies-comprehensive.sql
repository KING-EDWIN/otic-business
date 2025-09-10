-- Comprehensive RLS Policy Fix for Otic Business
-- This script addresses all access control issues

-- First, let's check the current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'products', 'sales', 'customers', 'expenses', 'subscriptions')
ORDER BY tablename;

-- Check existing policies
SELECT 
    nsp.nspname AS schema_name,
    rel.relname AS table_name,
    pol.polname AS policy_name,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command,
    pg_get_expr(pol.polqual, pol.polrelid) AS using_expression
FROM pg_policy pol
JOIN pg_class rel ON rel.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname IN ('user_profiles', 'products', 'sales', 'customers', 'expenses', 'subscriptions')
ORDER BY table_name, policy_name;

-- Step 1: Temporarily disable RLS for testing (OPTIONAL - for debugging only)
-- WARNING: Only use this for testing, then re-enable RLS
-- ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own profile" ON public.user_profiles;

-- Step 3: Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create comprehensive policies for user_profiles
-- Policy for SELECT (viewing profiles)
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy for INSERT (creating profiles) - Allow authenticated users to create their own profile
CREATE POLICY "Users can create their own profile" ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy for UPDATE (updating profiles)
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy for DELETE (deleting profiles)
CREATE POLICY "Users can delete their own profile" ON public.user_profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- Step 5: Fix other tables if they exist
-- Products table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated users to view their own products" ON public.products;
        DROP POLICY IF EXISTS "Allow authenticated users to insert their own products" ON public.products;
        DROP POLICY IF EXISTS "Allow authenticated users to update their own products" ON public.products;
        DROP POLICY IF EXISTS "Allow authenticated users to delete their own products" ON public.products;
        
        CREATE POLICY "Users can view their own products" ON public.products
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own products" ON public.products
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own products" ON public.products
            FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own products" ON public.products
            FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- Sales table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sales') THEN
        ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated users to view their own sales" ON public.sales;
        DROP POLICY IF EXISTS "Allow authenticated users to insert their own sales" ON public.sales;
        DROP POLICY IF EXISTS "Allow authenticated users to update their own sales" ON public.sales;
        DROP POLICY IF EXISTS "Allow authenticated users to delete their own sales" ON public.sales;
        
        CREATE POLICY "Users can view their own sales" ON public.sales
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own sales" ON public.sales
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own sales" ON public.sales
            FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own sales" ON public.sales
            FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- Customers table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated users to view their own customers" ON public.customers;
        DROP POLICY IF EXISTS "Allow authenticated users to insert their own customers" ON public.customers;
        DROP POLICY IF EXISTS "Allow authenticated users to update their own customers" ON public.customers;
        DROP POLICY IF EXISTS "Allow authenticated users to delete their own customers" ON public.customers;
        
        CREATE POLICY "Users can view their own customers" ON public.customers
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own customers" ON public.customers
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own customers" ON public.customers
            FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own customers" ON public.customers
            FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- Subscriptions table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated users to view their own subscriptions" ON public.subscriptions;
        DROP POLICY IF EXISTS "Allow authenticated users to insert their own subscriptions" ON public.subscriptions;
        DROP POLICY IF EXISTS "Allow authenticated users to update their own subscriptions" ON public.subscriptions;
        DROP POLICY IF EXISTS "Allow authenticated users to delete their own subscriptions" ON public.subscriptions;
        
        CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
            FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
            FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- Step 6: Verify the policies are working
SELECT 
    nsp.nspname AS schema_name,
    rel.relname AS table_name,
    pol.polname AS policy_name,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command
FROM pg_policy pol
JOIN pg_class rel ON rel.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname IN ('user_profiles', 'products', 'sales', 'customers', 'subscriptions')
ORDER BY table_name, policy_name;

-- Step 7: Test query (this should work if policies are correct)
-- Note: This will only work if you're authenticated
-- SELECT auth.uid() as current_user_id;

-- Step 8: Check if there are any issues with the auth schema
-- This query might fail if you don't have superuser permissions, which is normal
-- SELECT * FROM auth.users LIMIT 1;
