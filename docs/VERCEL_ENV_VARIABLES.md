# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

Add these in your Vercel Dashboard → Project Settings → Environment Variables:

### 1. **Supabase Configuration** (REQUIRED)
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **AI Services** (REQUIRED for AI features)
```
VITE_MISTRAL_API_KEY=your_mistral_api_key_here
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### 3. **Accounting Integration** (REQUIRED for accounting features)
```
VITE_AKAUNTING_URL=https://your-akaunting-instance.com
VITE_AKAUNTING_API_KEY=your_akaunting_api_key_here
```

### 4. **Google OAuth** (REQUIRED for Google sign-in)
```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

### 5. **Optional: Analytics & Monitoring**
```
VITE_GOOGLE_ANALYTICS_ID=your_ga_id_here
VITE_SENTRY_DSN=your_sentry_dsn_here
```

## 🚨 How to Add Environment Variables in Vercel:

1. **Go to Vercel Dashboard**
2. **Select your project** (`otic-businesssss`)
3. **Click "Settings"** tab
4. **Click "Environment Variables"** in the left sidebar
5. **Add each variable** with:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://your-project-id.supabase.co`
   - **Environment**: Select all (Production, Preview, Development)
6. **Click "Save"**
7. **Repeat for each variable**

## 🔍 Where to Get These Values:

### Supabase
- Go to your Supabase project dashboard
- Settings → API
- Copy "Project URL" and "anon public" key

### Mistral AI
- Go to [console.mistral.ai](https://console.mistral.ai)
- Create account and get API key

### Akaunting
- Set up your Akaunting instance
- Go to Settings → API
- Generate API key

### Google OAuth
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create OAuth 2.0 Client ID
- Add your Vercel domain to authorized origins

## ⚠️ Important Notes:

1. **All variables must start with `VITE_`** for Vite to include them
2. **Add to all environments** (Production, Preview, Development)
3. **Redeploy after adding variables**
4. **Never commit actual API keys to Git**

## 🚀 After Adding Variables:

1. **Redeploy** your project
2. **Test** all features
3. **Check** browser console for any missing variables
4. **Verify** all integrations work

## 🆘 Troubleshooting:

If you get errors about missing variables:
1. Check variable names start with `VITE_`
2. Ensure they're added to all environments
3. Redeploy after adding new variables
4. Check Vercel build logs for errors


