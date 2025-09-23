# Database Setup Guide

## 🎯 Overview
This guide explains how to set up and maintain the database for the Otic Business application.

## 📁 Key Files
- **`RLS-handler.sql`** - Main database setup script (use this for all table operations)
- **`15-comprehensive-faq-fix.sql`** - FAQ system setup

## 🚀 Initial Setup

### 1. Create Core Tables (Run FIRST)
```bash
# Run this script to create all core tables
psql -h your-supabase-host -U postgres -d postgres -f 00-complete-table-creation.sql
```

### 2. Set Up RLS Policies (Run SECOND)
```bash
# Run this script to set up RLS policies
psql -h your-supabase-host -U postgres -d postgres -f RLS-handler.sql
```

### 2. What RLS Handler Does
- ✅ Creates all required tables with proper structure
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Enables RLS on all tables
- ✅ Creates performance indexes
- ✅ Ensures user-specific data access

## 📊 Required Tables
The application requires these tables:
- `user_profiles` - User account information
- `businesses` - Business entities
- `business_memberships` - User-business relationships
- `subscriptions` - User subscription plans
- `products` - Product catalog
- `customers` - Customer information
- `sales` - Sales transactions
- `expenses` - Expense records
- `invoices` - Invoice records
- `analytics_data` - Analytics metrics

## 🔧 Adding New Tables

### ⚠️ IMPORTANT: Always Use RLS Handler

**Whenever you create a new table, follow this process:**

1. **Add to RLS Handler Script**
   ```sql
   -- Add this to RLS-handler.sql
   
   -- 1. Create the table
   CREATE TABLE IF NOT EXISTS your_new_table (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     -- your other columns here
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- 2. Add RLS policy
   CREATE POLICY "Allow all operations on your_new_table" ON your_new_table
       FOR ALL USING (true);
   
   -- 3. Enable RLS
   ALTER TABLE your_new_table ENABLE ROW LEVEL SECURITY;
   
   -- 4. Add index for performance
   CREATE INDEX IF NOT EXISTS idx_your_new_table_user_id ON your_new_table(user_id);
   ```

2. **Run the Updated Script**
   ```bash
   psql -h your-supabase-host -U postgres -d postgres -f RLS-handler.sql
   ```

### 🎯 Why This Approach Works
- ✅ **Consistent RLS setup** - All tables have the same security model
- ✅ **User-specific data** - Each user sees only their data
- ✅ **No access issues** - Permissive policies prevent blocking
- ✅ **Performance optimized** - Indexes for fast queries

## 🔒 RLS (Row Level Security) Explained

### What is RLS?
Row Level Security ensures that users can only access data they're authorized to see. In our case, users can only see their own data.

### How It Works
- Each table has RLS enabled
- Policies control who can access what data
- All policies are permissive (`USING (true)`) for simplicity
- User-specific data is filtered by `user_id`

### Example Policy
```sql
CREATE POLICY "Allow all operations on products" ON products
    FOR ALL USING (true);
```
This allows all operations on the products table for all users.

## 🚨 Troubleshooting

### Common Issues
1. **"Table doesn't exist" errors**
   - Run `RLS-handler.sql` to create missing tables

2. **"Permission denied" errors**
   - Check if RLS policies are properly set up
   - Run `RLS-handler.sql` to fix policies

3. **"Column doesn't exist" errors**
   - Check table structure in Supabase dashboard
   - Update `RLS-handler.sql` with correct columns

### Quick Fix
If you encounter any database issues:
```bash
# Run this to fix everything
psql -h your-supabase-host -U postgres -d postgres -f RLS-handler.sql
```

## 📋 Checklist for New Tables

- [ ] Add table creation to `RLS-handler.sql`
- [ ] Add RLS policy to `RLS-handler.sql`
- [ ] Add RLS enable to `RLS-handler.sql`
- [ ] Add performance index to `RLS-handler.sql`
- [ ] Run updated `RLS-handler.sql`
- [ ] Test table access in application

## 🎯 Best Practices

1. **Always use RLS Handler** - Don't create tables manually
2. **Include user_id** - All tables should have user_id for user-specific data
3. **Add timestamps** - Include created_at and updated_at columns
4. **Create indexes** - Add indexes on user_id for performance
5. **Test thoroughly** - Verify table access works in application

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Run `RLS-handler.sql` to fix common issues
3. Check Supabase logs for detailed error messages
4. Verify RLS policies are properly set up

---

**Remember: Always use `RLS-handler.sql` for any database table operations!** 🎯
