-- Multi-Business Branch System Schema
-- Advanced business management with branches, inventory, and analytics
-- Run this script to create multi-business branch system tables

-- Branch Locations Table
CREATE TABLE IF NOT EXISTS branch_locations (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    branch_code TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Uganda',
    phone TEXT,
    email TEXT,
    manager_id UUID REFERENCES user_profiles(id),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, branch_code)
);

-- Branch Staff Table
CREATE TABLE IF NOT EXISTS branch_staff (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    position TEXT,
    salary DECIMAL(10,2),
    start_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, user_id)
);

-- Branch Inventory Table
CREATE TABLE IF NOT EXISTS branch_inventory (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    reorder_point INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, product_id)
);

-- Branch Inventory Movements Table
CREATE TABLE IF NOT EXISTS branch_inventory_movements (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference_id INTEGER,
    reference_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch Sales Table
CREATE TABLE IF NOT EXISTS branch_sales (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id),
    cashier_id UUID REFERENCES user_profiles(id),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch Sale Items Table
CREATE TABLE IF NOT EXISTS branch_sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES branch_sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch Staff Attendance Table
CREATE TABLE IF NOT EXISTS branch_staff_attendance (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    hours_worked DECIMAL(4,2),
    status TEXT DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, staff_id, attendance_date)
);

-- Branch Staff Performance Table
CREATE TABLE IF NOT EXISTS branch_staff_performance (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    sales_target DECIMAL(10,2),
    sales_achieved DECIMAL(10,2) DEFAULT 0,
    performance_score DECIMAL(5,2),
    rating TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, staff_id, period_start, period_end)
);

-- Branch Daily Metrics Table
CREATE TABLE IF NOT EXISTS branch_daily_metrics (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10,2) DEFAULT 0,
    staff_count INTEGER DEFAULT 0,
    inventory_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, metric_date)
);

-- Branch Hourly Metrics Table
CREATE TABLE IF NOT EXISTS branch_hourly_metrics (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    hour_of_day INTEGER NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
    sales_amount DECIMAL(10,2) DEFAULT 0,
    customer_count INTEGER DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, metric_date, hour_of_day)
);

-- Branch Expenses Table
CREATE TABLE IF NOT EXISTS branch_expenses (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    expense_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    approved_by UUID REFERENCES user_profiles(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch Budgets Table
CREATE TABLE IF NOT EXISTS branch_budgets (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    budget_type TEXT NOT NULL,
    budget_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    budget_period TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch Reports Table
CREATE TABLE IF NOT EXISTS branch_reports (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    report_date DATE NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, report_date, report_type)
);

-- Branch Transfers Table
CREATE TABLE IF NOT EXISTS branch_transfers (
    id SERIAL PRIMARY KEY,
    from_branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    to_branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    transfer_reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Branch Product Performance Table
CREATE TABLE IF NOT EXISTS branch_product_performance (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    units_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    profit_margin DECIMAL(5,4),
    average_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, product_id, period_start, period_end)
);

-- Branch AI Insights Table
CREATE TABLE IF NOT EXISTS branch_ai_insights (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(5,4),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch Predictions Table
CREATE TABLE IF NOT EXISTS branch_predictions (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branch_locations(id) ON DELETE CASCADE,
    prediction_type TEXT NOT NULL,
    predicted_value DECIMAL(10,2),
    confidence_level DECIMAL(5,4),
    prediction_date DATE NOT NULL,
    actual_value DECIMAL(10,2),
    accuracy_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success message
SELECT 'Multi-business branch system schema created successfully!' as status;
