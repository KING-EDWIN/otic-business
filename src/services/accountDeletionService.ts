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
   * Restore a soft-deleted account (admin only)
   */
  static async restoreAccount(
    deletedAccountId: string,
    adminUserId: string,
    reason: string = 'Admin requested account restoration'
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      console.log('🔄 Admin restoring account:', deletedAccountId, 'by admin:', adminUserId)

      // Get the deleted account info
      const { data: deletedAccount, error: fetchError } = await supabase
        .from('deleted_users')
        .select('*')
        .eq('id', deletedAccountId)
        .eq('is_recovered', false)
        .single()

      if (fetchError || !deletedAccount) {
        console.error('Error fetching deleted account:', fetchError)
        return { success: false, error: 'Deleted account not found or already recovered' }
      }

      // Call the database function to restore the account
      const { data, error } = await supabase.rpc('restore_user_account', {
        deleted_account_id_param: deletedAccountId,
        admin_user_id_param: adminUserId,
        restoration_reason_param: reason
      })

      if (error) {
        console.error('Account restoration error:', error)
        return { success: false, error: error.message }
      }

      if (data && data.success) {
        console.log('✅ Account restored successfully by admin')
        return { 
          success: true, 
          message: `Account ${deletedAccount.email} has been restored successfully`
        }
      } else {
        return { 
          success: false, 
          error: data?.error || 'Unknown error during restoration' 
        }
      }
    } catch (error: any) {
      console.error('Error restoring account:', error)
      return { success: false, error: error.message || 'Failed to restore account' }
    }
  }

  /**
   * Restore account with password verification (user-facing)
   */
  static async restoreAccountWithPassword(
    email: string,
    password: string,
    reason: string = 'User requested account restoration'
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      console.log('🔄 User restoring account:', email)

      // First verify the password by attempting to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.error('Password verification failed:', authError)
        return { success: false, error: 'Invalid password. Please check your credentials.' }
      }

      // Get the deleted account info
      const { data: deletedAccount, error: fetchError } = await supabase
        .from('deleted_users')
        .select('*')
        .eq('email', email)
        .eq('is_recovered', false)
        .single()

      if (fetchError || !deletedAccount) {
        console.error('Error fetching deleted account:', fetchError)
        return { success: false, error: 'No recoverable account found for this email' }
      }

      // Call the database function to restore the account
      const { data, error } = await supabase.rpc('restore_user_account', {
        deleted_account_id_param: deletedAccount.id,
        admin_user_id_param: authData.user.id, // User is restoring their own account
        restoration_reason_param: reason
      })

      if (error) {
        console.error('Account restoration error:', error)
        return { success: false, error: error.message }
      }

      if (data && data.success) {
        console.log('✅ Account restored successfully by user')
        return { 
          success: true, 
          message: 'Your account has been restored successfully! Welcome back!'
        }
      } else {
        return { 
          success: false, 
          error: data?.error || 'Unknown error during restoration' 
        }
      }
    } catch (error: any) {
      console.error('Error restoring account:', error)
      return { success: false, error: error.message || 'Failed to restore account' }
    }
  }

  /**
   * Check if an email has a recoverable account
   */
  static async checkRecoverableAccountByEmail(email: string): Promise<{ 
    hasRecoverableAccount: boolean; 
    accountInfo?: any; 
    error?: string 
  }> {
    try {
      // First check for active recoverable accounts
      const { data: activeData, error: activeError } = await supabase
        .from('deleted_users')
        .select('*')
        .eq('email', email)
        .eq('is_recovered', false)
        .gt('recovery_expires_at', new Date().toISOString())
        .single()

      if (activeData) {
        return { 
          hasRecoverableAccount: true, 
          accountInfo: activeData 
        }
      }

      // If no active account, check for recently recovered accounts (within last 24 hours)
      const { data: recoveredData, error: recoveredError } = await supabase
        .from('deleted_users')
        .select('*')
        .eq('email', email)
        .eq('is_recovered', true)
        .gte('recovered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (recoveredData) {
        return { 
          hasRecoverableAccount: false, 
          accountInfo: recoveredData,
          error: 'Account was recently restored. Please try signing in again.'
        }
      }

      if (activeError && activeError.code !== 'PGRST116' && recoveredError && recoveredError.code !== 'PGRST116') {
        console.error('Error checking recoverable account:', activeError || recoveredError)
        return { hasRecoverableAccount: false, error: (activeError || recoveredError).message }
      }

      return { 
        hasRecoverableAccount: false, 
        accountInfo: null 
      }
    } catch (error: any) {
      console.error('Error checking recoverable account:', error)
      return { hasRecoverableAccount: false, error: error.message }
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

      console.log('🔍 Fetching deleted accounts from deleted_users table...')
      
      // Add timeout to prevent infinite loading
      const queryPromise = supabase
        .from('deleted_users')
        .select('*', { count: 'exact' })
        .order('deleted_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )

      const { data, error, count } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.error('Error fetching deleted accounts:', error)
        return { success: false, error: error.message }
      }

      console.log('📊 Raw data from deleted_users:', { data, count, error })
      console.log('📊 Number of accounts found:', data?.length || 0)

      // Transform the data to include computed fields
      const transformedData = (data || []).map(account => {
        const deletedAt = new Date(account.deleted_at)
        const recoveryExpiresAt = new Date(account.recovery_expires_at)
        const now = new Date()
        
        let status: 'EXPIRED' | 'RECOVERED' | 'ACTIVE'
        let daysRemaining = 0
        
        if (account.is_recovered) {
          status = 'RECOVERED'
        } else if (now > recoveryExpiresAt) {
          status = 'EXPIRED'
        } else {
          status = 'ACTIVE'
          daysRemaining = Math.ceil((recoveryExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }
        
        return {
          ...account,
          status,
          days_remaining: daysRemaining
        }
      })

      return {
        success: true,
        data: transformedData,
        total: count || 0
      }
    } catch (error: any) {
      console.error('Error getting deleted accounts:', error)
      if (error.message === 'Query timeout') {
        return { success: false, error: 'Request timed out. Please try again.' }
      }
      return { success: false, error: error.message || 'Failed to fetch deleted accounts' }
    }
  }

  /**
   * Create a test deleted account for debugging
   */
  static async createTestDeletedAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 Creating test deleted account...')
      
      const { data, error } = await supabase
        .from('deleted_users')
        .insert([{
          original_user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
          email: 'test@example.com',
          full_name: 'Test User',
          business_name: 'Test Business',
          user_type: 'business',
          tier: 'free_trial',
          phone: '+256700000000',
          deletion_reason: 'Test deletion for debugging',
          deleted_by: '00000000-0000-0000-0000-000000000000',
          deleted_at: new Date().toISOString(),
          recovery_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          is_recovered: false
        }])
        .select()

      if (error) {
        console.error('Error creating test deleted account:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Test deleted account created:', data)
      return { success: true }
    } catch (error: any) {
      console.error('Error creating test deleted account:', error)
      return { success: false, error: error.message || 'Failed to create test deleted account' }
    }
  }

  /**
   * Permanently delete ALL deleted accounts (bypass 30-day recovery period)
   */
  static async permanentDeleteAllAccounts(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      console.log('🗑️ Permanently deleting ALL deleted accounts...')

      // First, get all deleted accounts to delete them completely
      const { data: deletedAccounts, error: fetchError } = await supabase
        .from('deleted_users')
        .select('email, original_user_id')

      if (fetchError) {
        console.error('Error fetching deleted accounts:', fetchError)
        return { success: false, error: fetchError.message }
      }

      const deletedCount = deletedAccounts?.length || 0
      console.log(`Found ${deletedCount} deleted accounts to permanently remove`)

      // Delete each account completely using the complete deletion function
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const account of deletedAccounts || []) {
        try {
          const { data, error } = await supabase.rpc('delete_user_completely', {
            user_email: account.email
          })

          if (error) {
            console.error(`Error deleting ${account.email}:`, error)
            errors.push(`${account.email}: ${error.message}`)
            errorCount++
          } else {
            console.log(`✅ Completely deleted: ${account.email}`)
            successCount++
          }
        } catch (error: any) {
          console.error(`Exception deleting ${account.email}:`, error)
          errors.push(`${account.email}: ${error.message}`)
          errorCount++
        }
      }

      // Now delete all records from deleted_users table
      const { error: deleteError } = await supabase
        .from('deleted_users')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

      if (deleteError) {
        console.error('Error cleaning deleted_users table:', deleteError)
        errors.push(`Failed to clean deleted_users table: ${deleteError.message}`)
      }

      if (errorCount > 0) {
        return { 
          success: false, 
          error: `Failed to delete ${errorCount} accounts. Errors: ${errors.join('; ')}`,
          deletedCount: successCount
        }
      }

      console.log(`✅ Permanently deleted ${successCount} accounts completely`)
      return { 
        success: true, 
        deletedCount: successCount
      }
    } catch (error: any) {
      console.error('Error in permanent delete all:', error)
      return { success: false, error: error.message || 'Failed to permanently delete all accounts' }
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
