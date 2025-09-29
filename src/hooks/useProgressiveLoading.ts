import { useState, useEffect, useCallback } from 'react'

export interface ProgressiveLoadingConfig {
  initialTimeout?: number
  fallbackTimeout?: number
  retryAttempts?: number
  retryDelay?: number
  enabled?: boolean
}

export interface ProgressiveLoadingState<T> {
  data: T | null
  loading: boolean
  error: string | null
  progress: number
  hasInitialData: boolean
  retryCount: number
}

export function useProgressiveLoading<T>(
  fetchFunction: () => Promise<T>,
  config: ProgressiveLoadingConfig = {}
) {
  const {
    initialTimeout = 2000,
    fallbackTimeout = 8000,
    retryAttempts = 3,
    retryDelay = 1000,
    enabled = true
  } = config

  const [state, setState] = useState<ProgressiveLoadingState<T>>({
    data: null,
    loading: true,
    error: null,
    progress: 0,
    hasInitialData: false,
    retryCount: 0
  })

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }))
  }, [])

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        retryCount: isRetry ? prev.retryCount + 1 : 0
      }))

      // Start progress
      updateProgress(10)

      // Create timeout promises
      const initialPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Initial timeout')), initialTimeout)
      )

      const fallbackPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Fallback timeout')), fallbackTimeout)
      )

      // Race between data fetch and timeouts
      const dataPromise = fetchFunction()
      
      updateProgress(30)

      try {
        // Try to get data within initial timeout
        const data = await Promise.race([dataPromise, initialPromise])
        
        updateProgress(100)
        
        setState(prev => ({
          ...prev,
          data,
          loading: false,
          hasInitialData: true,
          progress: 100
        }))

        return data
      } catch (error) {
        // If initial timeout, try fallback
        if (error instanceof Error && error.message === 'Initial timeout') {
          updateProgress(50)
          
          try {
            const data = await Promise.race([dataPromise, fallbackPromise])
            
            updateProgress(100)
            
            setState(prev => ({
              ...prev,
              data,
              loading: false,
              hasInitialData: true,
              progress: 100
            }))

            return data
          } catch (fallbackError) {
            // Fallback timeout - show partial data or error
            if (fallbackError instanceof Error && fallbackError.message === 'Fallback timeout') {
              setState(prev => ({
                ...prev,
                loading: false,
                error: 'Data is taking longer than expected. Please try again.',
                progress: 80
              }))
            } else {
              throw fallbackError
            }
          }
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        progress: 0
      }))

      // Auto-retry if within retry attempts - but only for non-rate-limit errors
      if (state.retryCount < retryAttempts && !errorMessage.includes('Rate limit exceeded')) {
        setTimeout(() => {
          fetchData(true)
        }, retryDelay)
      }
    }
  }, [fetchFunction, initialTimeout, fallbackTimeout, retryAttempts, retryDelay, state.retryCount, updateProgress])

  const retry = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: true,
      error: null,
      progress: 0,
      hasInitialData: false,
      retryCount: 0
    })
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchData()
    } else {
      // Reset state when disabled
      setState({
        data: null,
        loading: false,
        error: null,
        progress: 0,
        hasInitialData: false,
        retryCount: 0
      })
    }
  }, [fetchData, enabled])

  return {
    ...state,
    retry,
    reset,
    refetch: fetchData
  }
}

// Hook for skeleton loading with progressive data
export function useSkeletonLoading<T>(
  fetchFunction: () => Promise<T>,
  skeletonData: T,
  config: ProgressiveLoadingConfig = {}
) {
  const progressiveState = useProgressiveLoading(fetchFunction, config)
  
  return {
    ...progressiveState,
    displayData: progressiveState.data || skeletonData,
    showSkeleton: progressiveState.loading && !progressiveState.hasInitialData
  }
}

// Hook for optimistic updates
export function useOptimisticLoading<T>(
  fetchFunction: () => Promise<T>,
  optimisticData: T,
  config: ProgressiveLoadingConfig = {}
) {
  const [optimisticState, setOptimisticState] = useState<T>(optimisticData)
  const progressiveState = useProgressiveLoading(fetchFunction, config)

  useEffect(() => {
    if (progressiveState.data) {
      setOptimisticState(progressiveState.data)
    }
  }, [progressiveState.data])

  return {
    ...progressiveState,
    optimisticData: optimisticState,
    updateOptimistic: setOptimisticState
  }
}
