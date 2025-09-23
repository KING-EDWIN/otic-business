-- SQL Queries to Debug VFT Duplicate Issues
-- Run these queries in your Supabase SQL Editor and paste the results

-- 1. Check the visual_filter_tags table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'visual_filter_tags' 
ORDER BY ordinal_position;

-- 2. Check existing VFTs for the user
SELECT 
    id,
    user_id,
    tag_name,
    category_id,
    confidence_score,
    created_at,
    updated_at
FROM visual_filter_tags 
WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
ORDER BY created_at DESC;

-- 3. Check if there are duplicate VFTs (should return empty if constraint is working)
SELECT 
    user_id,
    tag_name,
    COUNT(*) as count
FROM visual_filter_tags 
WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
GROUP BY user_id, tag_name
HAVING COUNT(*) > 1;

-- 4. Check the create_vft RPC function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'create_vft';

-- 5. Check RLS policies on visual_filter_tags table
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
WHERE tablename = 'visual_filter_tags';

-- 6. Test the create_vft function directly (this should fail with duplicate error)
SELECT create_vft(
    '3488046f-56cf-4711-9045-7e6e158a1c91'::uuid,
    'shirt'::text,
    'test-category-id'::uuid,
    0.9::float
);

-- 7. Check vft_products table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vft_products' 
ORDER BY ordinal_position;

-- 8. Check existing products for the user
SELECT 
    vp.id,
    vp.vft_id,
    vp.brand_name,
    vp.product_name,
    vp.price,
    vp.cost,
    vp.stock_quantity,
    vft.tag_name,
    vft.user_id
FROM vft_products vp
JOIN visual_filter_tags vft ON vp.vft_id = vft.id
WHERE vft.user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
ORDER BY vp.created_at DESC;

-- 9. Check if the user can access their own VFTs (RLS test)
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "3488046f-56cf-4711-9045-7e6e158a1c91"}';
SELECT COUNT(*) as accessible_vfts FROM visual_filter_tags WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91';

-- 10. Check the exact constraint that's failing
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'visual_filter_tags'::regclass 
AND contype = 'u';


