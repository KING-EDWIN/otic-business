# 🚨 URGENT: Multi-Business Setup Guide

## **IMMEDIATE ACTION REQUIRED**

The application is showing errors because the database schema hasn't been set up yet. Follow these steps **in order**:

### **Step 1: Run Database Schema (CRITICAL)**

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run these scripts in this exact order:**

#### **Script 1: Business Management Schema**
Copy and paste the contents of `103-minimal-business-setup.sql` and run it.

#### **Script 2: Fix Sales Table**
Copy and paste the contents of `104-fix-sales-rls.sql` and run it.

#### **Script 3: Fix Products Table**
Copy and paste the contents of `105-fix-products-rls.sql` and run it.

### **Step 2: Verify Setup**

After running the scripts, test these URLs:
- `/business-management` - Should show business management page
- `/my-extras` - Should show Multi-Business Management feature
- Dashboard should show business switcher in the user dropdown

### **Step 3: Test Business Creation**

1. Go to `/business-management`
2. Click "Create Business"
3. Fill out the form and create a business
4. Test switching between businesses

## **What These Scripts Do:**

### **103-minimal-business-setup.sql:**
- Creates all business management tables
- Sets up RLS policies
- Creates helper functions
- Adds sample data for testing

### **104-fix-sales-rls.sql:**
- Fixes sales table RLS issues
- Adds sample sales data
- Resolves "Sales fetch timeout" errors

### **105-fix-products-rls.sql:**
- Fixes products table RLS issues
- Adds sample products data
- Resolves product-related errors

## **Expected Results After Setup:**

✅ No more "Network connection lost" errors
✅ No more "can_create_business" 404 errors
✅ No more "Sales fetch timeout" errors
✅ Business management pages work
✅ Business switcher works in dropdown
✅ Multi-Business Management feature works in MyExtras

## **If You Still See Errors:**

1. **Check RLS Policies**: Make sure all tables have proper RLS policies
2. **Check Functions**: Verify that `get_user_businesses`, `can_create_business`, etc. exist
3. **Check Sample Data**: Ensure sample data was inserted correctly

## **Quick Test Commands:**

After setup, you can test these in the browser console:

```javascript
// Test business creation
const { data } = await supabase.rpc('can_create_business', {
  user_id_param: '3488046f-56cf-4711-9045-7e6e158a1c91'
});
console.log('Can create business:', data);

// Test business fetching
const { data: businesses } = await supabase.rpc('get_user_businesses', {
  user_id_param: '3488046f-56cf-4711-9045-7e6e158a1c91'
});
console.log('User businesses:', businesses);
```

## **🚀 Ready to Go!**

Once you run these scripts, the multi-business management system will be fully functional!


