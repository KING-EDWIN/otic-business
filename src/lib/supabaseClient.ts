import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig, isOfflineMode } from '@/config/storageConfig'

// Get Supabase configuration
const { url, anonKey } = getSupabaseConfig()

// Create Supabase client
export const supabase = createClient(url, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': anonKey
    }
  }
})

// Add debugging
console.log('🔧 Supabase client initialized with URL:', url)
console.log('🔧 Supabase client initialized with anon key:', anonKey ? 'Present' : 'Missing')

// Export configuration for other files
export { getSupabaseConfig, isOfflineMode }
export { getCurrentConfig, getApiEndpoints, getFeatureFlags, getUIConfig, getEnvironmentConfig } from '@/config/storageConfig'
