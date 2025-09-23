-- =====================================================
-- BRANCH MANAGEMENT SYSTEM - COMPREHENSIVE BACKEND
-- =====================================================
-- This script creates a complete backend system for multi-branch management
-- with real-time data collection, analytics, and reporting capabilities

-- =====================================================
-- 1. BRANCH CORE TABLES
-- =====================================================

-- Branch locations table (already exists, but let's enhance it)
ALTER TABLE branch_locations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Kampala';
ALTER TABLE branch_locations ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'UGX';
ALTER TABLE branch_locations ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 18.00;
ALTER TABLE branch_locations ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "09:00", "close": "18:00"}}';
ALTER TABLE branch_locations ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Branch staff assignments
CREATE TABLE IF NOT EXISTS branch_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('manager', 'supervisor', 'cashier', 'stock_keeper', 'sales_assistant', 'security', 'cleaner')),
    permissions JSONB DEFAULT '{}',
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary DECIMAL(12,2) DEFAULT 0.00,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, user_id)
);

-- =====================================================
-- 2. BRANCH SALES & TRANSACTIONS
-- =====================================================

-- Branch sales transactions
CREATE TABLE IF NOT EXISTS branch_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    sale_number TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'bank_transfer', 'credit')),
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('completed', 'pending', 'failed', 'refunded')),
    cashier_id UUID REFERENCES auth.users(id),
    supervisor_id UUID REFERENCES auth.users(id),
    items_count INTEGER DEFAULT 0,
    is_refunded BOOLEAN DEFAULT false,
    refund_amount DECIMAL(12,2) DEFAULT 0.00,
    refund_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Branch sale items
CREATE TABLE IF NOT EXISTS branch_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES branch_sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    product_barcode TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    category TEXT,
    brand TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. BRANCH INVENTORY MANAGEMENT
-- =====================================================

-- Branch inventory levels
CREATE TABLE IF NOT EXISTS branch_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    last_restocked TIMESTAMP,
    last_sold TIMESTAMP,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    selling_price DECIMAL(10,2) DEFAULT 0.00,
    profit_margin DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, product_id)
);

-- Branch inventory movements
CREATE TABLE IF NOT EXISTS branch_inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer_in', 'transfer_out', 'adjustment', 'return', 'damage', 'expired')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER DEFAULT 0,
    new_stock INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(12,2) DEFAULT 0.00,
    reference_number TEXT,
    reason TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. BRANCH ANALYTICS & METRICS
-- =====================================================

-- Branch daily metrics
CREATE TABLE IF NOT EXISTS branch_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10,2) DEFAULT 0.00,
    cash_sales DECIMAL(12,2) DEFAULT 0.00,
    card_sales DECIMAL(12,2) DEFAULT 0.00,
    mobile_money_sales DECIMAL(12,2) DEFAULT 0.00,
    bank_transfer_sales DECIMAL(12,2) DEFAULT 0.00,
    total_discounts DECIMAL(12,2) DEFAULT 0.00,
    total_tax DECIMAL(12,2) DEFAULT 0.00,
    net_profit DECIMAL(12,2) DEFAULT 0.00,
    top_selling_product TEXT,
    top_selling_category TEXT,
    peak_hour INTEGER,
    staff_efficiency DECIMAL(5,2) DEFAULT 0.00,
    customer_satisfaction DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, metric_date)
);

-- Branch hourly metrics
CREATE TABLE IF NOT EXISTS branch_hourly_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    hour_of_day INTEGER NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
    sales_amount DECIMAL(12,2) DEFAULT 0.00,
    transaction_count INTEGER DEFAULT 0,
    customer_count INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10,2) DEFAULT 0.00,
    staff_count INTEGER DEFAULT 0,
    efficiency_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, metric_date, hour_of_day)
);

