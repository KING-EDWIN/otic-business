# 🚨 SIMPLE FIX: Add Environment Variables to Vercel

## The Problem
Your app works locally because it has access to your Supabase database. The deployed app fails because it can't connect to Supabase without the environment variables.

## ✅ SIMPLE SOLUTION

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Go to your project: `otic-businesssss`
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar

### Step 2: Add These 2 Variables
Click **"Add New"** for each:

**Variable 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://jvgiyscchxxekcbdicco.supabase.co`
- **Environment:** Select **ALL** (Production, Preview, Development)

**Variable 2:**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8`
- **Environment:** Select **ALL** (Production, Preview, Development)

### Step 3: Redeploy
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for build to complete

## ✅ That's It!
After adding these 2 variables and redeploying:
- ✅ App will connect to your existing Supabase database
- ✅ All your existing data will be available
- ✅ No need to create new data
- ✅ Everything will work exactly like locally

## 🎯 Test
1. Visit your Vercel URL after redeploy
2. Sign in with demo account: `demo@oticbusiness.com` / `demo123456`
3. Check if all data loads from Supabase


