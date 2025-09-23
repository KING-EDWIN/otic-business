-- PERFORMANCE CHECK AND OPTIMIZATION
-- Run this script to check database performance and optimize queries

-- Check table sizes and performance
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'businesses', 'business_memberships', 'user_profiles')
ORDER BY tablename, attname;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries (if available)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query LIKE '%products%' 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check RPC function performance
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%product%'
ORDER BY routine_name;

-- Test product query performance
EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE business_id = '00000000-0000-0000-0000-000000000000' 
LIMIT 10;

-- Check for missing indexes
SELECT 
    t.tablename,
    c.column_name,
    c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND t.tablename = 'products'
AND c.column_name IN ('business_id', 'barcode', 'user_id', 'category', 'status')
ORDER BY c.ordinal_position;

-- Show current database configuration
SELECT name, setting, unit, context 
FROM pg_settings 
WHERE name IN (
    'shared_buffers',
    'effective_cache_size',
    'work_mem',
    'maintenance_work_mem',
    'random_page_cost',
    'seq_page_cost'
);

-- Check for table bloat
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;

-- Performance recommendations
SELECT 'Performance Check Complete' as status,
       'Check the results above for optimization opportunities' as recommendation;