-- Branch product performance
CREATE TABLE IF NOT EXISTS branch_product_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_quantity_sold INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_profit DECIMAL(12,2) DEFAULT 0.00,
    profit_margin DECIMAL(5,2) DEFAULT 0.00,
    average_daily_sales DECIMAL(10,2) DEFAULT 0.00,
    peak_sales_day TEXT,
    peak_sales_hour INTEGER,
    return_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, product_id, period_start, period_end)
);

-- =====================================================
-- 5. BRANCH STAFF PERFORMANCE
-- =====================================================

-- Branch staff performance metrics
CREATE TABLE IF NOT EXISTS branch_staff_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10,2) DEFAULT 0.00,
    sales_target DECIMAL(12,2) DEFAULT 0.00,
    target_achievement DECIMAL(5,2) DEFAULT 0.00,
    efficiency_score DECIMAL(5,2) DEFAULT 0.00,
    customer_rating DECIMAL(3,2) DEFAULT 0.00,
    attendance_rate DECIMAL(5,2) DEFAULT 0.00,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, staff_id, period_start, period_end)
);

-- Branch staff attendance
CREATE TABLE IF NOT EXISTS branch_staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    hours_worked DECIMAL(4,2) DEFAULT 0.00,
    overtime_hours DECIMAL(4,2) DEFAULT 0.00,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'sick_leave', 'vacation')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, staff_id, attendance_date)
);

-- =====================================================
-- 6. BRANCH AI INSIGHTS & PREDICTIONS
-- =====================================================

-- Branch AI insights
CREATE TABLE IF NOT EXISTS branch_ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('sales_prediction', 'inventory_optimization', 'customer_behavior', 'staff_performance', 'revenue_forecast', 'demand_forecast', 'price_optimization')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    impact_level TEXT NOT NULL CHECK (impact_level IN ('high', 'medium', 'low')),
    actionable BOOLEAN DEFAULT false,
    insight_data JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    is_implemented BOOLEAN DEFAULT false,
    implementation_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Branch predictions
CREATE TABLE IF NOT EXISTS branch_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    prediction_type TEXT NOT NULL CHECK (prediction_type IN ('sales', 'inventory', 'staffing', 'revenue', 'customer_traffic')),
    prediction_date DATE NOT NULL,
    predicted_value DECIMAL(12,2) NOT NULL,
    confidence_level DECIMAL(5,2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
    actual_value DECIMAL(12,2),
    accuracy_score DECIMAL(5,2),
    model_version TEXT,
    prediction_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. BRANCH FINANCIAL MANAGEMENT
-- =====================================================

-- Branch expenses
CREATE TABLE IF NOT EXISTS branch_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    expense_category TEXT NOT NULL CHECK (expense_category IN ('rent', 'utilities', 'staff', 'inventory', 'marketing', 'maintenance', 'security', 'insurance', 'other')),
    expense_type TEXT NOT NULL CHECK (expense_type IN ('operational', 'capital', 'emergency')),
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'UGX',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'mobile_money', 'check')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    vendor_name TEXT,
    vendor_contact TEXT,
    receipt_number TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Branch budgets
