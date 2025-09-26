import { supabase } from '@/lib/supabaseClient'

export class EmailVerificationUpdateService {
  /**
   * Update email verification status in user_profiles when Supabase auth is verified
   */
  static async updateEmailVerificationStatus(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current auth user to check verification status
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { success: false, error: 'User not found' }
      }

      const isEmailVerified = user.email_confirmed_at !== null
      
      if (isEmailVerified) {
        // Update the user_profiles table
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating email verification status:', updateError)
          return { success: false, error: updateError.message }
        }

        console.log('✅ Email verification status updated for user:', userId)
        return { success: true }
      } else {
        console.log('📧 Email not yet verified for user:', userId)
        return { success: false, error: 'Email not verified' }
      }
    } catch (error: any) {
      console.error('Error updating email verification status:', error)
      return { success: false, error: error.message || 'Failed to update verification status' }
    }
  }

  /**
   * Check if user's email is verified in both auth and profile
   */
  static async isEmailVerified(userId: string): Promise<boolean> {
    try {
      // Check both auth and profile verification status
      const [authResult, profileResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('user_profiles').select('email_verified').eq('id', userId).single()
      ])

      const authVerified = authResult.data.user?.email_confirmed_at !== null
      const profileVerified = profileResult.data?.email_verified || false

      // If auth is verified but profile is not, update profile
      if (authVerified && !profileVerified) {
        await this.updateEmailVerificationStatus(userId)
        return true
      }

      return authVerified && profileVerified
    } catch (error) {
      console.error('Error checking email verification status:', error)
      return false
    }
  }

  /**
   * Force refresh verification status
   */
  static async refreshVerificationStatus(userId: string): Promise<{ needsVerification: boolean; isVerified: boolean }> {
    try {
      const isVerified = await this.isEmailVerified(userId)
      
      return {
        needsVerification: !isVerified,
        isVerified
      }
    } catch (error) {
      console.error('Error refreshing verification status:', error)
      return {
        needsVerification: true,
        isVerified: false
      }
    }
  }
}

export default EmailVerificationUpdateService
