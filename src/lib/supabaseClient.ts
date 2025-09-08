import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig, isOfflineMode } from '@/config/storageConfig'

// Get Supabase configuration
const { url, anonKey } = getSupabaseConfig()

// Create Supabase client
export const supabase = createClient(url, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export configuration for other files
export { getSupabaseConfig, isOfflineMode }
export { getCurrentConfig, getApiEndpoints, getFeatureFlags, getUIConfig, getEnvironmentConfig } from '@/config/storageConfig'
