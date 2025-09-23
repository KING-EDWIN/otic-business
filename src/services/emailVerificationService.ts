import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export interface EmailVerificationResult {
  success: boolean
  error?: string
  needsVerification?: boolean
}

export class EmailVerificationService {
  /**
   * Send email verification to user
   */
  static async sendVerificationEmail(email: string, userType: 'business' | 'individual' = 'business'): Promise<EmailVerificationResult> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?user_type=${userType}`
        }
      })

      if (error) {
        console.error('Error sending verification email:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error sending verification email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send verification email'
      }
    }
  }

  /**
   * Check if user's email is verified
   */
  static async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('email_verified')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error checking email verification status:', error)
        return false
      }

      return profile?.email_verified || false
    } catch (error) {
      console.error('Error checking email verification status:', error)
      return false
    }
  }

  /**
   * Update email verification status in database
   */
  static async updateEmailVerificationStatus(userId: string, verified: boolean): Promise<EmailVerificationResult> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email_verified: verified,
          verification_timestamp: verified ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating email verification status:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error updating email verification status:', error)
      return {
        success: false,
        error: error.message || 'Failed to update verification status'
      }
    }
  }

  /**
   * Handle email verification callback
   */
  static async handleEmailVerificationCallback(): Promise<EmailVerificationResult> {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session during email verification:', error)
        return {
          success: false,
          error: error.message
        }
      }

      if (!data.session?.user) {
        return {
          success: false,
          error: 'No authenticated user found'
        }
      }

      // Update email verification status
      const updateResult = await this.updateEmailVerificationStatus(
        data.session.user.id, 
        true
      )

      if (!updateResult.success) {
        return updateResult
      }

      // Show success message
      toast.success('Email verified successfully! Welcome to OTIC Business.')

      return { success: true }
    } catch (error: any) {
      console.error('Error handling email verification callback:', error)
      return {
        success: false,
        error: error.message || 'Failed to verify email'
      }
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, userType: 'business' | 'individual' = 'business'): Promise<EmailVerificationResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?user_type=${userType}`
      })

      if (error) {
        console.error('Error sending password reset email:', error)
        return {
          success: false,
          error: error.message
        }
      }

      toast.success('Password reset email sent! Check your inbox.')
      return { success: true }
    } catch (error: any) {
      console.error('Error sending password reset email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send password reset email'
      }
    }
  }

  /**
   * Check if user needs email verification
   */
  static async checkVerificationStatus(userId: string): Promise<{
    needsVerification: boolean
    isVerified: boolean
  }> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('email_verified, created_at')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error checking verification status:', error)
        return {
          needsVerification: false,
          isVerified: false
        }
      }

      const isVerified = profile?.email_verified || false
      const needsVerification = !isVerified

      return {
        needsVerification,
        isVerified
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
      return {
        needsVerification: false,
        isVerified: false
      }
    }
  }
}

export default EmailVerificationService
