-- Fix user_profiles access control issues
-- This script ensures proper RLS policies for user_profiles table

-- First, let's check current policies
SELECT 'Current Policies' as info, schemaname, tablename, policyname, cmd, array_to_string(roles, ', ') as roles
FROM pg_policies 
WHERE tablename = 'user_profiles' 
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 'RLS Status' as info, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Drop all existing policies to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.user_profiles';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for user_profiles

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Policy 2: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 4: Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.user_profiles
FOR DELETE TO authenticated
USING (id = auth.uid());

-- Policy 5: Allow public access for basic profile info (for business members)
CREATE POLICY "Public can view basic profile info" ON public.user_profiles
FOR SELECT TO public
USING (true);

-- Verify the new policies
SELECT 'New Policies' as info, schemaname, tablename, policyname, cmd, array_to_string(roles, ', ') as roles
FROM pg_policies 
WHERE tablename = 'user_profiles' 
ORDER BY policyname;

-- Test query to see if it works
SELECT 'Test Query' as info, count(*) as user_count
FROM public.user_profiles;




