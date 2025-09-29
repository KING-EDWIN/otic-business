import { toast } from 'sonner'

export interface ErrorConfig {
  showToast?: boolean
  logError?: boolean
  retryable?: boolean
  fallbackMessage?: string
}

export class ErrorService {
  private static instance: ErrorService
  private errorCounts: Map<string, number> = new Map()
  private maxRetries = 3

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  handleError(
    error: any, 
    context: string, 
    config: ErrorConfig = {}
  ): void {
    const {
      showToast = true,
      logError = true,
      retryable = false,
      fallbackMessage = 'Something went wrong. Please try again.'
    } = config

    const errorKey = `${context}-${error.message || 'unknown'}`
    const currentCount = this.errorCounts.get(errorKey) || 0

    if (logError) {
      console.error(`[${context}] Error:`, error)
    }

    if (showToast) {
      const message = this.getErrorMessage(error, fallbackMessage)
      
      if (retryable && currentCount < this.maxRetries) {
        toast.error(`${message} (Attempt ${currentCount + 1}/${this.maxRetries})`)
      } else {
        toast.error(message)
      }
    }

    // Track error frequency
    this.errorCounts.set(errorKey, currentCount + 1)
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (typeof error === 'string') {
      return error
    }

    if (error?.message) {
      // Handle specific error types
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please check your connection and try again.'
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'Network error. Please check your internet connection.'
      }
      
      if (error.message.includes('unauthorized') || error.message.includes('401')) {
        return 'Session expired. Please sign in again.'
      }
      
      if (error.message.includes('forbidden') || error.message.includes('403')) {
        return 'Access denied. You don\'t have permission for this action.'
      }
      
      if (error.message.includes('not found') || error.message.includes('404')) {
        return 'Resource not found. Please check your request.'
      }
      
      if (error.message.includes('server') || error.message.includes('500')) {
        return 'Server error. Please try again later or contact support.'
      }

      return error.message
    }

    return fallback
  }

  clearErrorCount(errorKey?: string): void {
    if (errorKey) {
      this.errorCounts.delete(errorKey)
    } else {
      this.errorCounts.clear()
    }
  }

  getErrorCount(errorKey: string): number {
    return this.errorCounts.get(errorKey) || 0
  }
}

export const errorService = ErrorService.getInstance()
