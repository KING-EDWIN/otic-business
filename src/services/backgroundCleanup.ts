/**
 * Background Cleanup Service
 * Handles automatic cleanup of unverified users
 */

import { ProfessionalSignupService } from './professionalSignup'
import { environmentService } from './environmentService'

export class BackgroundCleanupService {
  private static cleanupInterval: NodeJS.Timeout | null = null
  private static isRunning = false

  /**
   * Start the background cleanup service
   * Runs cleanup every 6 hours
   */
  static start(): void {
    if (this.isRunning) {
      console.log('🧹 Background cleanup service is already running')
      return
    }

    console.log('🚀 Starting background cleanup service...')
    this.isRunning = true

    // Run cleanup immediately
    this.runCleanup()

    // Schedule cleanup every 6 hours
    this.cleanupInterval = setInterval(() => {
      this.runCleanup()
    }, 6 * 60 * 60 * 1000) // 6 hours

    console.log('✅ Background cleanup service started (runs every 6 hours)')
  }

  /**
   * Stop the background cleanup service
   */
  static stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.isRunning = false
    console.log('🛑 Background cleanup service stopped')
  }

  /**
   * Run cleanup manually
   */
  static async runCleanup(): Promise<void> {
    try {
      console.log('🧹 Running scheduled cleanup of unverified users...')
      
      const result = await ProfessionalSignupService.cleanupUnverifiedUsers()
      
      if (result.success) {
        if (result.deletedCount > 0) {
          console.log(`✅ Cleanup completed successfully. Deleted ${result.deletedCount} unverified users.`)
        } else {
          console.log('✅ Cleanup completed. No unverified users to delete.')
        }
      } else {
        console.error('❌ Cleanup failed:', result.error)
      }
    } catch (error: any) {
      console.error('❌ Error in background cleanup:', error)
    }
  }

  /**
   * Get cleanup service status
   */
  static getStatus(): {
    isRunning: boolean
    nextCleanup: Date | null
  } {
    return {
      isRunning: this.isRunning,
      nextCleanup: this.isRunning ? new Date(Date.now() + 6 * 60 * 60 * 1000) : null
    }
  }

  /**
   * Initialize cleanup service based on environment
   */
  static initialize(): void {
    const config = environmentService.getConfig()
    
    if (config.isProduction) {
      console.log('🌍 Production environment detected - starting background cleanup service')
      this.start()
    } else {
      console.log('🔧 Development environment detected - cleanup service not started')
      console.log('   (Run BackgroundCleanupService.start() manually if needed)')
    }
  }
}

// Auto-initialize based on environment
if (typeof window !== 'undefined') {
  // Only run in browser environment
  BackgroundCleanupService.initialize()
}