CREATE TABLE IF NOT EXISTS branch_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branch_locations(id) ON DELETE CASCADE,
    budget_category TEXT NOT NULL,
    budget_period TEXT NOT NULL CHECK (budget_period IN ('monthly', 'quarterly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    allocated_amount DECIMAL(12,2) NOT NULL,
    spent_amount DECIMAL(12,2) DEFAULT 0.00,
    remaining_amount DECIMAL(12,2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
    utilization_percentage DECIMAL(5,2) GENERATED ALWAYS AS ((spent_amount / allocated_amount) * 100) STORED,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE branch_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_hourly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_product_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for branch_staff
CREATE POLICY "Users can view staff in their branches" ON branch_staff
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage staff in their branches" ON branch_staff
    FOR ALL USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid() AND bm.role IN ('owner', 'admin', 'manager')
        )
    );

-- Create RLS policies for branch_sales
CREATE POLICY "Users can view sales in their branches" ON branch_sales
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create sales in their branches" ON branch_sales
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

-- Create RLS policies for branch_sale_items
CREATE POLICY "Users can view sale items in their branches" ON branch_sale_items
    FOR SELECT USING (
        sale_id IN (
            SELECT bs.id FROM branch_sales bs
            JOIN branch_locations bl ON bs.branch_id = bl.id
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create sale items in their branches" ON branch_sale_items
    FOR INSERT WITH CHECK (
        sale_id IN (
            SELECT bs.id FROM branch_sales bs
            JOIN branch_locations bl ON bs.branch_id = bl.id
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

-- Create RLS policies for branch_inventory
CREATE POLICY "Users can view inventory in their branches" ON branch_inventory
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage inventory in their branches" ON branch_inventory
    FOR ALL USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

-- Create RLS policies for branch_inventory_movements
CREATE POLICY "Users can view inventory movements in their branches" ON branch_inventory_movements
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create inventory movements in their branches" ON branch_inventory_movements
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

-- Create RLS policies for metrics tables
CREATE POLICY "Users can view metrics for their branches" ON branch_daily_metrics
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view hourly metrics for their branches" ON branch_hourly_metrics
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

-- Create RLS policies for staff performance
CREATE POLICY "Users can view staff performance in their branches" ON branch_staff_performance
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view staff attendance in their branches" ON branch_staff_attendance
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

-- Create RLS policies for AI insights
CREATE POLICY "Users can view AI insights for their branches" ON branch_ai_insights
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

-- Create RLS policies for expenses
CREATE POLICY "Users can view expenses for their branches" ON branch_expenses
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage expenses for their branches" ON branch_expenses
    FOR ALL USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid() AND bm.role IN ('owner', 'admin', 'manager')
        )
    );

-- Create RLS policies for budgets
CREATE POLICY "Users can view budgets for their branches" ON branch_budgets
    FOR SELECT USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage budgets for their branches" ON branch_budgets
    FOR ALL USING (
        branch_id IN (
            SELECT bl.id FROM branch_locations bl
            JOIN business_memberships bm ON bl.business_id = bm.business_id
            WHERE bm.user_id = auth.uid() AND bm.role IN ('owner', 'admin', 'manager')
        )
    );

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Branch sales indexes
CREATE INDEX IF NOT EXISTS idx_branch_sales_branch_id ON branch_sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_sales_date ON branch_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_branch_sales_cashier ON branch_sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_branch_sales_payment_method ON branch_sales(payment_method);

-- Branch inventory indexes
CREATE INDEX IF NOT EXISTS idx_branch_inventory_branch_product ON branch_inventory(branch_id, product_id);
CREATE INDEX IF NOT EXISTS idx_branch_inventory_stock ON branch_inventory(current_stock);
CREATE INDEX IF NOT EXISTS idx_branch_inventory_movements_branch ON branch_inventory_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_inventory_movements_date ON branch_inventory_movements(created_at);

-- Branch metrics indexes
CREATE INDEX IF NOT EXISTS idx_branch_daily_metrics_branch_date ON branch_daily_metrics(branch_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_branch_hourly_metrics_branch_date ON branch_hourly_metrics(branch_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_branch_staff_performance_branch ON branch_staff_performance(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_staff_attendance_branch_date ON branch_staff_attendance(branch_id, attendance_date);

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_sales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_sale_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_inventory_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_daily_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_hourly_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_product_performance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_staff_performance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_staff_attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_ai_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_predictions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branch_budgets TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Branch Management Backend Schema created successfully!';
    RAISE NOTICE 'Tables created: branch_staff, branch_sales, branch_sale_items, branch_inventory, branch_inventory_movements, branch_daily_metrics, branch_hourly_metrics, branch_product_performance, branch_staff_performance, branch_staff_attendance, branch_ai_insights, branch_predictions, branch_expenses, branch_budgets';
    RAISE NOTICE 'RLS policies and permissions configured for all tables';
END $$;
