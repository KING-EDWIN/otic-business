import { supabase } from '@/lib/supabaseClient'

export interface TwoFactorAuthResult {
  success: boolean
  error?: string
  requiresVerification?: boolean
}

export interface VerificationResult {
  success: boolean
  error?: string
  user?: any
}

export class TwoFactorAuthService {
  private static readonly OTP_EXPIRY_MINUTES = 10
  private static readonly MAX_ATTEMPTS = 3

  /**
   * Send OTP to user's email for 2FA verification
   */
  static async sendOTP(email: string): Promise<TwoFactorAuthResult> {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store OTP in database with expiry
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000)
      
      const { error: insertError } = await supabase
        .from('two_factor_codes')
        .insert({
          email,
          code: otp,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error storing OTP:', insertError)
        return { success: false, error: 'Failed to generate verification code' }
      }

      // Send email via Supabase Edge Function or SMTP
      const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: {
          email,
          otp,
          expiresIn: this.OTP_EXPIRY_MINUTES
        }
      })

      if (emailError) {
        console.error('Error sending OTP email:', emailError)
        // Don't fail completely - OTP is stored, user can try again
        return { 
          success: true, 
          error: 'Code generated but email delivery failed. Please try again.' 
        }
      }

      return { success: true }
    } catch (error) {
      console.error('2FA send OTP error:', error)
      return { success: false, error: 'Failed to send verification code' }
    }
  }

  /**
   * Verify OTP code for 2FA
   */
  static async verifyOTP(email: string, code: string): Promise<VerificationResult> {
    try {
      // Get the OTP record
      const { data: otpRecord, error: fetchError } = await supabase
        .from('two_factor_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .single()

      if (fetchError || !otpRecord) {
        return { success: false, error: 'Invalid verification code' }
      }

      // Check if OTP has expired
      const now = new Date()
      const expiresAt = new Date(otpRecord.expires_at)
      if (now > expiresAt) {
        return { success: false, error: 'Verification code has expired' }
      }

      // Check if max attempts exceeded
      if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
        return { success: false, error: 'Too many failed attempts. Please request a new code.' }
      }

      // Verify the code
      if (otpRecord.code !== code) {
        // Increment attempts
        await supabase
          .from('two_factor_codes')
          .update({ attempts: otpRecord.attempts + 1 })
          .eq('id', otpRecord.id)

        return { success: false, error: 'Invalid verification code' }
      }

      // Code is valid - clean up the OTP record
      await supabase
        .from('two_factor_codes')
        .delete()
        .eq('id', otpRecord.id)

      // Get user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { success: false, error: 'User session not found' }
      }

      return { success: true, user }
    } catch (error) {
      console.error('2FA verify OTP error:', error)
      return { success: false, error: 'Failed to verify code' }
    }
  }

  /**
   * Enable 2FA for a user
   */
  static async enable2FA(userId: string): Promise<TwoFactorAuthResult> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ two_factor_enabled: true })
        .eq('id', userId)

      if (error) {
        return { success: false, error: 'Failed to enable 2FA' }
      }

      return { success: true }
    } catch (error) {
      console.error('Enable 2FA error:', error)
      return { success: false, error: 'Failed to enable 2FA' }
    }
  }

  /**
   * Disable 2FA for a user
   */
  static async disable2FA(userId: string): Promise<TwoFactorAuthResult> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ two_factor_enabled: false })
        .eq('id', userId)

      if (error) {
        return { success: false, error: 'Failed to disable 2FA' }
      }

      return { success: true }
    } catch (error) {
      console.error('Disable 2FA error:', error)
      return { success: false, error: 'Failed to disable 2FA' }
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  static async is2FAEnabled(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('two_factor_enabled')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return false
      }

      return data.two_factor_enabled || false
    } catch (error) {
      console.error('Check 2FA status error:', error)
      return false
    }
  }

  /**
   * Clean up expired OTP codes
   */
  static async cleanupExpiredCodes(): Promise<void> {
    try {
      const now = new Date().toISOString()
      await supabase
        .from('two_factor_codes')
        .delete()
        .lt('expires_at', now)
    } catch (error) {
      console.error('Cleanup expired codes error:', error)
    }
  }
}
