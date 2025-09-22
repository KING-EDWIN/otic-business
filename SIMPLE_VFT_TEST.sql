-- Simple Test Queries for VFT Issues
-- Run these one by one and paste the results

-- 1. Check if VFT "shirt" exists for the user
SELECT * FROM visual_filter_tags 
WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91' 
AND tag_name = 'shirt';

-- 2. Check all VFTs for the user
SELECT tag_name, created_at FROM visual_filter_tags 
WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91' 
ORDER BY tag_name;

-- 3. Check if the create_vft function exists and what parameters it expects
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'create_vft';

-- 4. Test creating a VFT with a new name (should work)
SELECT create_vft(
    'test-new-vft'::text,
    'test-category-id'::uuid,
    0.9::float
);

-- 5. Test creating a VFT with existing name (should fail)
SELECT create_vft(
    'shirt'::text,
    'test-category-id'::uuid,
    0.9::float
);


