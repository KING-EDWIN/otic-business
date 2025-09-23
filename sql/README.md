# SQL Folder Structure

This folder contains all SQL scripts organized by purpose:

## 📁 Folder Structure

### `database-setup/`
- **`diagnostics/`** - Scripts to check current database structure
  - Run these scripts first to understand the actual database
  - Paste results back to create proper setup scripts
- **`01-complete-database-setup.sql`** - Main database setup (to be created after diagnostics)

### `rpc-functions/`
- Contains all RPC function definitions
- Organized by functionality (auth, admin, business, etc.)

### `rls-policies/`
- Contains Row Level Security policies
- Organized by table

### `admin-functions/`
- Contains admin-specific functions
- User management, deletion, etc.

### `cleanup/`
- Contains old/duplicate SQL files
- Files moved here for reference but not used

## 🔍 How to Use

1. **First**: Run all scripts in `diagnostics/` folder
2. **Then**: Paste the results here
3. **Finally**: I'll create the proper SQL files based on actual structure

## 📋 Diagnostic Scripts to Run

1. `01-check-all-tables.sql` - Lists all tables
2. `02-check-user-profiles-structure.sql` - User profiles table structure
3. `03-check-businesses-structure.sql` - Businesses table structure
4. `04-check-rpc-functions.sql` - All RPC functions
5. `05-check-rls-policies.sql` - All RLS policies
6. `06-check-all-tables-columns.sql` - All tables with columns
7. `07-check-foreign-keys.sql` - Foreign key relationships
8. `08-check-indexes.sql` - All indexes

Run these in order and paste the results!
