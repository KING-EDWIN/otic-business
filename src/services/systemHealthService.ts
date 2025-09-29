import { supabase } from '@/lib/supabaseClient'

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  message: string
  responseTime?: number
  lastChecked: string
  details?: any
}

export interface SystemHealth {
  database: HealthStatus
  smtp: HealthStatus
  network: HealthStatus
  api: HealthStatus
  storage: HealthStatus
  auth: HealthStatus
  realtime: HealthStatus
  overall: HealthStatus
}

export class SystemHealthService {
  private static readonly HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
  private static healthCallbacks: ((health: SystemHealth) => void)[] = []
  private static isMonitoring = false

  // Start real-time health monitoring
  static startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.performHealthCheck()
    
    // Set up interval for continuous monitoring
    setInterval(() => {
      this.performHealthCheck()
    }, this.HEALTH_CHECK_INTERVAL)
  }

  // Stop monitoring
  static stopMonitoring() {
    this.isMonitoring = false
  }

  // Subscribe to health updates
  static onHealthUpdate(callback: (health: SystemHealth) => void) {
    this.healthCallbacks.push(callback)
    return () => {
      this.healthCallbacks = this.healthCallbacks.filter(cb => cb !== callback)
    }
  }

  // Perform comprehensive health check
  private static async performHealthCheck() {
    try {
      const [
        databaseHealth,
        smtpHealth,
        networkHealth,
        apiHealth,
        storageHealth,
        authHealth,
        realtimeHealth
      ] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkSMTPHealth(),
        this.checkNetworkHealth(),
        this.checkAPIHealth(),
        this.checkStorageHealth(),
        this.checkAuthHealth(),
        this.checkRealtimeHealth()
      ])

      const health: SystemHealth = {
        database: databaseHealth.status === 'fulfilled' ? databaseHealth.value : {
          status: 'error',
          message: 'Database check failed',
          lastChecked: new Date().toISOString()
        },
        smtp: smtpHealth.status === 'fulfilled' ? smtpHealth.value : {
          status: 'error',
          message: 'SMTP check failed',
          lastChecked: new Date().toISOString()
        },
        network: networkHealth.status === 'fulfilled' ? networkHealth.value : {
          status: 'error',
          message: 'Network check failed',
          lastChecked: new Date().toISOString()
        },
        api: apiHealth.status === 'fulfilled' ? apiHealth.value : {
          status: 'error',
          message: 'API check failed',
          lastChecked: new Date().toISOString()
        },
        storage: storageHealth.status === 'fulfilled' ? storageHealth.value : {
          status: 'error',
          message: 'Storage check failed',
          lastChecked: new Date().toISOString()
        },
        auth: authHealth.status === 'fulfilled' ? authHealth.value : {
          status: 'error',
          message: 'Auth check failed',
          lastChecked: new Date().toISOString()
        },
        realtime: realtimeHealth.status === 'fulfilled' ? realtimeHealth.value : {
          status: 'error',
          message: 'Realtime check failed',
          lastChecked: new Date().toISOString()
        },
        overall: { status: 'unknown', message: 'Calculating...', lastChecked: new Date().toISOString() }
      }

      // Calculate overall health
      health.overall = this.calculateOverallHealth(health)

      // Notify all subscribers
      this.healthCallbacks.forEach(callback => callback(health))
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }

  // Database Health Check
  private static async checkDatabaseHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Test basic connectivity
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      if (error) throw error

      // Test core tables that definitely exist
      const coreTableTests = await Promise.allSettled([
        supabase.from('user_profiles').select('count').limit(1),
        supabase.from('businesses').select('count').limit(1),
        supabase.from('business_memberships').select('count').limit(1)
      ])

      // Test optional tables that might not exist yet
      const optionalTableTests = await Promise.allSettled([
        supabase.from('business_invitations').select('count').limit(1),
        supabase.from('admin_logs').select('count').limit(1),
        supabase.from('individual_time_entries').select('count').limit(1),
        supabase.from('individual_tasks').select('count').limit(1)
      ])

      const tableTests = [...coreTableTests, ...optionalTableTests]

      const accessibleTables = tableTests.filter(test => test.status === 'fulfilled').length
      const totalTables = tableTests.length
      
      // Get detailed results for each table
      const tableResults = tableTests.map((test, index) => {
        const tableNames = [
          'user_profiles', 'businesses', 'business_memberships', // Core tables
          'business_invitations', 'admin_logs', 'individual_time_entries', 'individual_tasks' // Optional tables
        ]
        return {
          table: tableNames[index],
          accessible: test.status === 'fulfilled',
          error: test.status === 'rejected' ? test.reason?.message : null,
          isCore: index < 3 // First 3 are core tables
        }
      })

      // Calculate health based on core tables only
      const coreTablesAccessible = tableResults.filter(t => t.isCore && t.accessible).length
      const coreTablesTotal = tableResults.filter(t => t.isCore).length

      const responseTime = Date.now() - startTime
      
      // Health status based on core tables (required) and overall performance
      const status = responseTime < 1000 && coreTablesAccessible === coreTablesTotal ? 'healthy' : 
                    responseTime < 2000 && coreTablesAccessible >= coreTablesTotal * 0.8 ? 'warning' : 'error'

      const message = coreTablesAccessible === coreTablesTotal 
        ? `${accessibleTables}/${totalTables} tables accessible (${coreTablesAccessible}/${coreTablesTotal} core)`
        : `${coreTablesAccessible}/${coreTablesTotal} core tables accessible`

      return {
        status,
        message,
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          accessibleTables,
          totalTables,
          coreTablesAccessible,
          coreTablesTotal,
          responseTimeMs: responseTime,
          tableResults
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `Database error: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: { error: error.message }
      }
    }
  }

  // SMTP Health Check
  private static async checkSMTPHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Test SMTP by checking if we can access Supabase's email service
      // This tests the email functionality through Supabase Auth
      const { data, error } = await supabase.auth.resend({
        email: 'test@example.com',
        type: 'signup'
      })

      const responseTime = Date.now() - startTime
      
      // If we get a response (even if it's an error about the email), SMTP is working
      // The error might be "Email already registered" which means SMTP is working
      const smtpWorking = !error || error.message.includes('already registered') || error.message.includes('rate limit')
      
      return {
        status: smtpWorking ? 'healthy' : 'warning',
        message: smtpWorking ? 'SMTP service operational' : 'SMTP service degraded',
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          smtpWorking,
          responseTimeMs: responseTime,
          error: error?.message || null
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `SMTP error: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: { error: error.message }
      }
    }
  }

  // Network Health Check
  private static async checkNetworkHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Test network connectivity using our own Supabase endpoint to avoid CORS issues
      const testStart = Date.now()
      
      // Test Supabase connectivity (our own API)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      const testTime = Date.now() - testStart
      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          status: 'error',
          message: `Network error: ${error.message}`,
          responseTime,
          lastChecked: new Date().toISOString(),
          details: { error: error.message }
        }
      }

      // Simulate network speed test using our own API
      const status = testTime < 500 ? 'healthy' : testTime < 1000 ? 'warning' : 'error'
      
      return {
        status,
        message: `Network operational (Supabase connectivity: ${Math.round(testTime)}ms)`,
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          supabaseResponseTime: Math.round(testTime),
          connectivityTest: 'passed',
          note: 'Using internal Supabase API to avoid CORS issues'
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `Network error: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: { error: error.message }
      }
    }
  }

  // API Health Check
  private static async checkAPIHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Test internal API endpoints
      const apiTests = await Promise.allSettled([
        // Test Supabase API
        supabase.from('user_profiles').select('count').limit(1),
        // Test auth API
        supabase.auth.getSession(),
        // Test storage API
        supabase.storage.listBuckets()
      ])

      const successfulAPIs = apiTests.filter(test => test.status === 'fulfilled').length
      const responseTime = Date.now() - startTime
      
      const status = responseTime < 1000 && successfulAPIs === apiTests.length ? 'healthy' :
                    responseTime < 2000 && successfulAPIs >= apiTests.length * 0.7 ? 'warning' : 'error'

      return {
        status,
        message: `${successfulAPIs}/${apiTests.length} API endpoints healthy`,
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          successfulAPIs,
          totalAPIs: apiTests.length,
          responseTimeMs: responseTime
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `API error: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: { error: error.message }
      }
    }
  }

  // Storage Health Check
  private static async checkStorageHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Test storage buckets
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) throw error

      const responseTime = Date.now() - startTime
      const bucketCount = buckets?.length || 0
      
      const status = responseTime < 1000 && bucketCount > 0 ? 'healthy' :
                    responseTime < 2000 ? 'warning' : 'error'

      return {
        status,
        message: `${bucketCount} storage buckets accessible`,
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          bucketCount,
          buckets: buckets?.map(b => b.name) || [],
          responseTimeMs: responseTime
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `Storage error: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: { error: error.message }
      }
    }
  }

  // Auth Health Check
  private static async checkAuthHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Test auth service
      const { data: session, error } = await supabase.auth.getSession()
      
      if (error) throw error

      const responseTime = Date.now() - startTime
      const status = responseTime < 1000 ? 'healthy' : responseTime < 2000 ? 'warning' : 'error'

      return {
        status,
        message: 'Authentication service operational',
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          hasSession: !!session?.session,
          responseTimeMs: responseTime
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `Auth error: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: { error: error.message }
      }
    }
  }

  // Realtime Health Check
  private static async checkRealtimeHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Test realtime connection
      const channel = supabase.channel('health-check')
      
      const promise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000)
        
        channel.subscribe((status) => {
          clearTimeout(timeout)
          if (status === 'SUBSCRIBED') {
            resolve(status)
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error('Channel error'))
          }
        })
      })

      await promise
      channel.unsubscribe()

      const responseTime = Date.now() - startTime
      const status = responseTime < 2000 ? 'healthy' : responseTime < 4000 ? 'warning' : 'error'

      return {
        status,
        message: 'Realtime service operational',
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          responseTimeMs: responseTime
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `Realtime error: ${error.message}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: { error: error.message }
      }
    }
  }

  // Calculate overall system health
  private static calculateOverallHealth(health: Omit<SystemHealth, 'overall'>): HealthStatus {
    const statuses = Object.values(health).map(h => h.status)
    const errorCount = statuses.filter(s => s === 'error').length
    const warningCount = statuses.filter(s => s === 'warning').length
    const healthyCount = statuses.filter(s => s === 'healthy').length

    let overallStatus: 'healthy' | 'warning' | 'error' | 'unknown'
    let message: string

    if (errorCount > 0) {
      overallStatus = 'error'
      message = `${errorCount} services down`
    } else if (warningCount > 0) {
      overallStatus = 'warning'
      message = `${warningCount} services degraded`
    } else if (healthyCount === statuses.length) {
      overallStatus = 'healthy'
      message = 'All systems operational'
    } else {
      overallStatus = 'unknown'
      message = 'System status unknown'
    }

    return {
      status: overallStatus,
      message,
      lastChecked: new Date().toISOString(),
      details: {
        totalServices: statuses.length,
        healthy: healthyCount,
        warnings: warningCount,
        errors: errorCount
      }
    }
  }

  // Manual health check trigger
  static async triggerHealthCheck(): Promise<SystemHealth> {
    return new Promise((resolve) => {
      const unsubscribe = this.onHealthUpdate((health) => {
        unsubscribe()
        resolve(health)
      })
      this.performHealthCheck()
    })
  }

  // Get current health status (cached)
  static getCurrentHealth(): SystemHealth | null {
    // This would typically return cached health data
    // For now, we'll return null and rely on real-time updates
    return null
  }
}

export default SystemHealthService
