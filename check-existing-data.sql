-- Check what data exists in your Supabase database
-- Run this in your Supabase SQL Editor to see what data you have

-- Check user profiles
SELECT 'User Profiles' as table_name, COUNT(*) as count FROM user_profiles;

-- Check sales data
SELECT 'Sales' as table_name, COUNT(*) as count FROM sales;

-- Check if there are any sales with specific user_id
SELECT 'Sales by User' as info, user_id, COUNT(*) as count FROM sales GROUP BY user_id;

-- Check products
SELECT 'Products' as table_name, COUNT(*) as count FROM products;

-- Check if there are any products with specific user_id
SELECT 'Products by User' as info, user_id, COUNT(*) as count FROM products GROUP BY user_id;

-- Check user_profiles to see what user_ids exist
SELECT 'User Profile IDs' as info, id, email, full_name FROM user_profiles LIMIT 5;
