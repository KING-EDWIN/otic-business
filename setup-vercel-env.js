#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * 
 * This script helps you set up environment variables in Vercel
 * Run this script to automatically configure your Vercel project
 */

import { execSync } from 'child_process';

const environmentVariables = {
  // Core Application
  'VITE_SUPABASE_URL': 'https://jvgiyscchxxekcbdicco.supabase.co',
  'VITE_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8',
  
  // AI Services
  'VITE_MISTRAL_API_KEY': 'mETgieTfZknbjowO3SXnZScl5Ijy4fZx',
  'VITE_DEMO_MODE': 'false',
  
  // QuickBooks API - PRODUCTION
  'VITE_QB_CLIENT_ID': 'ABxbT0hhrZxtrxOrhygwls1wZqd911kOgbcliEudHzrfA1W8Vj',
  'VITE_QB_CLIENT_SECRET': 'VmZlcAHWj5dissuKUdc3XELo2LPr1jp6h20Zp3Rp',
  'VITE_QB_ENVIRONMENT': 'production',
  'VITE_QB_REDIRECT_URI': 'https://otic-business.vercel.app/quickbooks/callback',
  'VITE_QB_COMPANY_ID': '9341455307021048'
};

function setupVercelEnvironment() {
  console.log('🚀 Setting up Vercel Environment Variables...\n');
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed\n');
  } catch (error) {
    console.log('❌ Vercel CLI is not installed. Please install it first:');
    console.log('   npm install -g vercel\n');
    console.log('   Then run this script again.\n');
    return;
  }

  // Check if user is logged in to Vercel
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Logged in to Vercel\n');
  } catch (error) {
    console.log('❌ Not logged in to Vercel. Please login first:');
    console.log('   vercel login\n');
    console.log('   Then run this script again.\n');
    return;
  }

  console.log('📝 Setting up environment variables...\n');

  // Set environment variables for production
  Object.entries(environmentVariables).forEach(([key, value]) => {
    try {
      console.log(`Setting ${key}...`);
      execSync(`vercel env add ${key} production`, {
        input: value,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`✅ ${key} set successfully\n`);
    } catch (error) {
      console.log(`⚠️  ${key} might already exist or there was an error\n`);
    }
  });

  console.log('🎉 Environment variables setup completed!\n');
  console.log('📋 Summary of variables set:');
  Object.keys(environmentVariables).forEach(key => {
    console.log(`   - ${key}`);
  });
  
  console.log('\n🚀 Next steps:');
  console.log('1. Redeploy your application in Vercel');
  console.log('2. Test the production QuickBooks integration');
  console.log('3. Verify all features work correctly');
  
  console.log('\n💡 You can also set these manually in your Vercel dashboard:');
  console.log('   https://vercel.com/dashboard → Your Project → Settings → Environment Variables');
}

// Run the setup
setupVercelEnvironment();
ut