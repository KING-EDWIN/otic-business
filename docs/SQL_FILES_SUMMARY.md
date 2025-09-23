# SQL Files Summary

## ✅ Important SQL Files (Keep These)

### 1. **`00-complete-table-creation.sql`** - Core Table Creation
- **Purpose**: Creates ALL core tables needed for the application
- **When to use**: Initial database setup (run FIRST)
- **Status**: ✅ Working and tested

### 2. **`RLS-handler.sql`** - RLS Policies Setup
- **Purpose**: Sets up RLS policies and ensures tables exist
- **When to use**: After running table creation script
- **Status**: ✅ Working and tested

### 3. **`15-comprehensive-faq-fix.sql`** - FAQ System Fix
- **Purpose**: Fixes FAQ system access issues
- **When to use**: When FAQ management has problems
- **Status**: ✅ Working and tested

### 3. **`13-create-faq-system.sql`** - FAQ System Creation
- **Purpose**: Creates the FAQ system with questions, answers, and tier information
- **When to use**: Initial FAQ system setup
- **Status**: ✅ Working and tested

### 4. **`03-add-email-verification.sql`** - Email Verification
- **Purpose**: Adds email verification system to user profiles
- **When to use**: When implementing email verification
- **Status**: ✅ Working and tested

### 5. **`68-fix-admin-portal-final-correct.sql`** - Admin Portal Fix
- **Purpose**: Fixes admin portal using correct table structure
- **When to use**: When admin portal has issues
- **Status**: ✅ Working and tested

### 6. **`create-payment-tables.sql`** - Payment System
- **Purpose**: Creates payment system tables for tier upgrades
- **When to use**: When implementing payment functionality
- **Status**: ✅ Working and tested

### 7. **`complete-signup-trigger.sql`** - Signup Automation
- **Purpose**: Automatically creates all necessary records when a user signs up
- **When to use**: For automated user profile creation
- **Status**: ✅ Working and tested

## 🗑️ Removed Files (Failed or Duplicate)

The following files were removed because they:
- ❌ Didn't work as expected
- ❌ Were duplicates of working solutions
- ❌ Were diagnostic files no longer needed
- ❌ Were part of failed attempts

**Total removed**: 100+ SQL files

## 🎯 Usage Guidelines

### For New Tables
1. **Always use `RLS-handler.sql`** - Add new tables to this file
2. **Follow the pattern** - Table creation, RLS policy, RLS enable, index
3. **Test thoroughly** - Verify table access works in application

### For Specific Issues
- **FAQ problems** → Use `15-comprehensive-faq-fix.sql`
- **Admin portal issues** → Use `68-fix-admin-portal-final-correct.sql`
- **Email verification** → Use `03-add-email-verification.sql`
- **Payment system** → Use `create-payment-tables.sql`

### For Initial Setup
1. Run `RLS-handler.sql` first
2. Run other specific scripts as needed
3. Test all functionality

## 📋 Maintenance

- **Keep this list updated** when adding new SQL files
- **Document purpose** of each new file
- **Test before keeping** - Only keep files that work
- **Remove duplicates** - Don't keep multiple files doing the same thing

---

**Total SQL files kept**: 7 (all working and important)
**Total SQL files removed**: 100+ (failed or duplicate)
