-- =====================================================
-- GET ENTIRE DATABASE STRUCTURE AND ADD MULTI-BRANCH SUPPORT
-- =====================================================

-- 1. GET CURRENT DATABASE STRUCTURE
-- =====================================================

-- Get all tables
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Get all columns for each table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Get all foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Get all RLS policies
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Get all RPC functions
SELECT 
    proname as function_name,
    proargnames as argument_names,
    proargdefaults as default_values,
    prorettype as return_type
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- =====================================================
-- 2. MULTI-BRANCH SUPPORT FEATURE
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 3. MULTI-BRANCH TABLES
-- =====================================================

-- Branch Locations Table
CREATE TABLE branch_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    branch_name TEXT NOT NULL,
    branch_code TEXT NOT NULL, -- Unique code like "MAIN", "BR001", etc.
    address TEXT,
    city TEXT,
    state_province TEXT,
    country TEXT DEFAULT 'Uganda',
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    manager_name TEXT,
    manager_phone TEXT,
    manager_email TEXT,
    branch_type TEXT DEFAULT 'retail', -- retail, warehouse, office, etc.
    status TEXT DEFAULT 'active', -- active, inactive, suspended
    opening_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    coordinates POINT, -- For GPS location
    timezone TEXT DEFAULT 'Africa/Kampala',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(business_id, branch_code)
);

-- Branch Staff Table
CREATE TABLE branch_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- manager, supervisor, cashier, stock_keeper, etc.
    permissions JSONB DEFAULT '{}', -- Store role-specific permissions
    employment_date DATE DEFAULT CURRENT_DATE,
    termination_date DATE,
    status TEXT DEFAULT 'active', -- active, inactive, terminated
    salary DECIMAL(12,2),
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, user_id)
);

-- Branch Inventory Table (links products to specific branches)
CREATE TABLE branch_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    last_restocked TIMESTAMP,
    last_sold TIMESTAMP,
    cost_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    branch_specific_price DECIMAL(12,2), -- Override global price if needed
    status TEXT DEFAULT 'active', -- active, inactive, discontinued
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, product_id)
);

-- Branch Sales Table
CREATE TABLE branch_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    cashier_id UUID REFERENCES auth.users(id),
    sale_date TIMESTAMP DEFAULT NOW(),
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    payment_method TEXT NOT NULL, -- cash, card, mobile_money, etc.
    payment_reference TEXT,
    customer_id UUID REFERENCES customers(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Branch Transfers Table (inventory transfers between branches)
CREATE TABLE branch_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    to_branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    transfer_reason TEXT, -- restock, sale, return, etc.
    transfer_date TIMESTAMP DEFAULT NOW(),
    expected_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    status TEXT DEFAULT 'pending', -- pending, in_transit, delivered, cancelled
    tracking_number TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Branch Reports Table (daily/monthly branch performance)
CREATE TABLE branch_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    report_type TEXT NOT NULL, -- daily, weekly, monthly, yearly
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(12,2) DEFAULT 0.00,
    top_selling_products JSONB DEFAULT '[]',
    inventory_turnover DECIMAL(8,2) DEFAULT 0.00,
    profit_margin DECIMAL(5,2) DEFAULT 0.00,
    expenses DECIMAL(12,2) DEFAULT 0.00,
    net_profit DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, report_date, report_type)
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Branch locations indexes
CREATE INDEX idx_branch_locations_business_id ON branch_locations(business_id);
CREATE INDEX idx_branch_locations_status ON branch_locations(status);
CREATE INDEX idx_branch_locations_city ON branch_locations(city);

-- Branch staff indexes
CREATE INDEX idx_branch_staff_branch_id ON branch_staff(branch_id);
CREATE INDEX idx_branch_staff_user_id ON branch_staff(user_id);
CREATE INDEX idx_branch_staff_status ON branch_staff(status);

-- Branch inventory indexes
CREATE INDEX idx_branch_inventory_branch_id ON branch_inventory(branch_id);
CREATE INDEX idx_branch_inventory_product_id ON branch_inventory(product_id);
CREATE INDEX idx_branch_inventory_status ON branch_inventory(status);

-- Branch sales indexes
CREATE INDEX idx_branch_sales_branch_id ON branch_sales(branch_id);
CREATE INDEX idx_branch_sales_date ON branch_sales(sale_date);
CREATE INDEX idx_branch_sales_cashier ON branch_sales(cashier_id);

-- Branch transfers indexes
CREATE INDEX idx_branch_transfers_from_branch ON branch_transfers(from_branch_id);
CREATE INDEX idx_branch_transfers_to_branch ON branch_transfers(to_branch_id);
CREATE INDEX idx_branch_transfers_status ON branch_transfers(status);

