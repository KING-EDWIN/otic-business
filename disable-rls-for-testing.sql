-- Temporarily disable RLS for testing purposes
-- WARNING: This makes all data accessible to all authenticated users
-- Use only for debugging and testing, then re-enable RLS

-- Disable RLS on all public schema tables
DO $$ DECLARE
    r record;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
        RAISE NOTICE 'RLS disabled for table: %', r.tablename;
    END LOOP;
END $$;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- To re-enable RLS later, run the fix-rls-policies-comprehensive.sql script

