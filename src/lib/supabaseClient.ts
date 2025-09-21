import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig, isOfflineMode } from '@/config/storageConfig'

// Get Supabase configuration
const { url, anonKey } = getSupabaseConfig()

// Create Supabase client with enhanced error handling
export const supabase = createClient(url, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      'apikey': anonKey,
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Add debugging
console.log('🔧 Supabase client initialized with URL:', url)
console.log('🔧 Supabase client initialized with anon key:', anonKey ? 'Present' : 'Missing')

// Export configuration for other files
export { getSupabaseConfig, isOfflineMode }
export { getCurrentConfig, getApiEndpoints, getFeatureFlags, getUIConfig, getEnvironmentConfig } from '@/config/storageConfig'