-- Branch reports indexes
CREATE INDEX idx_branch_reports_branch_id ON branch_reports(branch_id);
CREATE INDEX idx_branch_reports_date ON branch_reports(report_date);
CREATE INDEX idx_branch_reports_type ON branch_reports(report_type);

-- =====================================================
-- 5. RLS POLICIES FOR MULTI-BRANCH TABLES
-- =====================================================

-- Branch locations policies
CREATE POLICY "branch_locations_select" ON branch_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "branch_locations_insert" ON branch_locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "branch_locations_update" ON branch_locations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "branch_locations_delete" ON branch_locations FOR DELETE TO authenticated USING (true);

-- Branch staff policies
CREATE POLICY "branch_staff_select" ON branch_staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "branch_staff_insert" ON branch_staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "branch_staff_update" ON branch_staff FOR UPDATE TO authenticated USING (true);
CREATE POLICY "branch_staff_delete" ON branch_staff FOR DELETE TO authenticated USING (true);

-- Branch inventory policies
CREATE POLICY "branch_inventory_select" ON branch_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "branch_inventory_insert" ON branch_inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "branch_inventory_update" ON branch_inventory FOR UPDATE TO authenticated USING (true);
CREATE POLICY "branch_inventory_delete" ON branch_inventory FOR DELETE TO authenticated USING (true);

-- Branch sales policies
CREATE POLICY "branch_sales_select" ON branch_sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "branch_sales_insert" ON branch_sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "branch_sales_update" ON branch_sales FOR UPDATE TO authenticated USING (true);
CREATE POLICY "branch_sales_delete" ON branch_sales FOR DELETE TO authenticated USING (true);

-- Branch transfers policies
CREATE POLICY "branch_transfers_select" ON branch_transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "branch_transfers_insert" ON branch_transfers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "branch_transfers_update" ON branch_transfers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "branch_transfers_delete" ON branch_transfers FOR DELETE TO authenticated USING (true);

-- Branch reports policies
CREATE POLICY "branch_reports_select" ON branch_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "branch_reports_insert" ON branch_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "branch_reports_update" ON branch_reports FOR UPDATE TO authenticated USING (true);
CREATE POLICY "branch_reports_delete" ON branch_reports FOR DELETE TO authenticated USING (true);

-- =====================================================
-- 6. RPC FUNCTIONS FOR MULTI-BRANCH OPERATIONS
-- =====================================================

