# 30-Day Account Deletion System

## Overview

The Otic Business application implements a **soft delete** system with a **30-day recovery period** for user accounts. This system allows users to recover their accounts within 30 days of deletion, after which the accounts are permanently removed.

## How It Works

### 1. **Soft Delete Process**
When a user requests account deletion:
- Account is moved to `deleted_users` table
- All related data is preserved for 30 days
- User receives a recovery token
- Account is marked as "deleted" but not permanently removed

### 2. **30-Day Recovery Period**
- Users can recover their accounts using the recovery token
- All data is restored to its original state
- Recovery is only possible within 30 days

### 3. **Automatic Cleanup After 30 Days**
- System automatically cleans up expired accounts
- All related data is permanently deleted
- **Exception**: `auth.users` table requires manual deletion

## The Supabase Constraint Issue

### **Problem Identified**
During testing, we discovered that **Supabase has internal constraints** that prevent programmatic deletion from the `auth.users` table, even with the service role key. This manifests as:
```
AuthApiError: Database error deleting user
```

### **Root Cause**
Supabase's `auth.users` table has:
- **Internal foreign key constraints** (not visible in schema)
- **Database triggers** that prevent bulk deletions
- **RLS policies** that block programmatic operations
- **Built-in safety mechanisms** for user data protection

### **Solution**
The system now handles this constraint by:
1. **Automatically cleaning** all related data after 30 days
2. **Identifying accounts** that need manual deletion from `auth.users`
3. **Providing tools** for manual deletion through Supabase dashboard

## System Components

### 1. **Database Functions**

#### `cleanup_expired_deleted_accounts()`
- Cleans up all data for expired accounts
- Returns count of accounts processed
- **Note**: Cannot delete from `auth.users` due to constraints

#### `get_accounts_needing_auth_deletion()`
- Returns list of accounts that need manual deletion from `auth.users`
- Shows accounts that have been cleaned but still exist in `auth.users`

#### `mark_accounts_for_manual_deletion()`
- Marks expired accounts as processed
- Returns count of accounts cleaned
- Used by cron jobs for automatic cleanup

### 2. **Database Views**

#### `accounts_needing_manual_deletion`
- View showing accounts that need manual deletion from `auth.users`
- Includes days expired and status information
- Used by admin interface to display pending deletions

### 3. **Scripts**

#### `30-day-cleanup.js`
- Node.js script for automated cleanup
- Can be run as a cron job
- Attempts programmatic deletion, falls back to manual instructions
- Provides detailed logging and error handling

#### `comprehensive-user-deletion.js`
- One-time script for bulk deletion
- Handles all related data cleanup
- Attempts to delete from `auth.users` (may fail due to constraints)

### 4. **Admin Interface**

#### Manual Deletion Section
- Shows accounts needing manual deletion from `auth.users`
- Provides copy-to-clipboard functionality for emails
- Includes step-by-step instructions for manual deletion
- Displays days expired and account details

## Setup Instructions

### 1. **Run SQL Setup**
```sql
-- Run this in Supabase SQL Editor
\i sql/fix-30-day-deletion-system.sql
```

### 2. **Set Up Cron Job**
```bash
# Add to crontab for daily cleanup at 2 AM
0 2 * * * cd /path/to/otic-business && node scripts/30-day-cleanup.js >> logs/cleanup.log 2>&1
```

### 3. **Manual Deletion Process**
When accounts need manual deletion:
1. Go to Supabase Dashboard → Authentication → Users
2. Search for each email from the admin interface
3. Select and delete each user
4. Or run the cleanup script for automated attempt

## Usage Examples

### **Check Accounts Needing Manual Deletion**
```sql
SELECT * FROM accounts_needing_manual_deletion;
```

### **Run Cleanup Function**
```sql
SELECT cleanup_expired_deleted_accounts();
```

### **Get Accounts for Manual Deletion**
```sql
SELECT * FROM get_accounts_needing_auth_deletion();
```

### **Run Cleanup Script**
```bash
node scripts/30-day-cleanup.js
```

## Admin Interface Usage

### **Accessing Manual Deletion Section**
1. Go to `/internal-admin-portal`
2. Navigate to "Account Deletion Management"
3. Click "Check Manual Deletion" button
4. View accounts needing manual deletion

### **Manual Deletion Process**
1. Click "Copy Email" for each account
2. Go to Supabase Dashboard → Authentication → Users
3. Search for each email and delete
4. Or run the cleanup script

## Monitoring and Logging

### **System Logs**
- All cleanup operations are logged to `system_error_logs`
- Includes account details and operation status
- Tracks successful and failed deletions

### **Admin Interface**
- Shows real-time status of accounts needing manual deletion
- Displays days expired and account details
- Provides copy-to-clipboard functionality

## Best Practices

### **Regular Maintenance**
- Run cleanup script daily via cron job
- Check admin interface weekly for manual deletion needs
- Monitor system logs for errors

### **Manual Deletion**
- Delete accounts in batches through Supabase dashboard
- Use the admin interface to identify accounts needing deletion
- Keep track of deleted accounts for audit purposes

### **Error Handling**
- Scripts gracefully handle Supabase constraints
- Fall back to manual deletion instructions
- Provide clear error messages and logging

## Troubleshooting

### **Common Issues**

#### **"Database error deleting user"**
- **Cause**: Supabase internal constraints
- **Solution**: Use manual deletion through Supabase dashboard

#### **Scripts Not Working**
- **Cause**: Missing service role key or permissions
- **Solution**: Verify service role key in script configuration

#### **Accounts Not Appearing in Manual Deletion**
- **Cause**: Cleanup function not run or accounts not expired
- **Solution**: Run cleanup function manually or wait for expiration

### **Debugging Steps**
1. Check system logs for error details
2. Verify service role key configuration
3. Test manual deletion through Supabase dashboard
4. Run cleanup functions individually to isolate issues

## Security Considerations

### **Service Role Key**
- **Keep secure**: Never commit to version control
- **Use environment variables**: Store in secure configuration
- **Rotate regularly**: Change service role key periodically

### **Manual Deletion**
- **Verify identity**: Confirm account details before deletion
- **Audit trail**: Keep records of manual deletions
- **Access control**: Limit manual deletion to authorized personnel

## Future Improvements

### **Potential Enhancements**
1. **Supabase Admin API Integration**: Direct API calls for auth.users deletion
2. **Automated Dashboard Integration**: Programmatic Supabase dashboard access
3. **Enhanced Monitoring**: Real-time alerts for manual deletion needs
4. **Bulk Operations**: Improved batch deletion capabilities

### **Workarounds**
- **Manual Process**: Use Supabase dashboard for auth.users deletion
- **Script Automation**: Run cleanup scripts regularly
- **Admin Interface**: Monitor and manage manual deletion needs

## Conclusion

The 30-day deletion system provides a robust solution for account management while respecting Supabase's internal constraints. The system automatically handles most cleanup operations and provides clear guidance for manual operations that require Supabase dashboard access.

The key insight is that **Supabase's `auth.users` table has special protections** that require manual deletion through the dashboard, but all other data can be cleaned up programmatically. This hybrid approach ensures data privacy while maintaining system functionality.
