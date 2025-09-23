-- CREATE HIERARCHICAL BUSINESS STRUCTURE
-- Run this script in Supabase SQL editor

-- 1. Add parent_business_id column to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS parent_business_id uuid REFERENCES businesses(id) ON DELETE CASCADE;

-- 2. Add business_level column to distinguish main vs sub businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS business_level varchar(20) DEFAULT 'main' CHECK (business_level IN ('main', 'sub'));

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_parent_id ON businesses(parent_business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_level ON businesses(business_level);

-- 4. Update existing businesses to be sub-businesses of a main business
-- First, let's create a main business for the user
INSERT INTO businesses (
    id,
    name,
    description,
    business_type,
    industry,
    email,
    currency,
    timezone,
    country,
    status,
    settings,
    created_by,
    business_level,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Dylan''s Business Group',
    'Main business account for managing all sub-businesses',
    'holding_company',
    'business_services',
    'dylankatambad@gmail.com',
    'UGX',
    'Africa/Kampala',
    'Uganda',
    'active',
    '{}',
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    'main',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 5. Get the main business ID
DO $$
DECLARE
    main_business_id uuid;
BEGIN
    -- Get the main business ID
    SELECT id INTO main_business_id 
    FROM businesses 
    WHERE created_by = '3488046f-56cf-4711-9045-7e6e158a1c91' 
    AND business_level = 'main' 
    LIMIT 1;
    
    -- Update all existing businesses to be sub-businesses
    UPDATE businesses 
    SET 
        parent_business_id = main_business_id,
        business_level = 'sub'
    WHERE created_by = '3488046f-56cf-4711-9045-7e6e158a1c91' 
    AND business_level = 'main' 
    AND id != main_business_id;
    
    RAISE NOTICE 'Updated businesses to be sub-businesses of: %', main_business_id;
END $$;

-- 6. Create RPC function to get sub-businesses
CREATE OR REPLACE FUNCTION get_sub_businesses(
    parent_business_id_param uuid
)
RETURNS TABLE (
    business_id uuid,
    business_name character varying(255),
    business_description text,
    business_type character varying(50),
    role character varying(50),
    status character varying(20),
    joined_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as business_id,
        b.name as business_name,
        b.description as business_description,
        b.business_type,
        'owner'::varchar as role,
        b.status,
        b.created_at as joined_at
    FROM businesses b
    WHERE b.parent_business_id = parent_business_id_param
    AND b.business_level = 'sub'
    AND b.status = 'active'
    ORDER BY b.created_at DESC;
END;
$$;

-- 7. Create RPC function to get main business
CREATE OR REPLACE FUNCTION get_main_business(
    user_id_param uuid
)
RETURNS TABLE (
    business_id uuid,
    business_name character varying(255),
    business_description text,
    business_type character varying(50),
    role character varying(50),
    status character varying(20),
    joined_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as business_id,
        b.name as business_name,
        b.description as business_description,
        b.business_type,
        'owner'::varchar as role,
        b.status,
        b.created_at as joined_at
    FROM businesses b
    WHERE b.created_by = user_id_param
    AND b.business_level = 'main'
    AND b.status = 'active'
    ORDER BY b.created_at DESC
    LIMIT 1;
END;
$$;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION get_sub_businesses(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_main_business(uuid) TO authenticated;

-- 9. Test the functions
SELECT 'Hierarchical business structure created successfully!' as status;

-- 10. Test with the user
SELECT * FROM get_main_business('3488046f-56cf-4711-9045-7e6e158a1c91');
SELECT * FROM get_sub_businesses((SELECT id FROM businesses WHERE created_by = '3488046f-56cf-4711-9045-7e6e158a1c91' AND business_level = 'main' LIMIT 1));
