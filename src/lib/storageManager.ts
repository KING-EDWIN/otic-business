// Storage Manager for Dynamic URLs
// This file manages all URLs and configurations for the application
// Update these values based on your environment

export const StorageManager = {
  // Base URLs
  baseUrl: {
    development: 'http://localhost:8082',
    production: 'https://oticbusiness.com', // Update with your actual domain
    staging: 'https://staging.oticbusiness.com' // Update if you have staging
  },

  // Current environment
  environment: import.meta.env.MODE || 'development',

  // Get current base URL
  getBaseUrl: () => {
    const env = StorageManager.environment
    return StorageManager.baseUrl[env] || StorageManager.baseUrl.development
  },

  // Supabase Configuration
  supabase: {
    url: 'https://jvgiyscchxxekcbdicco.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'
  },

  // Flutterwave Configuration
  flutterwave: {
    publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-1234567890abcdef',
    secretKey: import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-1234567890abcdef'
  },

  // Email Configuration
  email: {
    fromEmail: 'noreply@oticbusiness.com',
    fromName: 'OTIC Business',
    supportEmail: 'support@oticbusiness.com'
  },

  // Password Reset URLs
  passwordReset: {
    business: () => `${StorageManager.getBaseUrl()}/business-reset-password`,
    individual: () => `${StorageManager.getBaseUrl()}/individual-reset-password`
  },

  // Email Verification URLs
  emailVerification: {
    business: () => `${StorageManager.getBaseUrl()}/business-verify-email`,
    individual: () => `${StorageManager.getBaseUrl()}/individual-verify-email`
  },

  // Dashboard URLs
  dashboard: {
    business: () => `${StorageManager.getBaseUrl()}/dashboard`,
    individual: () => `${StorageManager.getBaseUrl()}/individual-dashboard`
  },

  // Settings URLs
  settings: {
    business: () => `${StorageManager.getBaseUrl()}/settings`,
    individual: () => `${StorageManager.getBaseUrl()}/individual-settings`
  },

  // Login URLs
  login: {
    business: () => `${StorageManager.getBaseUrl()}/business-signin`,
    individual: () => `${StorageManager.getBaseUrl()}/individual-signin`
  },

  // Signup URLs
  signup: {
    business: () => `${StorageManager.getBaseUrl()}/business-signup`,
    individual: () => `${StorageManager.getBaseUrl()}/individual-signup`
  },

  // Admin URLs
  admin: {
    portal: () => `${StorageManager.getBaseUrl()}/internal-admin-portal`
  },

  // API Endpoints
  api: {
    base: () => `${StorageManager.getBaseUrl()}/api`,
    payments: () => `${StorageManager.getBaseUrl()}/api/payments`,
    auth: () => `${StorageManager.getBaseUrl()}/api/auth`
  },

  // Storage URLs
  storage: {
    images: () => `${StorageManager.getBaseUrl()}/storage/images`,
    documents: () => `${StorageManager.getBaseUrl()}/storage/documents`,
    avatars: () => `${StorageManager.getBaseUrl()}/storage/avatars`
  },

  // Social Media URLs
  social: {
    facebook: 'https://facebook.com/oticbusiness',
    twitter: 'https://twitter.com/oticbusiness',
    linkedin: 'https://linkedin.com/company/oticbusiness',
    instagram: 'https://instagram.com/oticbusiness'
  },

  // Contact Information
  contact: {
    phone: '+256 700 000 000',
    email: 'info@oticbusiness.com',
    address: 'Kampala, Uganda',
    hours: 'Mon-Fri: 9AM-6PM EAT'
  },

  // App Information
  app: {
    name: 'OTIC Business',
    version: '1.0.0',
    description: 'Complete business management solution for African entrepreneurs',
    tagline: 'Empowering African Businesses'
  },

  // Feature Flags
  features: {
    enableOTICVision: true,
    enableMultiBranch: true,
    enableAIInsights: true,
    enableEmailVerification: true,
    enablePasswordReset: true,
    enableAccountDeletion: true
  },

  // Debug Mode
  debug: StorageManager.environment === 'development',

  // Logging
  log: (message: string, data?: any) => {
    if (StorageManager.debug) {
      console.log(`[OTIC Business] ${message}`, data || '')
    }
  },

  // Error Logging
  logError: (error: string, data?: any) => {
    console.error(`[OTIC Business Error] ${error}`, data || '')
  }
}

// Export default
export default StorageManager
