import { useState, useCallback } from 'react'
import { errorReportingService } from '@/services/errorReportingService'

interface SystemError {
  type: string
  message: string
  details?: any
}

export const useSystemError = () => {
  const [error, setError] = useState<SystemError | null>(null)
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false)

  const showError = useCallback((errorData: SystemError) => {
    console.error('System Error:', errorData)
    setError(errorData)
    setIsErrorPopupOpen(true)
  }, [])

  const hideError = useCallback(() => {
    setError(null)
    setIsErrorPopupOpen(false)
  }, [])

  const handleDataFetchError = useCallback((error: any, context: string) => {
    // Only show error if user is online (has internet connection)
    if (!errorReportingService.isOnline()) {
      console.log('User is offline, not showing error popup')
      return
    }

    const errorData: SystemError = {
      type: 'DATA_FETCH_ERROR',
      message: `Failed to load ${context} data`,
      details: {
        originalError: error,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    }

    showError(errorData)
  }, [showError])

  const handleAuthError = useCallback((error: any) => {
    if (!errorReportingService.isOnline()) {
      return
    }

    const errorData: SystemError = {
      type: 'AUTH_ERROR',
      message: 'Authentication failed',
      details: {
        originalError: error,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    }

    showError(errorData)
  }, [showError])

  const handleNetworkError = useCallback((error: any, endpoint: string) => {
    if (!errorReportingService.isOnline()) {
      return
    }

    const errorData: SystemError = {
      type: 'NETWORK_ERROR',
      message: `Network request failed for ${endpoint}`,
      details: {
        originalError: error,
        endpoint,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    }

    showError(errorData)
  }, [showError])

  return {
    error,
    isErrorPopupOpen,
    showError,
    hideError,
    handleDataFetchError,
    handleAuthError,
    handleNetworkError
  }
}



