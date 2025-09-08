-- Add sample expenses to match the invoice data
-- Run this in your Supabase SQL Editor

INSERT INTO expenses (id, user_id, paid_at, amount, description, payment_method)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440200', '00000000-0000-0000-0000-000000000001', '2025-09-01', 150000, 'Office Supplies', 'cash'),
  ('550e8400-e29b-41d4-a716-446655440201', '00000000-0000-0000-0000-000000000001', '2025-09-02', 300000, 'Rent Payment', 'bank_transfer'),
  ('550e8400-e29b-41d4-a716-446655440202', '00000000-0000-0000-0000-000000000001', '2025-09-03', 75000, 'Internet Bill', 'bank_transfer')
ON CONFLICT (id) DO NOTHING;

-- Check the data
SELECT 'EXPENSES ADDED:' as info;
SELECT id, user_id, amount, description FROM expenses WHERE user_id = '00000000-0000-0000-0000-000000000001';