-- Get all branches for a business
CREATE OR REPLACE FUNCTION get_business_branches(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    branch_name TEXT,
    branch_code TEXT,
    address TEXT,
    city TEXT,
    status TEXT,
    manager_name TEXT,
    staff_count BIGINT,
    total_sales DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bl.id,
        bl.branch_name,
        bl.branch_code,
        bl.address,
        bl.city,
        bl.status,
        bl.manager_name,
        COUNT(bs.id) as staff_count,
        COALESCE(SUM(bsales.total_amount), 0) as total_sales
    FROM branch_locations bl
    LEFT JOIN branch_staff bs ON bl.id = bs.branch_id AND bs.status = 'active'
    LEFT JOIN branch_sales bsales ON bl.id = bsales.branch_id 
        AND bsales.sale_date >= CURRENT_DATE - INTERVAL '30 days'
    WHERE bl.business_id = business_id_param
    GROUP BY bl.id, bl.branch_name, bl.branch_code, bl.address, bl.city, bl.status, bl.manager_name
    ORDER BY bl.branch_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new branch
CREATE OR REPLACE FUNCTION create_branch(
    business_id_param UUID,
    branch_name_param TEXT,
    branch_code_param TEXT,
    address_param TEXT DEFAULT NULL,
    city_param TEXT DEFAULT NULL,
    manager_name_param TEXT DEFAULT NULL,
    manager_phone_param TEXT DEFAULT NULL,
    manager_email_param TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_branch_id UUID;
BEGIN
    INSERT INTO branch_locations (
        business_id, branch_name, branch_code, address, city,
        manager_name, manager_phone, manager_email, created_by
    ) VALUES (
        business_id_param, branch_name_param, branch_code_param, address_param, city_param,
        manager_name_param, manager_phone_param, manager_email_param, auth.uid()
    ) RETURNING id INTO new_branch_id;
    
    RETURN new_branch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transfer inventory between branches
CREATE OR REPLACE FUNCTION transfer_inventory(
    from_branch_id_param UUID,
    to_branch_id_param UUID,
    product_id_param UUID,
    quantity_param INTEGER,
    reason_param TEXT DEFAULT 'transfer'
) RETURNS UUID AS $$
DECLARE
    transfer_id UUID;
BEGIN
    -- Check if source branch has enough inventory
    IF NOT EXISTS (
        SELECT 1 FROM branch_inventory 
        WHERE branch_id = from_branch_id_param 
        AND product_id = product_id_param 
        AND current_stock >= quantity_param
    ) THEN
        RAISE EXCEPTION 'Insufficient inventory in source branch';
    END IF;
    
    -- Create transfer record
    INSERT INTO branch_transfers (
        from_branch_id, to_branch_id, product_id, quantity, 
        transfer_reason, created_by
    ) VALUES (
        from_branch_id_param, to_branch_id_param, product_id_param, quantity_param,
        reason_param, auth.uid()
    ) RETURNING id INTO transfer_id;
    
    -- Update source branch inventory
    UPDATE branch_inventory 
    SET current_stock = current_stock - quantity_param,
        updated_at = NOW()
    WHERE branch_id = from_branch_id_param 
    AND product_id = product_id_param;
    
    -- Update destination branch inventory (or create if doesn't exist)
    INSERT INTO branch_inventory (branch_id, product_id, current_stock, updated_at)
    VALUES (to_branch_id_param, product_id_param, quantity_param, NOW())
    ON CONFLICT (branch_id, product_id) 
    DO UPDATE SET 
        current_stock = branch_inventory.current_stock + quantity_param,
        updated_at = NOW();
    
    RETURN transfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get branch performance report
CREATE OR REPLACE FUNCTION get_branch_performance(
    branch_id_param UUID,
    start_date_param DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date_param DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    branch_name TEXT,
    total_sales DECIMAL(12,2),
    total_transactions BIGINT,
    average_transaction_value DECIMAL(12,2),
    top_products JSONB,
    inventory_turnover DECIMAL(8,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bl.branch_name,
        COALESCE(SUM(bs.total_amount), 0) as total_sales,
        COUNT(bs.id) as total_transactions,
        CASE 
            WHEN COUNT(bs.id) > 0 THEN COALESCE(SUM(bs.total_amount), 0) / COUNT(bs.id)
            ELSE 0 
        END as average_transaction_value,
        COALESCE(
            json_agg(
                json_build_object(
                    'product_name', p.name,
                    'quantity_sold', SUM(si.quantity),
                    'revenue', SUM(si.quantity * si.price)
                ) ORDER BY SUM(si.quantity) DESC
            ) FILTER (WHERE p.name IS NOT NULL),
            '[]'::jsonb
        ) as top_products,
        0.0 as inventory_turnover -- TODO: Calculate actual inventory turnover
    FROM branch_locations bl
    LEFT JOIN branch_sales bs ON bl.id = bs.branch_id 
        AND bs.sale_date BETWEEN start_date_param AND end_date_param
    LEFT JOIN sales s ON bs.sale_id = s.id
    LEFT JOIN sale_items si ON s.id = si.sale_id
    LEFT JOIN products p ON si.product_id = p.id
    WHERE bl.id = branch_id_param
    GROUP BY bl.id, bl.branch_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. UPDATE USER PROFILES FOR TIER-BASED ACCESS
-- =====================================================

-- Add multi-branch feature flag to user profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{}';

-- Update tier-based feature access
UPDATE user_profiles 
SET features_enabled = jsonb_set(
    COALESCE(features_enabled, '{}'),
    '{multi_branch}',
    'true'
)
WHERE tier IN ('grow_intelligence', 'enterprise_advantage');

UPDATE user_profiles 
SET features_enabled = jsonb_set(
    COALESCE(features_enabled, '{}'),
    '{multi_branch}',
    'false'
)
WHERE tier IN ('free_trial', 'start_smart');

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for multi-branch tables
GRANT ALL ON branch_locations TO authenticated;
GRANT ALL ON branch_staff TO authenticated;
GRANT ALL ON branch_inventory TO authenticated;
GRANT ALL ON branch_sales TO authenticated;
GRANT ALL ON branch_transfers TO authenticated;
GRANT ALL ON branch_reports TO authenticated;

-- Grant permissions for RPC functions
GRANT EXECUTE ON FUNCTION get_business_branches(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_branch(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION transfer_inventory(UUID, UUID, UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_performance(UUID, DATE, DATE) TO authenticated;

-- =====================================================
-- 9. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample branch for testing (only if no branches exist)
INSERT INTO branch_locations (
    business_id, branch_name, branch_code, address, city, 
    manager_name, manager_phone, manager_email, created_by
) 
SELECT 
    b.id,
    'Main Branch',
    'MAIN',
    'Kampala Central',
    'Kampala',
    'Branch Manager',
    '+256700000000',
    'manager@example.com',
    auth.uid()
FROM businesses b
WHERE NOT EXISTS (SELECT 1 FROM branch_locations WHERE business_id = b.id)
LIMIT 1;

-- =====================================================
-- 10. COMPLETION MESSAGE
-- =====================================================

SELECT 'Multi-branch support feature added successfully!' as status,
       'Available for Grow Intelligence and Enterprise Advantage tiers' as tier_info,
       'Check My Extras dropdown for Multi-Branch Management' as ui_info;
