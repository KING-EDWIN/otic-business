/**
 * Centralized Storage Configuration
 * 
 * This file contains all database, backend, and storage configurations.
 * When moving the project to different servers, only update this file.
 * 
 * Last Updated: 2025-09-08
 */

// Environment Configuration
export const ENV_CONFIG = {
  // Current environment
  ENVIRONMENT: 'production', // 'development' | 'staging' | 'production'
  
  // Online/Offline Mode
  USE_OFFLINE_MODE: false, // Set to true for offline development, false for production
  
  // API Configuration
  API_BASE_URL: 'https://api.oticbusiness.com', // Your API base URL
  API_VERSION: 'v1',
  
  // Database Configuration
  DATABASE: {
    // Supabase Configuration
    SUPABASE_URL: 'https://jvgiyscchxxekcbdicco.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8',
    
    // Alternative Database URLs (for different environments)
    DEVELOPMENT: {
      SUPABASE_URL: 'https://jvgiyscchxxekcbdicco.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8',
    },
    STAGING: {
      SUPABASE_URL: 'https://jvgiyscchxxekcbdicco.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8',
    },
    PRODUCTION: {
      SUPABASE_URL: 'https://jvgiyscchxxekcbdicco.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8',
    }
  },
  
  // Storage Configuration
  STORAGE: {
    // File upload endpoints
    UPLOAD_ENDPOINT: '/api/upload',
    IMAGES_ENDPOINT: '/api/images',
    DOCUMENTS_ENDPOINT: '/api/documents',
    
    // CDN URLs
    CDN_BASE_URL: 'https://cdn.oticbusiness.com',
    IMAGES_CDN: 'https://images.oticbusiness.com',
    DOCUMENTS_CDN: 'https://docs.oticbusiness.com',
  },
  
  // External Services
  EXTERNAL_SERVICES: {
    // Payment Processing
    PAYMENT_PROVIDER: 'flutterwave', // 'flutterwave' | 'stripe' | 'paypal'
    FLUTTERWAVE_PUBLIC_KEY: 'your-flutterwave-public-key',
    FLUTTERWAVE_SECRET_KEY: 'your-flutterwave-secret-key',
    
    // Email Service
    EMAIL_PROVIDER: 'sendgrid', // 'sendgrid' | 'mailgun' | 'ses'
    SENDGRID_API_KEY: 'your-sendgrid-api-key',
    
    // SMS Service
    SMS_PROVIDER: 'twilio', // 'twilio' | 'africas-talking'
    TWILIO_ACCOUNT_SID: 'your-twilio-account-sid',
    TWILIO_AUTH_TOKEN: 'your-twilio-auth-token',
    
    // AI Services
    AI_PROVIDER: 'openai', // 'openai' | 'anthropic' | 'local'
    OPENAI_API_KEY: 'your-openai-api-key',
  },
  
  // Feature Flags
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
  },
  
  // UI Configuration
  UI: {
    THEME: {
      PRIMARY_COLOR: '#040458',
      SECONDARY_COLOR: '#faa51a',
      SUCCESS_COLOR: '#10b981',
      WARNING_COLOR: '#f59e0b',
      ERROR_COLOR: '#ef4444',
    },
    BRANDING: {
      COMPANY_NAME: 'Otic Business',
      LOGO_URL: '/Otic icon@2x.png',
      FAVICON_URL: '/favicon.ico',
    }
  }
}

// Helper functions to get current configuration
export const getCurrentConfig = () => {
  const env = ENV_CONFIG.ENVIRONMENT as keyof typeof ENV_CONFIG.DATABASE
  return {
    ...ENV_CONFIG,
    DATABASE: ENV_CONFIG.DATABASE[env] || ENV_CONFIG.DATABASE.PRODUCTION
  }
}

// Get Supabase configuration
export const getSupabaseConfig = () => {
  const config = getCurrentConfig()
  return {
    url: config.DATABASE.SUPABASE_URL,
    anonKey: config.DATABASE.SUPABASE_ANON_KEY
  }
}

// Get API endpoints
export const getApiEndpoints = () => {
  const config = getCurrentConfig()
  return {
    baseUrl: config.API_BASE_URL,
    version: config.API_VERSION,
    upload: `${config.API_BASE_URL}${config.STORAGE.UPLOAD_ENDPOINT}`,
    images: `${config.API_BASE_URL}${config.STORAGE.IMAGES_ENDPOINT}`,
    documents: `${config.API_BASE_URL}${config.STORAGE.DOCUMENTS_ENDPOINT}`,
  }
}

// Check if offline mode is enabled
export const isOfflineMode = () => {
  return ENV_CONFIG.USE_OFFLINE_MODE
}

// Get feature flags
export const getFeatureFlags = () => {
  return ENV_CONFIG.FEATURES
}

// Get UI configuration
export const getUIConfig = () => {
  return ENV_CONFIG.UI
}

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  return {
    isDevelopment: ENV_CONFIG.ENVIRONMENT === 'development',
    isStaging: ENV_CONFIG.ENVIRONMENT === 'staging',
    isProduction: ENV_CONFIG.ENVIRONMENT === 'production',
    isOffline: isOfflineMode(),
  }
}

export default ENV_CONFIG
