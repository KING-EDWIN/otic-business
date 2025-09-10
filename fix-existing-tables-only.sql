-- Fix existing tables only - no new table creation
-- Work with what you have instead of fighting against it

-- 1. Ensure individual_profiles has the right structure
ALTER TABLE public.individual_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Ensure individual_professions has the right structure  
ALTER TABLE public.individual_professions
ADD COLUMN IF NOT EXISTS individual_id UUID,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Ensure individual_business_access has the right structure
ALTER TABLE public.individual_business_access
ADD COLUMN IF NOT EXISTS individual_id UUID,
ADD COLUMN IF NOT EXISTS business_id UUID,
ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS invitation_type TEXT DEFAULT 'viewer',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Ensure individual_signups has the right structure
ALTER TABLE public.individual_signups
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS individual_id UUID,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Ensure business_signups has the right structure
ALTER TABLE public.business_signups
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Enable RLS on all tables
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_business_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_signups ENABLE ROW LEVEL SECURITY;

-- 7. Create simple RLS policies for individual_profiles
DROP POLICY IF EXISTS "individuals_view_own_profile" ON public.individual_profiles;
CREATE POLICY "individuals_view_own_profile" ON public.individual_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "individuals_create_own_profile" ON public.individual_profiles;
CREATE POLICY "individuals_create_own_profile" ON public.individual_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "individuals_update_own_profile" ON public.individual_profiles;
CREATE POLICY "individuals_update_own_profile" ON public.individual_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 8. Create simple RLS policies for individual_professions
DROP POLICY IF EXISTS "individuals_manage_own_professions" ON public.individual_professions;
CREATE POLICY "individuals_manage_own_professions" ON public.individual_professions
    FOR ALL TO authenticated
    USING (auth.uid() = individual_id)
    WITH CHECK (auth.uid() = individual_id);

-- 9. Create simple RLS policies for individual_business_access
DROP POLICY IF EXISTS "individuals_manage_business_access" ON public.individual_business_access;
CREATE POLICY "individuals_manage_business_access" ON public.individual_business_access
    FOR ALL TO authenticated
    USING (auth.uid() = individual_id OR auth.uid() = business_id)
    WITH CHECK (auth.uid() = individual_id OR auth.uid() = business_id);

-- 10. Create simple RLS policies for individual_signups
DROP POLICY IF EXISTS "individuals_manage_signups" ON public.individual_signups;
CREATE POLICY "individuals_manage_signups" ON public.individual_signups
    FOR ALL TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = individual_id)
    WITH CHECK (auth.uid() = user_id OR auth.uid() = individual_id);

-- 11. Create simple RLS policies for business_signups
DROP POLICY IF EXISTS "businesses_manage_signups" ON public.business_signups;
CREATE POLICY "businesses_manage_signups" ON public.business_signups
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 12. Show what we have now
SELECT 'individual_profiles columns' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'individual_profiles'
ORDER BY ordinal_position;

SELECT 'individual_professions columns' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'individual_professions'
ORDER BY ordinal_position;

SELECT 'individual_business_access columns' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'individual_business_access'
ORDER BY ordinal_position;

SELECT 'individual_signups columns' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'individual_signups'
ORDER BY ordinal_position;

SELECT 'business_signups columns' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'business_signups'
ORDER BY ordinal_position;

SELECT 'All existing tables are now properly configured!' as status;
