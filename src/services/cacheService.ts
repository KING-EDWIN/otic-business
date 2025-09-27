import { QueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

// Cache keys constants
export const CACHE_KEYS = {
  // User related
  USER_PROFILE: (userId: string) => ['user-profile', userId],
  USER_AUTH: (userId: string) => ['user-auth', userId],
  
  // Business related
  BUSINESSES: (userId: string) => ['businesses', userId],
  CURRENT_BUSINESS: (userId: string) => ['current-business', userId],
  BUSINESS_MEMBERS: (businessId: string) => ['business-members', businessId],
  BUSINESS_INVITATIONS: (userId: string) => ['business-invitations', userId],
  
  // Individual user data
  TIME_ENTRIES: (userId: string, businessId?: string) => 
    businessId ? ['time-entries', userId, businessId] : ['time-entries', userId],
  TASKS: (userId: string, businessId?: string) => 
    businessId ? ['tasks', userId, businessId] : ['tasks', userId],
  WORK_REPORTS: (userId: string, businessId?: string) => 
    businessId ? ['work-reports', userId, businessId] : ['work-reports', userId],
  WORK_SESSIONS: (userId: string) => ['work-sessions', userId],
  PRODUCTIVITY_METRICS: (userId: string, businessId?: string) => 
    businessId ? ['productivity-metrics', userId, businessId] : ['productivity-metrics', userId],
  
  // Dashboard data
  DASHBOARD_STATS: (userId: string) => ['dashboard-stats', userId],
  INDIVIDUAL_DASHBOARD_STATS: (userId: string) => ['individual-dashboard-stats', userId],
  
  // Business access
  BUSINESS_ACCESS: (userId: string) => ['business-access', userId],
  PENDING_INVITATIONS: (userEmail: string) => ['pending-invitations', userEmail],
} as const

// Cache configuration
export const CACHE_CONFIG = {
  // Short-lived cache (1 minute)
  SHORT: {
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  },
  
  // Medium-lived cache (5 minutes)
  MEDIUM: {
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  },
  
  // Long-lived cache (15 minutes)
  LONG: {
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  },
  
  // User session cache (until logout)
  SESSION: {
    staleTime: 30 * 60 * 1000,
    gcTime: Infinity, // Keep until manually cleared
  },
} as const

export class CacheService {
  private static queryClient: QueryClient | null = null
  
  // Initialize with QueryClient instance
  static initialize(queryClient: QueryClient) {
    this.queryClient = queryClient
    this.setupGlobalCacheHandlers()
  }
  
  // Setup global cache event handlers
  private static setupGlobalCacheHandlers() {
    if (!this.queryClient) return
    
    // Clear all cache on auth state change
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        this.clearAllUserCache()
      }
    })
    
    // Setup real-time subscriptions for cache invalidation
    this.setupRealtimeSubscriptions()
  }
  
  // Setup real-time subscriptions for automatic cache invalidation
  private static setupRealtimeSubscriptions() {
    // Listen for business changes
    supabase
      .channel('business-cache-invalidation')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'businesses' },
        (payload) => {
          this.invalidateBusinessCache(payload.new?.created_by || payload.old?.created_by)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'business_memberships' },
        (payload) => {
          this.invalidateBusinessCache(payload.new?.user_id || payload.old?.user_id)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'business_invitations' },
        (payload) => {
          this.invalidateInvitationCache(payload.new?.invited_email || payload.old?.invited_email)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'individual_time_entries' },
        (payload) => {
          this.invalidateTimeEntriesCache(payload.new?.user_id || payload.old?.user_id)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'individual_tasks' },
        (payload) => {
          this.invalidateTasksCache(payload.new?.user_id || payload.old?.user_id)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'individual_work_reports' },
        (payload) => {
          this.invalidateWorkReportsCache(payload.new?.user_id || payload.old?.user_id)
        }
      )
      .subscribe()
  }
  
  // Clear all user-related cache
  static clearAllUserCache() {
    if (!this.queryClient) return
    
    this.queryClient.clear()
    console.log('🧹 Cleared all user cache')
  }
  
  // Invalidate specific cache patterns
  static invalidateUserCache(userId: string) {
    if (!this.queryClient) return
    
    const patterns = [
      CACHE_KEYS.USER_PROFILE(userId),
      CACHE_KEYS.USER_AUTH(userId),
      CACHE_KEYS.BUSINESSES(userId),
      CACHE_KEYS.CURRENT_BUSINESS(userId),
      CACHE_KEYS.DASHBOARD_STATS(userId),
      CACHE_KEYS.INDIVIDUAL_DASHBOARD_STATS(userId),
      CACHE_KEYS.BUSINESS_ACCESS(userId),
    ]
    
    patterns.forEach(pattern => {
      this.queryClient!.invalidateQueries({ queryKey: pattern })
    })
    
    console.log('🔄 Invalidated user cache for:', userId)
  }
  
  static invalidateBusinessCache(userId: string) {
    if (!this.queryClient) return
    
    const patterns = [
      CACHE_KEYS.BUSINESSES(userId),
      CACHE_KEYS.CURRENT_BUSINESS(userId),
      CACHE_KEYS.DASHBOARD_STATS(userId),
      CACHE_KEYS.BUSINESS_ACCESS(userId),
    ]
    
    patterns.forEach(pattern => {
      this.queryClient!.invalidateQueries({ queryKey: pattern })
    })
    
    console.log('🏢 Invalidated business cache for:', userId)
  }
  
  static invalidateInvitationCache(userEmail: string) {
    if (!this.queryClient) return
    
    this.queryClient.invalidateQueries({ 
      queryKey: CACHE_KEYS.PENDING_INVITATIONS(userEmail) 
    })
    
    console.log('📧 Invalidated invitation cache for:', userEmail)
  }
  
  static invalidateTimeEntriesCache(userId: string, businessId?: string) {
    if (!this.queryClient) return
    
    this.queryClient.invalidateQueries({ 
      queryKey: CACHE_KEYS.TIME_ENTRIES(userId, businessId) 
    })
    this.queryClient.invalidateQueries({ 
      queryKey: CACHE_KEYS.INDIVIDUAL_DASHBOARD_STATS(userId) 
    })
    
    console.log('⏰ Invalidated time entries cache for:', userId)
  }
  
  static invalidateTasksCache(userId: string, businessId?: string) {
    if (!this.queryClient) return
    
    this.queryClient.invalidateQueries({ 
      queryKey: CACHE_KEYS.TASKS(userId, businessId) 
    })
    this.queryClient.invalidateQueries({ 
      queryKey: CACHE_KEYS.INDIVIDUAL_DASHBOARD_STATS(userId) 
    })
    
    console.log('✅ Invalidated tasks cache for:', userId)
  }
  
  static invalidateWorkReportsCache(userId: string, businessId?: string) {
    if (!this.queryClient) return
    
    this.queryClient.invalidateQueries({ 
      queryKey: CACHE_KEYS.WORK_REPORTS(userId, businessId) 
    })
    
    console.log('📊 Invalidated work reports cache for:', userId)
  }
  
  static invalidateBusinessMembersCache(businessId: string) {
    if (!this.queryClient) return
    
    this.queryClient.invalidateQueries({ 
      queryKey: CACHE_KEYS.BUSINESS_MEMBERS(businessId) 
    })
    
    console.log('👥 Invalidated business members cache for:', businessId)
  }
  
  // Optimistic updates
  static optimisticUpdate<T>(
    queryKey: any[],
    updater: (oldData: T | undefined) => T,
    rollback?: () => void
  ) {
    if (!this.queryClient) return
    
    // Cancel any outgoing refetches
    this.queryClient.cancelQueries({ queryKey })
    
    // Snapshot the previous value
    const previousData = this.queryClient.getQueryData<T>(queryKey)
    
    // Optimistically update
    this.queryClient.setQueryData(queryKey, updater)
    
    // Return rollback function
    return () => {
      this.queryClient!.setQueryData(queryKey, previousData)
      if (rollback) rollback()
    }
  }
  
  // Prefetch data
  static async prefetchUserData(userId: string) {
    if (!this.queryClient) return
    
    // Prefetch critical user data
    await Promise.all([
      this.queryClient.prefetchQuery({
        queryKey: CACHE_KEYS.USER_PROFILE(userId),
        staleTime: CACHE_CONFIG.SESSION.staleTime,
      }),
      this.queryClient.prefetchQuery({
        queryKey: CACHE_KEYS.BUSINESSES(userId),
        staleTime: CACHE_CONFIG.MEDIUM.staleTime,
      }),
    ])
    
    console.log('🚀 Prefetched user data for:', userId)
  }
  
  // Get cache status
  static getCacheStatus() {
    if (!this.queryClient) return null
    
    return {
      cacheSize: this.queryClient.getQueryCache().getAll().length,
      queries: this.queryClient.getQueryCache().getAll().map(query => ({
        queryKey: query.queryKey,
        state: query.state.status,
        dataUpdatedAt: query.state.dataUpdatedAt,
        errorUpdatedAt: query.state.errorUpdatedAt,
      }))
    }
  }
  
  // Clear specific cache by pattern
  static clearCacheByPattern(pattern: string) {
    if (!this.queryClient) return
    
    const queries = this.queryClient.getQueryCache().getAll()
    queries.forEach(query => {
      if (query.queryKey.some(key => 
        typeof key === 'string' && key.includes(pattern)
      )) {
        this.queryClient!.removeQueries({ queryKey: query.queryKey })
      }
    })
    
    console.log('🧹 Cleared cache pattern:', pattern)
  }
  
  // Force refresh all queries
  static async refreshAllQueries() {
    if (!this.queryClient) return
    
    await this.queryClient.refetchQueries()
    console.log('🔄 Refreshed all queries')
  }
  
  // Setup cache persistence (optional)
  static setupCachePersistence() {
    if (!this.queryClient) return
    
    // Save cache to localStorage on changes
    this.queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated') {
        try {
          const cacheData = this.queryClient!.getQueryCache().getAll()
          localStorage.setItem('otic-cache', JSON.stringify(cacheData))
        } catch (error) {
          console.warn('Failed to persist cache:', error)
        }
      }
    })
    
    // Restore cache from localStorage on init
    try {
      const savedCache = localStorage.getItem('otic-cache')
      if (savedCache) {
        const cacheData = JSON.parse(savedCache)
        // Restore cache data (implementation depends on your needs)
        console.log('📦 Restored cache from localStorage')
      }
    } catch (error) {
      console.warn('Failed to restore cache:', error)
    }
  }
}

export default CacheService
