import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export interface UserData {
  id: string
  email: string
  created_at: string
  user_type: string
  business_name?: string
  tier?: string
}

export class AdminUserService {
  /**
   * Search for a user by email with proper error handling
   * COMPLETELY DISABLED AUTHENTICATION - Works without login
   */
  static async searchUser(email: string): Promise<{ success: boolean; data?: UserData; error?: string }> {
    try {
      if (!email.trim()) {
        return { success: false, error: 'Please enter an email address' }
      }

      console.log('🔍 Searching for user:', email)

      // Use the simple search function
      try {
        const { data, error } = await supabase.rpc('simple_user_search', {
          search_email: email.trim()
        })

        if (error) {
          console.error('Simple search error:', error)
          return { success: false, error: 'Search failed: ' + error.message }
        }

        if (data && data.length > 0) {
          console.log('✅ User found:', data[0])
          return { success: true, data: data[0] }
        } else {
          return { success: false, error: 'User not found' }
        }
      } catch (error: any) {
        console.error('Search failed:', error)
        return { success: false, error: 'Unable to search users. Please try again.' }
      }
    } catch (error: any) {
      console.error('Error searching user:', error)
      
      // Handle network errors
      if (error.message?.includes('Load failed') || error.message?.includes('network') || error.message?.includes('offline')) {
        return { success: false, error: 'Network error. Please check your connection and try again.' }
      }
      
      return { success: false, error: error.message || 'An unexpected error occurred' }
    }
  }

  /**
   * Delete a user and all associated data using the database function
   */
  static async deleteUser(userId: string, userEmail: string): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('Starting user deletion process for:', userEmail)

      // Use the database function for comprehensive deletion
      const { data, error } = await supabase.rpc('delete_user_completely', {
        user_id_param: userId
      })

      if (error) {
        console.error('Database deletion function error:', error)
        return { 
          success: false, 
          error: `Database error: ${error.message}` 
        }
      }

      if (data && data.success) {
        console.log('User deletion successful:', data)
        
        // Try to delete auth user (this might fail due to permissions)
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(userId)
          
          if (authError) {
            console.warn('Auth user deletion failed:', authError)
            return { 
              success: true, 
              error: 'User data deleted successfully, but auth user deletion failed. You may need to delete the auth user manually from Supabase Auth dashboard.',
              details: data
            }
          }
        } catch (error) {
          console.warn('Auth user deletion exception:', error)
          return { 
            success: true, 
            error: 'User data deleted successfully, but auth user deletion failed. You may need to delete the auth user manually from Supabase Auth dashboard.',
            details: data
          }
        }

        return { success: true, details: data }
      } else {
        return { 
          success: false, 
          error: data?.message || 'Unknown deletion error',
          details: data
        }
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      return { success: false, error: error.message || 'Failed to delete user' }
    }
  }

  /**
   * Verify if the current user has admin privileges
   * COMPLETELY DISABLED - Allow access to anyone with the link (no login required)
   */
  static async checkAdminPrivileges(): Promise<boolean> {
    // COMPLETELY DISABLED: Allow access to anyone with the admin portal link
    // No authentication checks whatsoever - for developer data cleanup
    return true
  }

  /**
   * Get comprehensive user details using the database function
   */
  static async getUserDetails(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('get_user_details', {
        user_id_param: userId
      })

      if (error) {
        console.error('Error getting user details:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Exception getting user details:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get user deletion status (check if user still exists)
   */
  static async getUserDeletionStatus(userId: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { exists: false } // User doesn't exist
        }
        return { exists: true, error: error.message }
      }

      return { exists: true }
    } catch (error: any) {
      return { exists: true, error: error.message }
    }
  }
}

export default AdminUserService
