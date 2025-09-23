# User Isolation Test Guide

## How to Test User Data Isolation

### 1. Demo Account (Should have access to ALL features)
- **User ID**: `00000000-0000-0000-0000-000000000001`
- **Tier**: Premium (access to all features)
- **Features**: All reports, email notifications, advanced analytics

### 2. Real User Signup Test

#### Step 1: Sign Up a New User
1. Go to `http://localhost:8080/signup`
2. Create a new account with:
   - Email: `test@example.com`
   - Password: `password123`
   - Business Name: `Test Business`
   - Tier: `free_trial` (default)

#### Step 2: Verify Data Isolation
1. **Login as the new user**
2. **Check Dashboard**: Should show "FREE_TRIAL Plan" in header
3. **Check Reports Tab**: Should show tier restriction for advanced reports
4. **Check Data**: Should see empty data (no demo data)

#### Step 3: Test Tier Restrictions
1. **Free Trial User**:
   - ✅ Can access basic POS
   - ✅ Can access basic inventory
   - ❌ Cannot access advanced reports (should see upgrade prompt)
   - ❌ Cannot access email notifications

2. **Upgrade to Basic**:
   - ✅ Can access basic reports
   - ✅ Can access customer management
   - ❌ Cannot access advanced reports

3. **Upgrade to Standard**:
   - ✅ Can access advanced reports
   - ✅ Can access email notifications
   - ✅ Can access AI analytics

4. **Upgrade to Premium**:
   - ✅ Can access all features
   - ✅ Can access multi-branch management
   - ✅ Can access API access

### 3. Expected Behavior

#### Demo Account (00000000-0000-0000-0000-000000000001)
- Shows demo data from the database
- Has access to all features
- Tier shows as "PREMIUM"

#### Real Users
- Start with empty data
- Only see their own data
- Tier restrictions apply based on subscription
- Data is properly isolated between users

### 4. Test Scenarios

1. **Create multiple real users** and verify they don't see each other's data
2. **Test tier upgrades** and verify feature access changes
3. **Test demo mode** and verify it still works for showcasing
4. **Test data persistence** - add some data as a real user and verify it persists

### 5. Database Verification

Check Supabase to verify:
- Each user has their own `user_id` in all tables
- Demo data is only associated with `00000000-0000-0000-0000-000000000001`
- Real user data is properly isolated
- RLS policies are working correctly


