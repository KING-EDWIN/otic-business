-- Check what the get_user_businesses RPC function is returning
SELECT * FROM get_user_businesses('3488046f-56cf-4711-9045-7e6e158a1c91');

-- Check business_memberships for this user
SELECT bm.*, b.name as business_name FROM business_memberships bm
JOIN businesses b ON bm.business_id = b.id
WHERE bm.user_id = '3488046f-56cf-4711-9045-7e6e158a1c91';

-- Check if there are duplicate entries
SELECT business_id, COUNT(*) as count FROM business_memberships
WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
GROUP BY business_id HAVING COUNT(*) > 1;
