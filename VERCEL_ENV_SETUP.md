# 🚨 URGENT: Fix Vercel Environment Variables

## The Problem
Your deployed app is showing "Accounting Error" because the Supabase environment variables are not set in Vercel, causing authentication to fail.

## 🔧 IMMEDIATE FIX

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in and go to your project: `otic-businesssss`
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar

### Step 2: Add These Variables
Click **"Add New"** for each variable:

#### **Variable 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://jvgiyscchxxekcbdicco.supabase.co`
- **Environment:** Select **ALL** (Production, Preview, Development)

#### **Variable 2:**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8`
- **Environment:** Select **ALL** (Production, Preview, Development)

#### **Variable 3:**
- **Name:** `VITE_MISTRAL_API_KEY`
- **Value:** `your_mistral_api_key_here` (get from console.mistral.ai)
- **Environment:** Select **ALL** (Production, Preview, Development)

#### **Variable 4:**
- **Name:** `VITE_GOOGLE_CLIENT_ID`
- **Value:** `your_google_client_id_here` (get from Google Cloud Console)
- **Environment:** Select **ALL** (Production, Preview, Development)

### Step 3: Redeploy
1. After adding all variables, go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for the build to complete

## ✅ Expected Result
After adding these variables and redeploying:
- ✅ No more "Accounting Error"
- ✅ Dashboard loads properly
- ✅ All features work
- ✅ Demo account works

## 🆘 If Still Not Working
1. Check the browser console for any remaining errors
2. Verify all variables are set correctly
3. Make sure you selected "ALL" environments for each variable
4. Try clearing Vercel's build cache

## 📞 Quick Test
After redeploying, visit your Vercel URL and:
1. Click "Sign In"
2. Use demo credentials: `demo@oticbusiness.com` / `demo123456`
3. Check if dashboard loads without errors

