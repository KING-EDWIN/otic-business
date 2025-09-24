import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export interface DeletedAccountInfo {
  has_recoverable_account: boolean
  deleted_at?: string
  days_remaining?: number
  user_type?: 'business' | 'individual'
  business_name?: string
}

export interface RecoveryResult {
  success: boolean
  message?: string
  error?: string
  user_data?: {
    email: string
    full_name: string
    business_name?: string
    user_type: 'business' | 'individual'
    tier: string
  }
}

export class AccountDeletionService {
  /**
   * Soft delete a user account (moves to deleted_users table for 30-day recovery)
   */
  static async softDeleteAccount(
    userId: string, 
    deletionReason: string = 'User requested account deletion'
  ): Promise<{ success: boolean; error?: string; recoveryToken?: string }> {
    try {
      console.log('🗑️ Starting soft delete for user:', userId)

      // Call the database function to soft delete
      const { data, error } = await supabase.rpc('soft_delete_user_account', {
        user_id_param: userId,
        deletion_reason_param: deletionReason
      })

      if (error) {
        console.error('Soft delete error:', error)
        return { success: false, error: error.message }
      }

      if (data && data.success) {
        console.log('✅ Account soft deleted successfully')
        
        // Now delete the auth user (this will sign them out)
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(userId)
          if (authError) {
            console.warn('Auth user deletion failed:', authError)
            // Don't fail the operation, just log the warning
          }
        } catch (authError) {
          console.warn('Auth user deletion exception:', authError)
        }

        return { 
          success: true, 
          recoveryToken: data.recovery_token 
        }
      } else {
        return { 
          success: false, 
          error: data?.error || 'Unknown error during soft delete' 
        }
      }
    } catch (error: any) {
      console.error('Error in soft delete:', error)
      return { success: false, error: error.message || 'Failed to delete account' }
    }
  }

  /**
   * Check if an email has a recoverable account
   */
  static async checkRecoverableAccount(email: string): Promise<DeletedAccountInfo> {
    try {
      console.log('🔍 Checking for recoverable account:', email)

      const { data, error } = await supabase.rpc('check_recoverable_account', {
        email_param: email
      })

      if (error) {
        console.error('Check recoverable account error:', error)
        return { has_recoverable_account: false }
      }

      return data || { has_recoverable_account: false }
    } catch (error: any) {
      console.error('Error checking recoverable account:', error)
      return { has_recoverable_account: false }
    }
  }

  /**
   * Recover a soft-deleted account
   */
  static async recoverAccount(
    recoveryToken: string, 
    newUserId: string
  ): Promise<RecoveryResult> {
    try {
      console.log('🔄 Recovering account with token:', recoveryToken)

      const { data, error } = await supabase.rpc('recover_user_account', {
        recovery_token_param: recoveryToken,
        new_user_id: newUserId
      })

      if (error) {
        console.error('Account recovery error:', error)
        return { success: false, error: error.message }
      }

      if (data && data.success) {
        console.log('✅ Account recovered successfully')
        toast.success('Account recovered successfully! Welcome back!')
        return { 
          success: true, 
          message: data.message,
          user_data: data.user_data
        }
      } else {
        return { 
          success: false, 
          error: data?.error || 'Unknown error during recovery' 
        }
      }
    } catch (error: any) {
      console.error('Error recovering account:', error)
      return { success: false, error: error.message || 'Failed to recover account' }
    }
  }

  /**
   * Permanently delete an account (admin only)
   */
  static async permanentDeleteAccount(
    userId: string, 
    adminUserId: string,
    reason: string = 'Admin requested permanent deletion'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💀 Permanent delete requested by admin:', adminUserId, 'for user:', userId)

      // First soft delete to preserve data
      const softDeleteResult = await this.softDeleteAccount(userId, reason)
      
      if (!softDeleteResult.success) {
        return softDeleteResult
      }

      // Then immediately mark as permanently deleted (no recovery)
      const { error } = await supabase
        .from('deleted_users')
        .update({ 
          is_recovered: true, // Mark as "recovered" to prevent actual recovery
          recovery_expires_at: NOW() // Expire immediately
        })
        .eq('original_user_id', userId)

      if (error) {
        console.error('Error marking as permanently deleted:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error in permanent delete:', error)
      return { success: false, error: error.message || 'Failed to permanently delete account' }
    }
  }

  /**
   * Get deleted accounts for admin (with pagination)
   */
  static async getDeletedAccounts(
    page: number = 1, 
    limit: number = 20
  ): Promise<{ 
    success: boolean; 
    data?: any[]; 
    total?: number; 
    error?: string 
  }> {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from('admin_deleted_accounts')
        .select('*', { count: 'exact' })
        .order('deleted_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching deleted accounts:', error)
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data: data || [],
        total: count || 0
      }
    } catch (error: any) {
      console.error('Error getting deleted accounts:', error)
      return { success: false, error: error.message || 'Failed to fetch deleted accounts' }
    }
  }

  /**
   * Clean up expired deleted accounts (run as cron job)
   */
  static async cleanupExpiredAccounts(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      console.log('🧹 Cleaning up expired deleted accounts...')

      const { data, error } = await supabase.rpc('cleanup_expired_deleted_accounts')

      if (error) {
        console.error('Cleanup error:', error)
        return { success: false, error: error.message }
      }

      const deletedCount = data || 0
      console.log(`✅ Cleaned up ${deletedCount} expired accounts`)

      return { success: true, deletedCount }
    } catch (error: any) {
      console.error('Error cleaning up expired accounts:', error)
      return { success: false, error: error.message || 'Failed to cleanup expired accounts' }
    }
  }
}
