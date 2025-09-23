import { supabase } from '@/lib/supabaseClient'

export interface CleanupResult {
  success: boolean
  error?: string
  deletedCount?: number
}

export class EmailVerificationCleanupService {
  /**
   * Clean up unverified users older than 24 hours
   */
  static async cleanupUnverifiedUsers(): Promise<CleanupResult> {
    try {
      console.log('🧹 Starting cleanup of unverified users...')
      
      // Calculate 24 hours ago
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      
      // Find unverified users older than 24 hours
      const { data: unverifiedUsers, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id, email, created_at')
        .eq('email_verified', false)
        .lt('created_at', twentyFourHoursAgo.toISOString())
      
      if (fetchError) {
        console.error('Error fetching unverified users:', fetchError)
        return {
          success: false,
          error: fetchError.message
        }
      }
      
      if (!unverifiedUsers || unverifiedUsers.length === 0) {
        console.log('✅ No unverified users to clean up')
        return {
          success: true,
          deletedCount: 0
        }
      }
      
      console.log(`🗑️ Found ${unverifiedUsers.length} unverified users to clean up`)
      
      let deletedCount = 0
      const errors: string[] = []
      
      // Delete each unverified user
      for (const user of unverifiedUsers) {
        try {
          // Delete from user_profiles first
          const { error: profileError } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', user.id)
          
          if (profileError) {
            console.error(`Error deleting profile for user ${user.id}:`, profileError)
            errors.push(`Profile deletion failed for ${user.email}: ${profileError.message}`)
            continue
          }
          
          // Delete from auth users (requires admin privileges)
          const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
          
          if (authError) {
            console.error(`Error deleting auth user ${user.id}:`, authError)
            errors.push(`Auth user deletion failed for ${user.email}: ${authError.message}`)
            continue
          }
          
          deletedCount++
          console.log(`✅ Successfully deleted unverified user: ${user.email}`)
          
        } catch (error: any) {
          console.error(`Error deleting user ${user.id}:`, error)
          errors.push(`Deletion failed for ${user.email}: ${error.message}`)
        }
      }
      
      console.log(`🎉 Cleanup completed. Deleted ${deletedCount} users.`)
      
      if (errors.length > 0) {
        console.warn('⚠️ Some deletions failed:', errors)
      }
      
      return {
        success: true,
        deletedCount,
        error: errors.length > 0 ? errors.join('; ') : undefined
      }
      
    } catch (error: any) {
      console.error('Error in cleanup process:', error)
      return {
        success: false,
        error: error.message || 'Unknown error during cleanup'
      }
    }
  }
  
  /**
   * Check if a user needs cleanup (unverified for more than 24 hours)
   */
  static async shouldCleanupUser(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('email_verified, created_at')
        .eq('id', userId)
        .single()
      
      if (error || !user) {
        return false
      }
      
      // If already verified, no cleanup needed
      if (user.email_verified) {
        return false
      }
      
      // Check if created more than 24 hours ago
      const createdAt = new Date(user.created_at)
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      
      return createdAt < twentyFourHoursAgo
      
    } catch (error) {
      console.error('Error checking cleanup status:', error)
      return false
    }
  }
  
  /**
   * Get cleanup statistics
   */
  static async getCleanupStats(): Promise<{
    totalUnverified: number
    needsCleanup: number
    recentSignups: number
  }> {
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      
      // Get all unverified users
      const { data: allUnverified, error: allError } = await supabase
        .from('user_profiles')
        .select('id, created_at')
        .eq('email_verified', false)
      
      if (allError) {
        throw allError
      }
      
      // Get users that need cleanup
      const { data: needsCleanup, error: cleanupError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email_verified', false)
        .lt('created_at', twentyFourHoursAgo.toISOString())
      
      if (cleanupError) {
        throw cleanupError
      }
      
      // Get recent signups (last 24 hours)
      const { data: recentSignups, error: recentError } = await supabase
        .from('user_profiles')
        .select('id')
        .gte('created_at', twentyFourHoursAgo.toISOString())
      
      if (recentError) {
        throw recentError
      }
      
      return {
        totalUnverified: allUnverified?.length || 0,
        needsCleanup: needsCleanup?.length || 0,
        recentSignups: recentSignups?.length || 0
      }
      
    } catch (error: any) {
      console.error('Error getting cleanup stats:', error)
      return {
        totalUnverified: 0,
        needsCleanup: 0,
        recentSignups: 0
      }
    }
  }
}
