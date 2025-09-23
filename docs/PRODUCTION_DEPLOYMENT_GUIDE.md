# 🚀 Production Deployment Guide

## Environment Variables Setup

The application requires specific environment variables to work properly in production. Without these, you'll see "page interrupted" errors.

### Required Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://jvgiyscchxxekcbdicco.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8

# Flutterwave Configuration (REQUIRED for payments)
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key-X
VITE_FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key-X

# QuickBooks Configuration (OPTIONAL)
VITE_QB_CLIENT_ID=your_quickbooks_client_id
VITE_QB_CLIENT_SECRET=your_quickbooks_client_secret
VITE_QB_REDIRECT_URI=https://oticbusiness.com/quickbooks/callback
VITE_QB_ENVIRONMENT=sandbox

# Frontend URL for CORS (REQUIRED)
FRONTEND_URL=https://oticbusiness.com

# Environment
NODE_ENV=production
```

## Deployment Platforms

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Set Environment Variables**: Go to Project Settings → Environment Variables
3. **Add all variables above**
4. **Deploy**: Vercel will automatically build and deploy

### Netlify Deployment

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Set Environment Variables**: Go to Site Settings → Environment Variables
3. **Add all variables above**
4. **Deploy**: Netlify will automatically build and deploy

### Manual Deployment

1. **Build the project**: `npm run build`
2. **Upload dist folder** to your hosting provider
3. **Set environment variables** in your hosting platform
4. **Configure redirects** to handle SPA routing

## Common Issues & Solutions

### "Page Interrupted" Error

**Cause**: Missing environment variables
**Solution**: Ensure all required environment variables are set in your hosting platform

### CORS Errors

**Cause**: Frontend URL not configured properly
**Solution**: Set `FRONTEND_URL=https://oticbusiness.com` in environment variables

### Authentication Issues

**Cause**: Supabase configuration missing
**Solution**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### Payment Issues

**Cause**: Flutterwave keys missing
**Solution**: Set `VITE_FLUTTERWAVE_PUBLIC_KEY` and `VITE_FLUTTERWAVE_SECRET_KEY`

## Testing Production Deployment

1. **Check Environment Variables**: Open browser console and look for Supabase initialization logs
2. **Test Authentication**: Try signing up/signing in
3. **Test Payments**: Try the payment flow (use test keys)
4. **Check Console**: Look for any error messages

## Security Notes

- Never commit environment variables to git
- Use different keys for development and production
- Regularly rotate API keys
- Monitor usage and set up alerts

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Test with a fresh browser session
4. Contact support with specific error messages
