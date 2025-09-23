import { supabase } from '@/lib/supabaseClient'
import { EnhancedEmailVerificationService } from './enhancedEmailVerificationWithDB'
import { EmailVerificationCleanupService } from './emailVerificationCleanup'
import { getUrl } from './environmentService'
import { toast } from 'sonner'

export interface SignupData {
  email: string
  password: string
  businessName?: string
  fullName?: string
  phone?: string
  address?: string
  userType: 'business' | 'individual'
  profession?: string
  country?: string
  countryCode?: string
}

export interface SignupResult {
  success: boolean
  error?: string
  needsEmailVerification?: boolean
  userId?: string
}

export class ProfessionalSignupService {
  /**
   * Professional signup flow with proper email verification
   */
  static async signup(data: SignupData): Promise<SignupResult> {
    try {
      console.log(`🚀 Starting professional signup for ${data.email} (${data.userType})`)
      
      // Step 1: Create auth user with email verification required
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: getUrl('/verify-email'),
          data: {
            business_name: data.businessName || data.fullName,
            user_type: data.userType,
            phone: data.phone,
            address: data.address,
            profession: data.profession,
            country: data.country,
            country_code: data.countryCode
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        return {
          success: false,
          error: authError.message
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'No user data returned from signup'
        }
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Step 2: Create user profile (but mark as unverified)
      const profileData = {
        id: authData.user.id,
        email: data.email,
        full_name: data.businessName || data.fullName || '',
        user_type: data.userType,
        tier: 'free_trial' as const,
        email_verified: false, // Will be updated when email is verified
        phone: data.phone || '',
        address: data.address || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add business-specific fields
      if (data.userType === 'business') {
        profileData.business_name = data.businessName || ''
      }

      // Add individual-specific fields
      if (data.userType === 'individual') {
        profileData.profession = data.profession || ''
        profileData.country = data.country || ''
        profileData.country_code = data.countryCode || ''
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData)

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Clean up auth user if profile creation fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError)
        }
        
        return {
          success: false,
          error: `Profile creation failed: ${profileError.message}`
        }
      }

      console.log('✅ User profile created successfully')

      // Step 3: Send verification email
      const verificationResult = await EnhancedEmailVerificationService.sendVerificationEmail(
        data.email,
        data.userType
      )

      if (!verificationResult.success) {
        console.warn('Failed to send verification email:', verificationResult.error)
        // Don't fail the signup, but log the issue
        toast.warning('Account created but verification email failed to send. Please try signing in to resend.')
      }

      // Step 4: Schedule cleanup for unverified users (24 hours)
      // This will be handled by a background service
      console.log('📅 User will be cleaned up if not verified within 24 hours')

      console.log('🎉 Signup completed successfully')
      
      return {
        success: true,
        needsEmailVerification: true,
        userId: authData.user.id
      }

    } catch (error: any) {
      console.error('Error in signup process:', error)
      return {
        success: false,
        error: error.message || 'Signup failed'
      }
    }
  }

  /**
   * Handle email verification completion
   */
  static async handleEmailVerification(userId: string): Promise<SignupResult> {
    try {
      console.log(`✅ Handling email verification for user ${userId}`)
      
      // Update verification status
      const updateResult = await EnhancedEmailVerificationService.updateEmailVerificationStatus(
        userId,
        true
      )

      if (!updateResult.success) {
        console.error('Failed to update verification status:', updateResult.error)
        return {
          success: false,
          error: updateResult.error
        }
      }

      console.log('✅ Email verification completed successfully')
      return { success: true }

    } catch (error: any) {
      console.error('Error handling email verification:', error)
      return {
        success: false,
        error: error.message || 'Email verification failed'
      }
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(
    email: string,
    userType: 'business' | 'individual'
  ): Promise<SignupResult> {
    try {
      console.log(`🔄 Resending verification email to ${email}`)
      
      const result = await EnhancedEmailVerificationService.resendVerificationEmail(
        email,
        userType
      )

      if (!result.success) {
        return {
          success: false,
          error: result.error
        }
      }

      toast.success('Verification email sent! Check your inbox.')
      return { success: true }

    } catch (error: any) {
      console.error('Error resending verification email:', error)
      return {
        success: false,
        error: error.message || 'Failed to resend verification email'
      }
    }
  }

  /**
   * Check if user needs verification
   */
  static async checkVerificationStatus(userId: string): Promise<{
    needsVerification: boolean
    isVerified: boolean
  }> {
    try {
      return await EnhancedEmailVerificationService.checkVerificationStatus(userId)
    } catch (error) {
      console.error('Error checking verification status:', error)
      return {
        needsVerification: false,
        isVerified: false
      }
    }
  }

  /**
   * Clean up unverified users (called by background service)
   */
  static async cleanupUnverifiedUsers(): Promise<{
    success: boolean
    deletedCount: number
    error?: string
  }> {
    try {
      console.log('🧹 Starting scheduled cleanup of unverified users...')
      
      const result = await EmailVerificationCleanupService.cleanupUnverifiedUsers()
      
      if (result.success) {
        console.log(`✅ Cleanup completed. Deleted ${result.deletedCount} unverified users.`)
      } else {
        console.error('❌ Cleanup failed:', result.error)
      }
      
      return {
        success: result.success,
        deletedCount: result.deletedCount || 0,
        error: result.error
      }
      
    } catch (error: any) {
      console.error('Error in cleanup process:', error)
      return {
        success: false,
        deletedCount: 0,
        error: error.message || 'Cleanup failed'
      }
    }
  }

  /**
   * Get signup statistics
   */
  static async getSignupStats(): Promise<{
    totalUsers: number
    verifiedUsers: number
    unverifiedUsers: number
    needsCleanup: number
  }> {
    try {
      // Get total users
      const { data: allUsers, error: allError } = await supabase
        .from('user_profiles')
        .select('id, email_verified, created_at')
      
      if (allError) throw allError

      const totalUsers = allUsers?.length || 0
      const verifiedUsers = allUsers?.filter(user => user.email_verified).length || 0
      const unverifiedUsers = totalUsers - verifiedUsers

      // Get cleanup stats
      const cleanupStats = await EmailVerificationCleanupService.getCleanupStats()

      return {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        needsCleanup: cleanupStats.needsCleanup
      }
      
    } catch (error: any) {
      console.error('Error getting signup stats:', error)
      return {
        totalUsers: 0,
        verifiedUsers: 0,
        unverifiedUsers: 0,
        needsCleanup: 0
      }
    }
  }
}
