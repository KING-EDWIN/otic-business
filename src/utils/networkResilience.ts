/**
 * Network Resilience Utilities
 * Handles network failures, retries, and connection recovery
 */

import { supabase } from '@/lib/supabaseClient'

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}

export interface NetworkError extends Error {
  isNetworkError?: boolean
  isTimeoutError?: boolean
  isConnectionError?: boolean
}

/**
 * Check if an error is network-related
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false
  
  const message = error.message?.toLowerCase() || ''
  const code = error.code?.toLowerCase() || ''
  
  return (
    message.includes('load failed') ||
    message.includes('network error') ||
    message.includes('fetch error') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('aborted') ||
    code === 'network_error' ||
    code === 'timeout' ||
    error.name === 'TypeError' && message.includes('load failed')
  )
}

/**
 * Enhanced retry function with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2
  } = options

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1}/${maxRetries + 1}`)
      return await operation()
    } catch (error) {
      lastError = error
      
      // If it's not a network error, don't retry
      if (!isNetworkError(error)) {
        console.log('❌ Non-network error, not retrying:', error.message)
        throw error
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        console.log('❌ All retry attempts failed')
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      )

      console.log(`⏳ Network error detected, retrying in ${delay}ms...`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Test Supabase connection with retry
 */
export async function testSupabaseConnectionWithRetry(): Promise<boolean> {
  try {
    await withRetry(async () => {
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)
      
      if (error && isNetworkError(error)) {
        throw error
      }
    }, { maxRetries: 2, baseDelay: 500 })
    
    console.log('✅ Supabase connection test successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error)
    return false
  }
}

/**
 * Fetch profile with network resilience
 */
export async function fetchProfileWithRetry(userId: string): Promise<any> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (isNetworkError(error)) {
        throw error
      }
      // For non-network errors (like user not found), return null
      return null
    }

    return data
  }, { maxRetries: 2, baseDelay: 1000 })
}

/**
 * Sign in with network resilience
 */
export async function signInWithRetry(
  email: string, 
  password: string
): Promise<{ data: any; error: any }> {
  return withRetry(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error && isNetworkError(error)) {
      throw error
    }

    return { data, error }
  }, { maxRetries: 2, baseDelay: 1000 })
}

/**
 * Sign up with network resilience
 */
export async function signUpWithRetry(
  email: string,
  password: string,
  options?: any
): Promise<{ data: any; error: any }> {
  return withRetry(async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    })

    if (error && isNetworkError(error)) {
      throw error
    }

    return { data, error }
  }, { maxRetries: 2, baseDelay: 1000 })
}

/**
 * Get session with network resilience
 */
export async function getSessionWithRetry(): Promise<{ data: any; error: any }> {
  return withRetry(async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error && isNetworkError(error)) {
      throw error
    }

    return { data, error }
  }, { maxRetries: 2, baseDelay: 1000 })
}

/**
 * Clear authentication storage
 */
export function clearAuthStorage(): void {
  try {
    // Clear all Supabase-related storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear session storage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        sessionStorage.removeItem(key)
      }
    })
    
    console.log('🗑️ Cleared authentication storage')
  } catch (error) {
    console.error('Error clearing auth storage:', error)
  }
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Wait for network to come back online
 */
export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve()
      return
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline)
      resolve()
    }

    window.addEventListener('online', handleOnline)
  })
}
