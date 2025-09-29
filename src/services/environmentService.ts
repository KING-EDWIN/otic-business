/**
 * Environment Configuration Service
 * Handles dynamic URL configuration for development and production
 */

export interface EnvironmentConfig {
  baseUrl: string
  isProduction: boolean
  isDevelopment: boolean
  supabaseUrl: string
  supabaseAnonKey: string
}

class EnvironmentService {
  private config: EnvironmentConfig

  constructor() {
    this.config = this.initializeConfig()
  }

  private initializeConfig(): EnvironmentConfig {
    // Check if we're in production
    const isProduction = this.isProductionEnvironment()
    const isDevelopment = !isProduction

    // Determine base URL directly
    const baseUrl = isProduction ? 'https://oticbusiness.com' : window.location.origin

    // Get Supabase configuration
    const supabaseUrl = this.getSupabaseUrl()
    const supabaseAnonKey = this.getSupabaseAnonKey()

    return {
      baseUrl,
      isProduction,
      isDevelopment,
      supabaseUrl,
      supabaseAnonKey
    }
  }

  private isProductionEnvironment(): boolean {
    // Check multiple indicators for production
    const hostname = window.location.hostname
    
    // Production domains
    const productionDomains = [
      'oticbusiness.com',
      'www.oticbusiness.com',
      'otic-business.vercel.app',
      'otic-business.netlify.app'
    ]

    // Check if current hostname is a production domain
    if (productionDomains.includes(hostname)) {
      return true
    }

    // Check environment variables
    if (import.meta.env.PROD) {
      return true
    }

    // Check if not localhost
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      return true
    }

    return false
  }

  private getBaseUrl(isProduction: boolean): string {
    if (isProduction) {
      // Production URL
      return 'https://oticbusiness.com'
    } else {
      // Development URL - use current origin
      return window.location.origin
    }
  }

  private getSupabaseUrl(): string {
    // Try environment variable first
    const envUrl = import.meta.env.VITE_SUPABASE_URL
    if (envUrl) {
      return envUrl
    }

    // Fallback to hardcoded production URL
    return 'https://jvgiyscchxxekcbdicco.supabase.co'
  }

  private getSupabaseAnonKey(): string {
    // Try environment variable first
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (envKey) {
      return envKey
    }

    // Fallback to hardcoded production key
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'
  }

  /**
   * Get the current environment configuration
   */
  getConfig(): EnvironmentConfig {
    return this.config
  }

  /**
   * Get the base URL for email redirects
   */
  getPublicBaseUrl(): string {
    return this.config.baseUrl
  }

  /**
   * Get the full URL for a specific path
   */
  getUrl(path: string = ''): string {
    const baseUrl = this.getPublicBaseUrl()
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${baseUrl}${cleanPath}`
  }

  /**
   * Get email redirect URL for auth callbacks
   */
  getAuthCallbackUrl(userType?: 'business' | 'individual'): string {
    const baseUrl = this.getPublicBaseUrl()
    const userTypeParam = userType ? `?user_type=${userType}` : ''
    return `${baseUrl}/auth/callback${userTypeParam}`
  }

  /**
   * Get password reset redirect URL
   */
  getPasswordResetUrl(): string {
    return this.getUrl('/reset-password')
  }

  /**
   * Check if we're in production
   */
  isProduction(): boolean {
    return this.config.isProduction
  }

  /**
   * Check if we're in development
   */
  isDevelopment(): boolean {
    return this.config.isDevelopment
  }

  /**
   * Log current environment info
   */
  logEnvironmentInfo(): void {
    console.log('🌍 Environment Configuration:')
    console.log(`   Base URL: ${this.config.baseUrl}`)
    console.log(`   Production: ${this.config.isProduction}`)
    console.log(`   Development: ${this.config.isDevelopment}`)
    console.log(`   Hostname: ${window.location.hostname}`)
    console.log(`   Origin: ${window.location.origin}`)
  }
}

// Create singleton instance
export const environmentService = new EnvironmentService()

// Export convenience functions
export const getBaseUrl = () => environmentService.getPublicBaseUrl()
export const getUrl = (path?: string) => environmentService.getUrl(path)
export const getAuthCallbackUrl = (userType?: 'business' | 'individual') => 
  environmentService.getAuthCallbackUrl(userType)
export const getPasswordResetUrl = () => environmentService.getPasswordResetUrl()
export const isProduction = () => environmentService.isProduction()
export const isDevelopment = () => environmentService.isDevelopment()

// Log environment info on initialization
if (isDevelopment()) {
  environmentService.logEnvironmentInfo()
}
