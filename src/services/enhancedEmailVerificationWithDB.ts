/**
 * Enhanced Email Verification Service with Database Integration
 * This service integrates with our custom email verification tables
 * and Supabase's built-in auth system
 */

import { supabase } from '@/lib/supabaseClient'
import { getAuthCallbackUrl, getPasswordResetUrl } from './environmentService'
import { toast } from 'sonner'

export interface EmailVerificationResult {
  success: boolean
  error?: string
  needsVerification?: boolean
  isVerified?: boolean
  verificationId?: string
}

export interface VerificationStatus {
  email_verified: boolean
  verification_timestamp: string | null
  pending_verifications: number
  last_verification_sent: string | null
}

export class EnhancedEmailVerificationService {
  /**
   * Sends a verification email and logs it in our database
   */
  static async sendVerificationEmail(
    email: string, 
    userType: 'business' | 'individual' = 'business'
  ): Promise<EmailVerificationResult> {
    try {
      console.log(`📧 Sending verification email to ${email} for ${userType} user`)
      
      // First, check if user can resend (rate limiting)
      const { data: user } = await supabase.auth.getUser()
      if (user?.user) {
        const { data: canResend } = await supabase.rpc('can_resend_verification', {
          p_user_id: user.user.id,
          p_verification_type: 'signup'
        })
        
        if (!canResend) {
          return {
            success: false,
            error: 'Please wait 5 minutes before requesting another verification email.'
          }
        }
      }
      
      // Send verification email via Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(userType),
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

      // Log the verification attempt in our database
      if (user?.user) {
        const { data: logId, error: logError } = await supabase.rpc('log_email_verification', {
          p_user_id: user.user.id,
          p_email: email,
          p_verification_type: 'signup',
          p_ip_address: null, // Could be passed from frontend
          p_user_agent: navigator.userAgent
        })
        
        if (logError) {
          console.warn('Failed to log verification attempt:', logError)
        } else {
          console.log('Verification attempt logged with ID:', logId)
        }
      }

      console.log('Verification email sent successfully.')
      return { success: true }
    } catch (error: any) {
      console.error('Unexpected error sending verification email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send verification email'
      }
    }
  }

  /**
   * Checks the email verification status from our database
   */
  static async checkVerificationStatus(userId: string): Promise<{
    needsVerification: boolean
    isVerified: boolean
    status?: VerificationStatus
  }> {
    try {
      const { data: status, error } = await supabase.rpc('get_user_verification_status', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error fetching verification status:', error)
        // Fallback to basic check
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('email_verified')
          .eq('id', userId)
          .single()
        
        return {
          needsVerification: !profile?.email_verified,
          isVerified: !!profile?.email_verified
        }
      }

      const verificationStatus = status?.[0] as VerificationStatus
      const isVerified = verificationStatus?.email_verified || false
      const needsVerification = !isVerified

      console.log(`User ${userId} verification status:`, verificationStatus)
      return { 
        needsVerification, 
        isVerified,
        status: verificationStatus
      }
    } catch (error) {
      console.error('Unexpected error checking verification status:', error)
      return { needsVerification: true, isVerified: false }
    }
  }

  /**
   * Handles the email verification callback
   */
  static async handleVerificationCallback(): Promise<EmailVerificationResult> {
    try {
      // Get the current session (Supabase automatically processes the URL hash)
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session during verification callback:', error)
        return { success: false, error: error.message }
      }

      if (!session?.user) {
        return { success: false, error: 'No authenticated user found after callback.' }
      }

      // Check verification status
      const { isVerified, status } = await this.checkVerificationStatus(session.user.id)

      if (isVerified) {
        console.log('Email successfully verified during callback.')
        return { success: true, isVerified: true }
      } else {
        console.warn('Email still not verified after callback.')
        return { 
          success: false, 
          error: 'Email verification failed or is pending.', 
          needsVerification: true 
        }
      }
    } catch (error: any) {
      console.error('Unexpected error handling verification callback:', error)
      return { success: false, error: error.message || 'Failed to handle verification callback.' }
    }
  }

  /**
   * Sends a password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    userType: 'business' | 'individual' = 'business'
  ): Promise<EmailVerificationResult> {
    try {
      console.log(`🔐 Sending password reset email to ${email}`)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getUrl('/reset-password'),
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

      console.log('Password reset email sent successfully.')
      return { success: true }
    } catch (error: any) {
      console.error('Unexpected error sending password reset email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send password reset email'
      }
    }
  }

  /**
   * Resends verification email with rate limiting
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

      console.log('Verification email resent successfully.')
      return { success: true }
    } catch (error: any) {
      console.error('Unexpected error resending verification email:', error)
      return {
        success: false,
        error: error.message || 'Failed to resend verification email'
      }
    }
  }

  /**
   * Manually verify an email token (for custom verification flows)
   */
  static async verifyEmailToken(
    userId: string,
    tokenHash: string
  ): Promise<EmailVerificationResult> {
    try {
      console.log(`🔍 Verifying email token for user ${userId}`)
      
      const { data: verified, error } = await supabase.rpc('verify_email_token', {
        p_user_id: userId,
        p_token_hash: tokenHash
      })

      if (error) {
        console.error('Error verifying email token:', error)
        return {
          success: false,
          error: error.message
        }
      }

      if (verified) {
        console.log('Email token verified successfully.')
        return { success: true, isVerified: true }
      } else {
        console.log('Email token verification failed.')
        return {
          success: false,
          error: 'Invalid or expired verification token.'
        }
      }
    } catch (error: any) {
      console.error('Unexpected error verifying email token:', error)
      return {
        success: false,
        error: error.message || 'Failed to verify email token'
      }
    }
  }

  /**
   * Clean up expired verifications (usually called by cron job)
   */
  static async cleanupExpiredVerifications(): Promise<{
    success: boolean
    cleanedCount?: number
    error?: string
  }> {
    try {
      console.log('🧹 Cleaning up expired verifications...')
      
      const { data: cleanedCount, error } = await supabase.rpc('cleanup_expired_verifications')

      if (error) {
        console.error('Error cleaning up expired verifications:', error)
        return {
          success: false,
          error: error.message
        }
      }

      console.log(`✅ Cleaned up ${cleanedCount} expired verifications.`)
      return {
        success: true,
        cleanedCount: cleanedCount || 0
      }
    } catch (error: any) {
      console.error('Unexpected error cleaning up expired verifications:', error)
      return {
        success: false,
        error: error.message || 'Failed to cleanup expired verifications'
      }
    }
  }
}
