/**
 * Network Error Handler Service
 * Handles network connectivity issues and provides retry mechanisms
 */

export interface NetworkError {
  type: 'network' | 'timeout' | 'cors' | 'auth' | 'server' | 'unknown'
  message: string
  retryable: boolean
  retryAfter?: number
}

export interface RetryOptions {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export class NetworkErrorHandler {
  private static readonly DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }

  /**
   * Analyzes an error and determines its type and retryability
   */
  static analyzeError(error: any): NetworkError {
    const errorMessage = error?.message || error?.toString() || 'Unknown error'
    const errorCode = error?.code || error?.status || error?.statusCode

    // Network connectivity issues
    if (errorMessage.includes('network connection was lost') || 
        errorMessage.includes('Load failed') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('ERR_NETWORK') ||
        errorMessage.includes('ERR_INTERNET_DISCONNECTED')) {
      return {
        type: 'network',
        message: 'Network connection lost. Please check your internet connection.',
        retryable: true,
        retryAfter: 2000
      }
    }

    // CORS issues
    if (errorMessage.includes('access control checks') ||
        errorMessage.includes('CORS') ||
        errorMessage.includes('cross-origin')) {
      return {
        type: 'cors',
        message: 'Cross-origin request blocked. Please try again.',
        retryable: true,
        retryAfter: 1000
      }
    }

    // Timeout issues
    if (errorMessage.includes('timeout') ||
        errorMessage.includes('TIMEOUT') ||
        errorCode === 408) {
      return {
        type: 'timeout',
        message: 'Request timed out. Please try again.',
        retryable: true,
        retryAfter: 3000
      }
    }

    // Authentication issues
    if (errorMessage.includes('auth') ||
        errorMessage.includes('token') ||
        errorMessage.includes('unauthorized') ||
        errorCode === 401 || errorCode === 403) {
      return {
        type: 'auth',
        message: 'Authentication failed. Please sign in again.',
        retryable: false
      }
    }

    // Server errors
    if (errorCode >= 500 && errorCode < 600) {
      return {
        type: 'server',
        message: 'Server error. Please try again later.',
        retryable: true,
        retryAfter: 5000
      }
    }

    // Default unknown error
    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      retryable: true,
      retryAfter: 2000
    }
  }

  /**
   * Executes a function with retry logic
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts = { ...this.DEFAULT_RETRY_OPTIONS, ...options }
    let lastError: any

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        const networkError = this.analyzeError(error)

        // Don't retry if error is not retryable
        if (!networkError.retryable) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === opts.maxRetries) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt),
          opts.maxDelay
        )

        console.warn(`Attempt ${attempt + 1} failed:`, networkError.message)
        console.log(`Retrying in ${delay}ms...`)

        await this.delay(delay)
      }
    }

    throw lastError
  }

  /**
   * Handles Supabase authentication errors specifically
   */
  static handleAuthError(error: any): { shouldRetry: boolean; userMessage: string; action: string } {
    const networkError = this.analyzeError(error)

    switch (networkError.type) {
      case 'network':
        return {
          shouldRetry: true,
          userMessage: 'Network connection lost. Please check your internet connection and try again.',
          action: 'retry'
        }

      case 'cors':
        return {
          shouldRetry: true,
          userMessage: 'Connection issue detected. Please try again.',
          action: 'retry'
        }

      case 'timeout':
        return {
          shouldRetry: true,
          userMessage: 'Request timed out. Please try again.',
          action: 'retry'
        }

      case 'auth':
        return {
          shouldRetry: false,
          userMessage: 'Authentication failed. Please sign in again.',
          action: 'signin'
        }

      case 'server':
        return {
          shouldRetry: true,
          userMessage: 'Server temporarily unavailable. Please try again in a moment.',
          action: 'retry'
        }

      default:
        return {
          shouldRetry: true,
          userMessage: 'Something went wrong. Please try again.',
          action: 'retry'
        }
    }
  }

  /**
   * Checks if the device is online
   */
  static isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * Waits for network connectivity
   */
  static async waitForConnection(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isOnline()) {
        resolve(true)
        return
      }

      const startTime = Date.now()
      
      const checkConnection = () => {
        if (this.isOnline()) {
          resolve(true)
          return
        }

        if (Date.now() - startTime > timeout) {
          resolve(false)
          return
        }

        setTimeout(checkConnection, 1000)
      }

      checkConnection()
    })
  }

  /**
   * Utility function to delay execution
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Gets user-friendly error message
   */
  static getUserMessage(error: any): string {
    const networkError = this.analyzeError(error)
    return networkError.message
  }

  /**
   * Logs error for debugging
   */
  static logError(error: any, context: string = 'Unknown'): void {
    const networkError = this.analyzeError(error)
    console.error(`[${context}] Network Error:`, {
      type: networkError.type,
      message: networkError.message,
      retryable: networkError.retryable,
      originalError: error
    })
  }
}
