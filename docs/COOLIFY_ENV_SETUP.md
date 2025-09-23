# Coolify Environment Variables Setup

## 🚀 Quick Setup Checklist

### 1. **Get Your Domain Ready**
- Deploy your app to Coolify first
- Note your domain (e.g., `https://otic-business.yourdomain.com`)

### 2. **Update QuickBooks Settings**
1. Go to [Intuit Developer Console](https://developer.intuit.com/)
2. Select your app
3. Go to **Settings** → **Redirect URIs**
4. **Remove**: `https://otic-businesssss.vercel.app/quickbooks/callback`
5. **Add**: `https://yourdomain.com/quickbooks/callback`
6. Click **Save**

### 3. **Update Supabase CORS Settings**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll to **CORS Settings**
5. **Add**: `https://yourdomain.com`
6. **Add**: `https://www.yourdomain.com` (if using www)
7. Click **Save**

### 4. **Set Environment Variables in Coolify**

Copy these variables to your Coolify app settings:

```bash
# Supabase (same as before)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# QuickBooks (UPDATED with your domain)
VITE_QB_CLIENT_ID=your_quickbooks_client_id
VITE_QB_CLIENT_SECRET=your_quickbooks_client_secret
VITE_QB_REDIRECT_URI=https://yourdomain.com/quickbooks/callback
VITE_QB_ENVIRONMENT=production
VITE_QB_COMPANY_ID=your_quickbooks_company_id

# Mistral AI (same as before)
VITE_MISTRAL_API_KEY=your_mistral_api_key

# Admin API (same as before)
VITE_ADMIN_API_SECRET=your_admin_api_secret

# App Config
NODE_ENV=production
```

## 🔧 Step-by-Step Instructions

### Step 1: Deploy to Coolify
1. Create new application in Coolify
2. Connect to: `https://github.com/KING-EDWIN/otic-business.git`
3. Use `docker-compose.yml`
4. Deploy (even without env vars first)

### Step 2: Get Your Domain
- Note the domain Coolify assigns (e.g., `https://otic-business-abc123.coolify.app`)
- Or configure your custom domain

### Step 3: Update External Services
**QuickBooks:**
- Update redirect URI to your Coolify domain
- Test connection after deployment

**Supabase:**
- Add your Coolify domain to CORS settings
- Test API calls after deployment

### Step 4: Set Environment Variables
- Add all variables from the template above
- Replace `yourdomain.com` with your actual domain
- Redeploy the application

## 🧪 Testing Your Setup

### 1. **Test Basic App**
- Visit your domain
- Check if the app loads without errors

### 2. **Test Authentication**
- Try signing up with a new account
- Try signing in with existing account
- Check if user appears in Supabase

### 3. **Test QuickBooks**
- Go to Accounting dashboard
- Click "Connect to QuickBooks"
- Complete OAuth flow
- Verify connection status

### 4. **Test AI Features**
- Go to Analytics dashboard
- Check if AI insights load
- Test AI chat functionality

## 🚨 Common Issues & Solutions

### Issue: "Redirect URI Mismatch"
**Solution:** Update QuickBooks redirect URI to match your Coolify domain exactly

### Issue: "CORS Error"
**Solution:** Add your Coolify domain to Supabase CORS settings

### Issue: "Environment Variable Not Found"
**Solution:** Check variable names in Coolify (must start with `VITE_`)

### Issue: "QuickBooks Connection Failed"
**Solution:** 
1. Verify redirect URI matches exactly
2. Check if using production vs sandbox credentials
3. Ensure company ID is correct

## 📝 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_QB_CLIENT_ID` | QuickBooks OAuth client ID | `ABc123Def456Ghi789` |
| `VITE_QB_CLIENT_SECRET` | QuickBooks OAuth secret | `secret123456789` |
| `VITE_QB_REDIRECT_URI` | OAuth callback URL | `https://yourdomain.com/quickbooks/callback` |
| `VITE_QB_ENVIRONMENT` | QB environment | `production` |
| `VITE_QB_COMPANY_ID` | QB company ID | `123456789` |
| `VITE_MISTRAL_API_KEY` | Mistral AI API key | `mistral-abc123...` |
| `VITE_ADMIN_API_SECRET` | Admin operations secret | `admin-secret-123` |

## ✅ Final Checklist

- [ ] App deployed to Coolify
- [ ] Domain configured and accessible
- [ ] QuickBooks redirect URI updated
- [ ] Supabase CORS settings updated
- [ ] All environment variables set in Coolify
- [ ] App redeployed with new variables
- [ ] Authentication working
- [ ] QuickBooks connection working
- [ ] AI features working
- [ ] All dashboards loading properly

## 🆘 Need Help?

If you encounter issues:
1. Check Coolify deployment logs
2. Verify all environment variables are set
3. Test each service individually
4. Check browser console for errors
5. Verify external service settings (QuickBooks, Supabase)



