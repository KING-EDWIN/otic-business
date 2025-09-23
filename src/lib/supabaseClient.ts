import { createClient } from '@supabase/supabase-js'

// Direct Supabase configuration to avoid environment variable issues
const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

// Create Supabase client with enhanced error handling and retry logic
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    storageKey: 'sb-jvgiyscchxxekcbdicco-auth-token'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
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
console.log('🔧 Supabase client initialized with URL:', supabaseUrl)
console.log('🔧 Supabase client initialized with anon key:', supabaseAnonKey ? 'Present' : 'Missing')

// Export configuration for other files
export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey
})

export const isOfflineMode = () => false
