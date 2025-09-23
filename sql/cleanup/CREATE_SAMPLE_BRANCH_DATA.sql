-- Create sample data for testing branch functionality
-- Run this script in Supabase SQL Editor

-- First, let's create a sample branch if it doesn't exist
INSERT INTO branch_locations (
    id,
    business_id,
    branch_name,
    branch_code,
    address,
    city,
    country,
    phone,
    email,
    manager_id,
    is_active,
    created_at
) VALUES (
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID, -- Using same ID as business for simplicity
    'Main Branch',
    'MB001',
    '123 Main Street',
    'Kampala',
    'Uganda',
    '+256700000000',
    'main@business.com',
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create sample products for inventory
INSERT INTO products (
    id,
    name,
    barcode,
    sku,
    category_id,
    supplier_id,
    cost_price,
    selling_price,
    stock_quantity,
    minimum_stock,
    is_active,
    created_at
) VALUES 
(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Coca Cola 500ml',
    '1234567890123',
    'CC500',
    NULL,
    NULL,
    2500,
    3500,
    100,
    10,
    true,
    NOW()
),
(
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Bread Loaf',
    '1234567890124',
    'BL001',
    NULL,
    NULL,
    2000,
    3000,
    50,
    5,
    true,
    NOW()
),
(
    '33333333-3333-3333-3333-333333333333'::UUID,
    'Milk 1L',
    '1234567890125',
    'ML001',
    NULL,
    NULL,
    4000,
    5500,
    25,
    5,
    true,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create sample branch inventory
INSERT INTO branch_inventory (
    id,
    branch_id,
    product_id,
    current_stock,
    minimum_stock,
    maximum_stock,
    reorder_point,
    cost_price,
    selling_price,
    status,
    created_at
) VALUES 
(
    '44444444-4444-4444-4444-444444444444'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    100,
    10,
    200,
    15,
    2500,
    3500,
    'active',
    NOW()
),
(
    '55555555-5555-5555-5555-555555555555'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    8,
    5,
    50,
    10,
    2000,
    3000,
    'active',
    NOW()
),
(
    '66666666-6666-6666-6666-666666666666'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    '33333333-3333-3333-3333-333333333333'::UUID,
    0,
    5,
    30,
    8,
    4000,
    5500,
    'active',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create sample branch sales
INSERT INTO branch_sales (
    id,
    branch_id,
    sale_date,
    total_amount,
    discount_amount,
    tax_amount,
    payment_method,
    created_at
) VALUES 
(
    '77777777-7777-7777-7777-777777777777'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    NOW() - INTERVAL '1 day',
    7000,
    0,
    0,
    'cash',
    NOW() - INTERVAL '1 day'
),
(
    '88888888-8888-8888-8888-888888888888'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    NOW() - INTERVAL '2 hours',
    10500,
    500,
    0,
    'card',
    NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Create sample sale items
INSERT INTO branch_sale_items (
    id,
    sale_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    total_price,
    created_at
) VALUES 
(
    '99999999-9999-9999-9999-999999999999'::UUID,
    '77777777-7777-7777-7777-777777777777'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Coca Cola 500ml',
    2,
    3500,
    7000,
    NOW() - INTERVAL '1 day'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    '88888888-8888-8888-8888-888888888888'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Coca Cola 500ml',
    2,
    3500,
    7000,
    NOW() - INTERVAL '2 hours'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
    '88888888-8888-8888-8888-888888888888'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Bread Loaf',
    1,
    3000,
    3000,
    NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Create sample inventory movements
INSERT INTO branch_inventory_movements (
    id,
    branch_id,
    product_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    reason,
    created_at
) VALUES 
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'in',
    100,
    0,
    100,
    'Initial stock',
    NOW() - INTERVAL '7 days'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'out',
    4,
    100,
    96,
    'Sales',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Create sample branch staff
INSERT INTO branch_staff (
    id,
    branch_id,
    user_id,
    role,
    permissions,
    hire_date,
    salary,
    commission_rate,
    is_active,
    performance_score,
    created_at
) VALUES 
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    'manager',
    '{"sales": true, "inventory": true, "staff": true}',
    NOW() - INTERVAL '30 days',
    500000,
    0.05,
    true,
    85,
    NOW() - INTERVAL '30 days'
)
ON CONFLICT (id) DO NOTHING;

-- Create sample daily metrics
INSERT INTO branch_daily_metrics (
    id,
    branch_id,
    metric_date,
    total_sales,
    total_transactions,
    total_customers,
    average_transaction_value,
    cash_sales,
    card_sales,
    mobile_money_sales,
    bank_transfer_sales,
    total_discounts,
    total_tax,
    net_profit,
    staff_efficiency,
    customer_satisfaction,
    created_at
) VALUES 
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    NOW()::DATE,
    17500,
    2,
    2,
    8750,
    7000,
    10000,
    0,
    0,
    500,
    0,
    17000,
    85,
    90,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create sample hourly metrics
INSERT INTO branch_hourly_metrics (
    id,
    branch_id,
    metric_date,
    hour,
    sales,
    transactions,
    customers,
    created_at
) VALUES 
(
    'gggggggg-gggg-gggg-gggg-gggggggggggg'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    NOW()::DATE,
    14,
    10500,
    1,
    1,
    NOW()
),
(
    'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'::UUID,
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    NOW()::DATE,
    10,
    7000,
    1,
    1,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

SELECT 'Sample branch data created successfully!' as status;
SELECT 'Branch ID: 066efb80-2a71-41c5-b704-4d9574b5d5bf' as branch_id;
SELECT 'You can now test the branch pages with this data.' as next_step;
