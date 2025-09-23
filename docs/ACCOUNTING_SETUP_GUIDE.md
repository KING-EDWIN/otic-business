# Accounting Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Create Tables in Supabase
1. Go to your Supabase project: https://supabase.com/dashboard/project/jvgiyscchxxekcbdicco
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `accounting-tables-fixed.sql` and run it
4. You should see "Accounting tables created successfully!" message

### Step 2: Add Sample Data
1. In the same SQL Editor, copy and paste the contents of `add-sample-accounting-data.sql` and run it
2. You should see "Sample accounting data added successfully!" message

### Step 3: Test the Accounting Page
1. Make sure you have a user account (sign up at http://localhost:8080/signup if needed)
2. Navigate to http://localhost:8080/accounting
3. You should see the professional accounting dashboard with real data

## 📊 What's Included

### Tables Created:
- **chart_of_accounts** - Chart of accounts structure
- **bank_accounts** - Bank account management
- **invoices** - Invoice management
- **invoice_items** - Invoice line items
- **expenses** - Expense tracking
- **transactions** - General ledger transactions
- **profit_loss_summary** - Quick P&L access
- **customers** - Customer management

### Sample Data Added:
- 3 Bank accounts (Cash, Checking, Credit Card)
- 3 Expense categories (Marketing, Subscriptions, Depreciation)
- 2 Customers (Acme Corp, Tech Solutions)
- 2 Invoices (1 paid, 1 overdue)
- Sample transactions and P&L data

## 🔧 Troubleshooting

### If you get "column does not exist" errors:
- Make sure you ran `accounting-tables-fixed.sql` first
- Check that all tables were created successfully

### If the accounting page is still blank:
- Check browser console for errors
- Make sure you're logged in with a valid user account
- Verify the sample data was added for your user

### If you see "No users found":
- Sign up for a new account at http://localhost:8080/signup
- Or use an existing account

## 🎯 Features

The accounting page now includes:
- **Real-time data** from Supabase
- **Professional layout** matching your design
- **Interactive charts** for expenses and sales
- **Bank account management**
- **Invoice tracking**
- **Expense categorization**
- **Customer management**

## 📝 Next Steps

After setup, you can:
1. Add more bank accounts
2. Create invoices for customers
3. Track expenses by category
4. View financial reports
5. Manage customer information

The accounting system is now fully functional with real data!

