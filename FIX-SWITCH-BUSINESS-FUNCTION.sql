-- FIX SWITCH BUSINESS FUNCTION
-- Run this script in Supabase SQL editor

-- 1. Drop existing function if it exists
DROP FUNCTION IF EXISTS switch_business_context(uuid, uuid);
DROP FUNCTION IF EXISTS switch_business_context(uuid);

-- 2. Create the switch_business_context function
CREATE OR REPLACE FUNCTION switch_business_context(
    user_id_param uuid,
    business_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify user has access to this business
    IF NOT EXISTS (
        SELECT 1 
        FROM business_memberships 
        WHERE user_id = user_id_param 
        AND business_id = business_id_param 
        AND status = 'active'
    ) THEN
        RETURN false;
    END IF;
    
    -- Record the business switch (optional - for analytics)
    -- Use INSERT ... ON CONFLICT only after the constraint exists
    INSERT INTO business_switches (user_id, business_id, switched_at)
    VALUES (user_id_param, business_id_param, NOW())
    ON CONFLICT (user_id, business_id) 
    DO UPDATE SET switched_at = NOW();
    
    RETURN true;
END;
$$;

-- 3. Create business_switches table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_switches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    switched_at timestamp with time zone DEFAULT NOW(),
    created_at timestamp with time zone DEFAULT NOW()
);

-- 4. Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'business_switches_user_business_unique'
    ) THEN
        ALTER TABLE business_switches 
        ADD CONSTRAINT business_switches_user_business_unique 
        UNIQUE (user_id, business_id);
    END IF;
END $$;

-- 5. Enable RLS on business_switches table
ALTER TABLE business_switches ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policy for business_switches
CREATE POLICY "Users can view own switches" ON business_switches
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own switches" ON business_switches
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 7. Grant permissions
GRANT ALL ON business_switches TO authenticated;
GRANT EXECUTE ON FUNCTION switch_business_context(uuid, uuid) TO authenticated;

-- 8. Test the function
SELECT 'Switch business function created successfully!' as status;

-- 9. Test with a real user
SELECT switch_business_context(
    '3488046f-56cf-4711-9045-7e6e158a1c91'::uuid,
    '09c25119-044c-4457-b635-0fa88c737faf'::uuid
) as test_result;
