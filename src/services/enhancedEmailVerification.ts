import { supabase } from '@/lib/supabaseClient'
import { getAuthCallbackUrl, getPasswordResetUrl } from './environmentService'
import { toast } from 'sonner'

export interface EmailVerificationResult {
  success: boolean
  error?: string
  needsVerification?: boolean
  isVerified?: boolean
}

export class EnhancedEmailVerificationService {
  /**
   * Send email verification using Supabase's built-in system
   */
  static async sendVerificationEmail(
    email: string, 
    userType: 'business' | 'individual' = 'business'
  ): Promise<EmailVerificationResult> {
    try {
      console.log(`📧 Sending verification email to ${email} for ${userType} user`)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(userType),
          // Add custom data for better tracking
          data: {
            user_type: userType,
            verification_sent_at: new Date().toISOString()
          }
        }
      })

      if (error) {
        console.error('Error sending verification email:', error)
        return {
          success: false,
          error: error.message
        }
      }

      console.log('✅ Verification email sent successfully')
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
      const { data: user, error } = await supabase.auth.getUser()
      
      if (error || !user.user) {
        return false
      }
      
      return user.user.email_confirmed_at !== null
      
    } catch (error) {
      console.error('Error checking email verification:', error)
      return false
    }
  }

  /**
   * Check verification status for a user
   */
  static async checkVerificationStatus(userId: string): Promise<{
    needsVerification: boolean
    isVerified: boolean
  }> {
    try {
      const { data: user, error } = await supabase.auth.getUser()
      
      if (error || !user.user) {
        return {
          needsVerification: false,
          isVerified: false
        }
      }
      
      const isVerified = user.user.email_confirmed_at !== null
      
      return {
        needsVerification: !isVerified,
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

  /**
   * Update email verification status in user_profiles
   */
  static async updateEmailVerificationStatus(
    userId: string, 
    verified: boolean
  ): Promise<EmailVerificationResult> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email_verified: verified,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating verification status:', error)
        return {
          success: false,
          error: error.message
        }
      }

      return { success: true }
      
    } catch (error: any) {
      console.error('Error updating verification status:', error)
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
      console.log('🔄 Handling email verification callback...')
      
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

      const user = data.session.user
      const isVerified = user.email_confirmed_at !== null
      
      if (!isVerified) {
        return {
          success: false,
          error: 'Email not verified yet'
        }
      }

      // Update email verification status in user_profiles
      const updateResult = await this.updateEmailVerificationStatus(user.id, true)

      if (!updateResult.success) {
        console.warn('Failed to update verification status in profile:', updateResult.error)
        // Don't fail the whole process, just log the warning
      }

      console.log('✅ Email verification successful')
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
  static async sendPasswordResetEmail(
    email: string, 
    userType: 'business' | 'individual' = 'business'
  ): Promise<EmailVerificationResult> {
    try {
      console.log(`🔐 Sending password reset email to ${email}`)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetUrl(),
        data: {
          user_type: userType
        }
      })

      if (error) {
        console.error('Error sending password reset email:', error)
        return {
          success: false,
          error: error.message
        }
      }

      console.log('✅ Password reset email sent successfully')
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
   * Resend verification email for existing user
   */
  static async resendVerificationEmail(
    email: string,
    userType: 'business' | 'individual' = 'business'
  ): Promise<EmailVerificationResult> {
    try {
      console.log(`🔄 Resending verification email to ${email}`)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(userType),
          data: {
            user_type: userType,
            resend_attempt: true,
            resend_at: new Date().toISOString()
          }
        }
      })

      if (error) {
        console.error('Error resending verification email:', error)
        return {
          success: false,
          error: error.message
        }
      }

      console.log('✅ Verification email resent successfully')
      return { success: true }
      
    } catch (error: any) {
      console.error('Error resending verification email:', error)
      return {
        success: false,
        error: error.message || 'Failed to resend verification email'
      }
    }
  }
}
