import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { CACHE_KEYS, CACHE_CONFIG } from '@/services/cacheService'

// Cache-aware query hook with predefined configurations
export function useCacheQuery<TData = unknown, TError = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: {
    cacheType?: 'SHORT' | 'MEDIUM' | 'LONG' | 'SESSION'
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    refetchOnWindowFocus?: boolean
    refetchOnMount?: boolean
    retry?: boolean | number
  } & Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  const {
    cacheType = 'MEDIUM',
    enabled = true,
    staleTime,
    gcTime,
    refetchOnWindowFocus = false,
    refetchOnMount = true,
    retry = true,
    ...queryOptions
  } = options || {}

  // Get cache configuration based on type
  const cacheConfig = CACHE_CONFIG[cacheType]

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: staleTime ?? cacheConfig.staleTime,
    gcTime: gcTime ?? cacheConfig.gcTime,
    refetchOnWindowFocus,
    refetchOnMount,
    retry: retry === false ? false : retry === true ? 3 : retry,
    ...queryOptions,
  })
}

// Specific hooks for common data types
export function useUserProfile(userId: string | undefined) {
  return useCacheQuery(
    userId ? CACHE_KEYS.USER_PROFILE(userId) : ['user-profile', 'disabled'],
    async () => {
      if (!userId) throw new Error('User ID required')
      // This would be replaced with actual API call
      throw new Error('Not implemented')
    },
    {
      cacheType: 'SESSION',
      enabled: !!userId,
    }
  )
}

export function useBusinesses(userId: string | undefined) {
  return useCacheQuery(
    userId ? CACHE_KEYS.BUSINESSES(userId) : ['businesses', 'disabled'],
    async () => {
      if (!userId) throw new Error('User ID required')
      // This would be replaced with actual API call
      throw new Error('Not implemented')
    },
    {
      cacheType: 'MEDIUM',
      enabled: !!userId,
    }
  )
}

export function useTimeEntries(userId: string | undefined, businessId?: string) {
  return useCacheQuery(
    userId ? CACHE_KEYS.TIME_ENTRIES(userId, businessId) : ['time-entries', 'disabled'],
    async () => {
      if (!userId) throw new Error('User ID required')
      // This would be replaced with actual API call
      throw new Error('Not implemented')
    },
    {
      cacheType: 'SHORT',
      enabled: !!userId,
    }
  )
}

export function useTasks(userId: string | undefined, businessId?: string) {
  return useCacheQuery(
    userId ? CACHE_KEYS.TASKS(userId, businessId) : ['tasks', 'disabled'],
    async () => {
      if (!userId) throw new Error('User ID required')
      // This would be replaced with actual API call
      throw new Error('Not implemented')
    },
    {
      cacheType: 'SHORT',
      enabled: !!userId,
    }
  )
}

export function useDashboardStats(userId: string | undefined, userType: 'business' | 'individual') {
  const queryKey = userId 
    ? (userType === 'business' 
        ? CACHE_KEYS.DASHBOARD_STATS(userId)
        : CACHE_KEYS.INDIVIDUAL_DASHBOARD_STATS(userId))
    : ['dashboard-stats', 'disabled']

  return useCacheQuery(
    queryKey,
    async () => {
      if (!userId) throw new Error('User ID required')
      // This would be replaced with actual API call
      throw new Error('Not implemented')
    },
    {
      cacheType: 'SHORT',
      enabled: !!userId,
    }
  )
}

export function useBusinessMembers(businessId: string | undefined) {
  return useCacheQuery(
    businessId ? CACHE_KEYS.BUSINESS_MEMBERS(businessId) : ['business-members', 'disabled'],
    async () => {
      if (!businessId) throw new Error('Business ID required')
      // This would be replaced with actual API call
      throw new Error('Not implemented')
    },
    {
      cacheType: 'MEDIUM',
      enabled: !!businessId,
    }
  )
}

export function usePendingInvitations(userEmail: string | undefined) {
  return useCacheQuery(
    userEmail ? CACHE_KEYS.PENDING_INVITATIONS(userEmail) : ['pending-invitations', 'disabled'],
    async () => {
      if (!userEmail) throw new Error('User email required')
      // This would be replaced with actual API call
      throw new Error('Not implemented')
    },
    {
      cacheType: 'SHORT',
      enabled: !!userEmail,
    }
  )
}

export default useCacheQuery
