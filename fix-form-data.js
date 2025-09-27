#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFile = path.join(__dirname, 'fix-form-data-storage.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

console.log('🔧 Form Data Storage Fix Script');
console.log('================================');
console.log('');
console.log('This script fixes RLS policies and ensures all forms can store data properly.');
console.log('');
console.log('📋 Issues Fixed:');
console.log('• Products table RLS policies blocking inserts');
console.log('• Contact messages table RLS policies');
console.log('• Businesses table RLS policies');
console.log('• Business memberships table RLS policies');
console.log('• Individual user tables RLS policies');
console.log('• Missing individual_time_entries and individual_tasks tables');
console.log('');
console.log('🚀 To apply this fix:');
console.log('1. Copy the SQL content below');
console.log('2. Go to Supabase Dashboard → SQL Editor');
console.log('3. Paste and run the SQL');
console.log('');
console.log('📄 SQL Content:');
console.log('================================');
console.log(sqlContent);
console.log('================================');
console.log('');
console.log('✅ After running the SQL, all forms should be able to store data properly!');
console.log('');
console.log('🧪 Test the fix by:');
console.log('• Creating a new business');
console.log('• Registering a commodity/product');
console.log('• Submitting a contact form');
console.log('• Creating individual user tasks/time entries');
console.log('');
console.log('📊 You can also test the fix by running:');
console.log('SELECT test_form_data_insertion();');
console.log('');
console.log('🎉 Form data storage issues should now be resolved!');
