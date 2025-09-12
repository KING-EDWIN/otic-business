-- CREATE: Default product categories for testing
-- Run this in Supabase SQL Editor to create default categories

-- 1. Insert default categories (these will be available for all businesses)
INSERT INTO product_categories (id, name, description, business_id, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Beverages', 'Drinks and beverages', null, NOW(), NOW()),
    (gen_random_uuid(), 'Snacks', 'Snacks and light foods', null, NOW(), NOW()),
    (gen_random_uuid(), 'Detergents', 'Cleaning products and detergents', null, NOW(), NOW()),
    (gen_random_uuid(), 'Toiletries', 'Personal care products', null, NOW(), NOW()),
    (gen_random_uuid(), 'Food Items', 'General food products', null, NOW(), NOW()),
    (gen_random_uuid(), 'Electronics', 'Electronic devices and accessories', null, NOW(), NOW()),
    (gen_random_uuid(), 'Clothing', 'Apparel and clothing items', null, NOW(), NOW()),
    (gen_random_uuid(), 'Home & Garden', 'Home improvement and garden supplies', null, NOW(), NOW()),
    (gen_random_uuid(), 'Health & Beauty', 'Health and beauty products', null, NOW(), NOW()),
    (gen_random_uuid(), 'Sports & Outdoors', 'Sports equipment and outdoor gear', null, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. Create default suppliers
INSERT INTO product_suppliers (id, name, contact_person, phone, email, address, business_id, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'General Supplier', 'John Doe', '+256 700 000 001', 'supplier@example.com', 'Kampala, Uganda', null, NOW(), NOW()),
    (gen_random_uuid(), 'Local Distributor', 'Jane Smith', '+256 700 000 002', 'distributor@example.com', 'Entebbe, Uganda', null, NOW(), NOW()),
    (gen_random_uuid(), 'Wholesale Company', 'Mike Johnson', '+256 700 000 003', 'wholesale@example.com', 'Jinja, Uganda', null, NOW(), NOW())
ON CONFLICT DO NOTHING;

SELECT 'Default categories and suppliers created successfully!' as status;
