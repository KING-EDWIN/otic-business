-- Fix the branch_hourly_metrics table schema
-- Add missing 'hour' column and fix the table structure

-- First, let's check what columns actually exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_hourly_metrics'
ORDER BY ordinal_position;

-- Drop the existing function that references the missing column
DROP FUNCTION IF EXISTS get_branch_hourly_metrics(UUID, DATE);

-- Add the missing 'hour' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_hourly_metrics' 
        AND column_name = 'hour'
    ) THEN
        ALTER TABLE branch_hourly_metrics ADD COLUMN hour INTEGER;
    END IF;
END $$;

-- Also ensure other required columns exist
DO $$
BEGIN
    -- Add sales column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_hourly_metrics' 
        AND column_name = 'sales'
    ) THEN
        ALTER TABLE branch_hourly_metrics ADD COLUMN sales DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add transactions column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_hourly_metrics' 
        AND column_name = 'transactions'
    ) THEN
        ALTER TABLE branch_hourly_metrics ADD COLUMN transactions INTEGER DEFAULT 0;
    END IF;
    
    -- Add customers column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_hourly_metrics' 
        AND column_name = 'customers'
    ) THEN
        ALTER TABLE branch_hourly_metrics ADD COLUMN customers INTEGER DEFAULT 0;
    END IF;
END $$;

-- Recreate the function with the correct schema
CREATE OR REPLACE FUNCTION get_branch_hourly_metrics(
    branch_id_param UUID,
    date_param DATE
)
RETURNS TABLE (
    id UUID,
    branch_id UUID,
    metric_date DATE,
    hour INTEGER,
    sales DECIMAL(10,2),
    transactions INTEGER,
    customers INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bhm.id,
        bhm.branch_id,
        bhm.metric_date,
        COALESCE(bhm.hour, 0) as hour,
        COALESCE(bhm.sales, 0) as sales,
        COALESCE(bhm.transactions, 0) as transactions,
        COALESCE(bhm.customers, 0) as customers,
        bhm.created_at
    FROM branch_hourly_metrics bhm
    WHERE bhm.branch_id = branch_id_param
    AND bhm.metric_date = date_param
    ORDER BY bhm.hour ASC;
END;
$$;

-- Insert sample hourly data with proper hour values
INSERT INTO branch_hourly_metrics (
    branch_id,
    metric_date,
    hour,
    sales,
    transactions,
    customers
)
SELECT 
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    CURRENT_DATE,
    generate_series(8, 20),
    (RANDOM() * 1000 + 100)::DECIMAL(10,2),
    (RANDOM() * 10 + 1)::INTEGER,
    (RANDOM() * 5 + 1)::INTEGER
WHERE NOT EXISTS (
    SELECT 1 FROM branch_hourly_metrics 
    WHERE branch_id = '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID 
    AND metric_date = CURRENT_DATE
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_branch_hourly_metrics TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Test the function
SELECT 'Testing get_branch_hourly_metrics...' as status;
SELECT * FROM get_branch_hourly_metrics('066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID, CURRENT_DATE);

SELECT 'Hourly metrics schema fixed successfully' as status;

