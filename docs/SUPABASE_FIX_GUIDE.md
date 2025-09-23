# Supabase RLS Policy Fix Guide

## Problem
The application is getting "access control checks" errors when trying to query Supabase tables. This is because Row Level Security (RLS) policies are blocking access to the database.

## Root Cause
- RLS is enabled on tables but proper policies are missing
- The `auth.uid()` function might not be working correctly
- User authentication might not be properly set up
- **NEW**: Permission denied for schema auth (superuser required)

## Solution Steps

### Step 1: Diagnose the Issue
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the `diagnose-supabase-issues.sql` script
4. This will show you the current state of your database

### Step 2A: Quick Fix - Disable RLS Temporarily
1. Run the `disable-rls-temporarily.sql` script
2. This will disable RLS on all tables temporarily
3. Test your application to see if it works
4. **WARNING**: This makes data accessible to all authenticated users

### Step 2B: Proper Fix - Enable RLS with Policies
1. Run the `fix-supabase-rls-policies-corrected.sql` script
2. This version doesn't try to access the auth schema
3. This will create all necessary RLS policies

### Step 3: Test the Connection
1. Open the `test-supabase-connection-simple.html` file in your browser
2. This will test the connection and show specific error messages
3. Check for any authentication or query errors

### Step 4: Verify Authentication
1. Check if users can authenticate properly
2. Ensure the `auth.uid()` function returns the correct user ID
3. Verify that user_profiles table has the correct user IDs

## Expected Results After Fix
- ✅ No more "access control checks" errors
- ✅ Queries to sales, products, user_profiles will work
- ✅ Real-time data will load properly
- ✅ No fallback data needed

## Troubleshooting

### If RLS policies don't work:
1. Check if `auth.uid()` function exists and works
2. Verify user authentication is working
3. Check if user IDs match between auth.users and user_profiles

### If tables don't exist:
1. Run the table creation scripts
2. Ensure all foreign key relationships are correct
3. Check if migrations were applied properly

### If authentication fails:
1. Check Supabase project settings
2. Verify API keys are correct
3. Check if user is properly signed in

## Files Created
- `fix-supabase-rls-policies.sql` - Fixes RLS policies
- `check-supabase-setup.sql` - Diagnoses current setup
- `test-supabase-connection.js` - Tests connection in browser

## Next Steps
1. Run the SQL scripts in Supabase
2. Test the application
3. Check browser console for any remaining errors
4. Verify real-time data loading works
