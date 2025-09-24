/**
 * Professional Network Error Handler
 * Handles CORS, network failures, and retry logic like legitimate websites
 */

export interface NetworkError {
  message: string
  type: 'cors' | 'network' | 'timeout' | 'server' | 'unknown'
  retryable: boolean
}

export class NetworkErrorHandler {
  /**
   * Analyze error and determine if it's retryable
   */
  static analyzeError(error: any): NetworkError {
    const errorMessage = error?.message?.toLowerCase() || ''
    const errorName = error?.name?.toLowerCase() || ''

    // CORS errors
    if (errorMessage.includes('access control') || 
        errorMessage.includes('cors') ||
        errorMessage.includes('cross-origin')) {
      return {
        message: 'Cross-origin request blocked. Please check your browser settings.',
        type: 'cors',
        retryable: false
      }
    }

    // Network errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('connection') ||
        errorName.includes('networkerror')) {
      return {
        message: 'Network connection failed. Please check your internet connection.',
        type: 'network',
        retryable: true
      }
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('timed out')) {
      return {
        message: 'Request timed out. The server is taking too long to respond.',
        type: 'timeout',
        retryable: true
      }
    }

    // Server errors
    if (errorMessage.includes('server') || 
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503')) {
      return {
        message: 'Server error. Please try again later.',
        type: 'server',
        retryable: true
      }
    }

    // Default unknown error
    return {
      message: error?.message || 'An unexpected error occurred',
      type: 'unknown',
      retryable: false
    }
  }

  /**
   * Professional retry logic with exponential backoff
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const errorAnalysis = this.analyzeError(error)

        // Don't retry if error is not retryable
        if (!errorAnalysis.retryable) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  /**
   * Check if we're online
   */
  static isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * Wait for network to come back online
   */
  static async waitForOnline(timeout: number = 30000): Promise<boolean> {
    if (this.isOnline()) {
      return true
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        window.removeEventListener('online', onOnline)
        resolve(false)
      }, timeout)

      const onOnline = () => {
        clearTimeout(timeoutId)
        window.removeEventListener('online', onOnline)
        resolve(true)
      }

      window.addEventListener('online', onOnline)
    })
  }

  /**
   * Professional fetch wrapper with CORS handling
   */
  static async fetchWithCORS(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const defaultOptions: RequestInit = {
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    }

    return fetch(url, { ...defaultOptions, ...options })
  }

  /**
   * Handle Supabase-specific errors
   */
  static handleSupabaseError(error: any): string {
    const errorAnalysis = this.analyzeError(error)
    
    if (errorAnalysis.type === 'cors') {
      return 'Authentication service is temporarily unavailable. Please try again in a few moments.'
    }
    
    if (errorAnalysis.type === 'network') {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }
    
    if (errorAnalysis.type === 'timeout') {
      return 'The request is taking longer than expected. Please try again.'
    }

    // Supabase-specific error messages
    if (error?.message?.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.'
    }

    if (error?.message?.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.'
    }

    if (error?.message?.includes('Too many requests')) {
      return 'Too many login attempts. Please wait a moment before trying again.'
    }

    return errorAnalysis.message
  }
}

export default NetworkErrorHandler
