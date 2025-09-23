# Reports Database Setup Guide

## Step 1: Create Tables in Supabase

Go to your Supabase project dashboard → SQL Editor and run the following SQL:

```sql
-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    timeframe VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'generating', 'failed')),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_schedules table
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    recipient_email VARCHAR(255) NOT NULL,
    timeframe VARCHAR(50) NOT NULL,
    next_run_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_views table
CREATE TABLE IF NOT EXISTS report_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_report_schedules_user_id ON report_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run_date);
CREATE INDEX IF NOT EXISTS idx_report_views_report_id ON report_views(report_id);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reports
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON reports
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for report_schedules
CREATE POLICY "Users can view their own report schedules" ON report_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own report schedules" ON report_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own report schedules" ON report_schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own report schedules" ON report_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for report_views
CREATE POLICY "Users can view their own report views" ON report_views
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own report views" ON report_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 2: Seed Sample Data

After creating the tables, run the seeding script:

```bash
node seed-reports-data-final.js
```

## Step 3: Test the Reports Dashboard

1. Start your development server: `npm run dev`
2. Navigate to `/reports` in your application
3. You should see the reports dashboard with real data from Supabase

## Features Available

- ✅ **Real-time report generation** from Supabase data
- ✅ **Report scheduling** with email notifications
- ✅ **Report history** with download capabilities
- ✅ **Report analytics** with view tracking
- ✅ **Multiple report types**: Sales, Financial, Inventory, Customer, Tax, Expense
- ✅ **Beautiful UI** with glass-morphism design
- ✅ **Responsive design** for all screen sizes

## Report Types Available

1. **Sales Reports** - Analyze sales performance and trends
2. **Financial Reports** - Profit & Loss, Balance Sheet, Cash Flow
3. **Inventory Reports** - Stock levels, inventory value, low stock alerts
4. **Customer Reports** - Customer behavior and loyalty analysis
5. **Tax Reports** - VAT, Income Tax, EFRIS reports
6. **Expense Reports** - Business expense tracking and analysis

## Next Steps

Once the tables are created and data is seeded, the Reports dashboard will be fully functional with:
- Real data from your Supabase database
- Ability to generate new reports
- Schedule recurring reports
- Download reports as text files
- Track report views and analytics

