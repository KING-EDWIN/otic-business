-- Refresh Supabase Schema Cache
-- Run this in your Supabase SQL Editor to refresh the schema cache

-- This will refresh the schema cache and make the new RPC functions available
NOTIFY pgrst, 'reload schema';

-- Alternative: You can also try this command
-- SELECT pg_notify('pgrst', 'reload schema');
