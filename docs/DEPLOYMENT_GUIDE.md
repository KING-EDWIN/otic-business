# 🚀 Otic Business - Server Deployment Guide

## 📋 Overview
This guide explains how to deploy the Otic Business application to different servers by updating only the configuration file.

## 🔧 Configuration File
All server-specific settings are centralized in: `src/config/storageConfig.ts`

## 🌐 Environment Setup

### 1. Database Configuration
Update the `DATABASE` section in `storageConfig.ts`:

```typescript
DATABASE: {
  // Main Supabase Configuration
  SUPABASE_URL: 'https://your-new-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-new-supabase-anon-key',
  
  // Environment-specific configurations
  DEVELOPMENT: {
    SUPABASE_URL: 'https://dev-project.supabase.co',
    SUPABASE_ANON_KEY: 'dev-supabase-anon-key',
  },
  STAGING: {
    SUPABASE_URL: 'https://staging-project.supabase.co',
    SUPABASE_ANON_KEY: 'staging-supabase-anon-key',
  },
  PRODUCTION: {
    SUPABASE_URL: 'https://prod-project.supabase.co',
    SUPABASE_ANON_KEY: 'prod-supabase-anon-key',
  }
}
```

### 2. API Configuration
Update the `API_BASE_URL` for your server:

```typescript
API_BASE_URL: 'https://api.yourdomain.com', // Your API base URL
```

### 3. Environment Selection
Set the current environment:

```typescript
ENVIRONMENT: 'production', // 'development' | 'staging' | 'production'
```

### 4. Online/Offline Mode
Choose the mode:

```typescript
USE_OFFLINE_MODE: false, // true for offline development, false for production
```

## 🗄️ Database Migration

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL migration script: `migrate-to-clean-auth.sql`
3. Update the configuration with your new Supabase credentials

### Required Tables
The application expects these tables:
- `user_profiles` - User profile information
- `products` - Product inventory
- `sales` - Sales transactions
- `sale_items` - Individual sale items
- `payment_requests` - Payment request tracking

## 🔑 External Services

### Payment Processing
Update payment provider settings:

```typescript
EXTERNAL_SERVICES: {
  PAYMENT_PROVIDER: 'flutterwave', // or 'stripe', 'paypal'
  FLUTTERWAVE_PUBLIC_KEY: 'your-flutterwave-public-key',
  FLUTTERWAVE_SECRET_KEY: 'your-flutterwave-secret-key',
}
```

### Email Service
Configure email provider:

```typescript
EXTERNAL_SERVICES: {
  EMAIL_PROVIDER: 'sendgrid', // or 'mailgun', 'ses'
  SENDGRID_API_KEY: 'your-sendgrid-api-key',
}
```

### AI Services
Set up AI provider:

```typescript
EXTERNAL_SERVICES: {
  AI_PROVIDER: 'openai', // or 'anthropic', 'local'
  OPENAI_API_KEY: 'your-openai-api-key',
}
```

## 🚀 Deployment Steps

### 1. Update Configuration
Edit `src/config/storageConfig.ts` with your server details.

### 2. Build Application
```bash
npm run build
```

### 3. Deploy
Deploy the `dist` folder to your hosting provider:
- Vercel
- Netlify
- AWS S3 + CloudFront
- DigitalOcean App Platform
- Any static hosting service

### 4. Environment Variables (Optional)
You can also use environment variables by updating the configuration to read from `import.meta.env`:

```typescript
SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'fallback-url',
SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-key',
```

## 🔄 Switching Between Environments

### Development
```typescript
ENVIRONMENT: 'development'
USE_OFFLINE_MODE: true // for local development
```

### Staging
```typescript
ENVIRONMENT: 'staging'
USE_OFFLINE_MODE: false
```

### Production
```typescript
ENVIRONMENT: 'production'
USE_OFFLINE_MODE: false
```

## 🛠️ Feature Flags

Control features without code changes:

```typescript
FEATURES: {
  ENABLE_AI_INSIGHTS: true,
  ENABLE_BARCODE_SCANNING: true,
  ENABLE_RECEIPT_GENERATION: true,
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_PAYMENT_PROCESSING: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: true,
  ENABLE_REPORTS: true,
}
```

## 🎨 UI Customization

Update branding and colors:

```typescript
UI: {
  THEME: {
    PRIMARY_COLOR: '#040458',
    SECONDARY_COLOR: '#faa51a',
    SUCCESS_COLOR: '#10b981',
    WARNING_COLOR: '#f59e0b',
    ERROR_COLOR: '#ef4444',
  },
  BRANDING: {
    COMPANY_NAME: 'Your Business Name',
    LOGO_URL: '/your-logo.png',
    FAVICON_URL: '/your-favicon.ico',
  }
}
```

## 📱 Testing

After deployment, test all functionality:
1. User registration and login
2. Product management
3. POS system
4. Analytics dashboard
5. Payment processing
6. All navigation and features

## 🔧 Troubleshooting

### Common Issues
1. **Database Connection**: Check Supabase credentials
2. **CORS Issues**: Configure Supabase CORS settings
3. **Authentication**: Verify user profile table exists
4. **File Uploads**: Check storage configuration

### Debug Mode
Enable debug logging by setting:
```typescript
ENVIRONMENT: 'development'
```

## 📞 Support

For deployment issues:
1. Check browser console for errors
2. Verify all configuration values
3. Test database connectivity
4. Review Supabase logs

---

**Note**: Only update `src/config/storageConfig.ts` for server migrations. All other files remain unchanged.
