import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { NetworkErrorHandler } from './networkErrorHandler'

export interface GoogleAuthResult {
  success: boolean
  isNewUser: boolean
  user?: any
  profile?: any
  error?: string
  requiresProfileSetup?: boolean
}

export interface GoogleAuthOptions {
  userType?: 'business' | 'individual'
  redirectTo?: string
  showToast?: boolean
}

export class GoogleAuthService {
  /**
   * Initiates Google OAuth flow with intelligent handling
   */
  static async initiateGoogleAuth(options: GoogleAuthOptions = {}): Promise<GoogleAuthResult> {
    try {
      const { userType = 'business', redirectTo, showToast = true } = options

      // Store the intended user type in session storage for callback handling
      if (userType) {
        sessionStorage.setItem('pending_google_user_type', userType)
      }

      // Store the current page context for better UX
      sessionStorage.setItem('google_auth_context', JSON.stringify({
        timestamp: Date.now(),
        userType,
        source: window.location.pathname
      }))

      const { data, error } = await NetworkErrorHandler.withRetry(async () => {
        const result = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo || `${window.location.origin}/auth/google-callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        })

        if (result.error) {
          throw result.error
        }

        return result
      })

      if (error) {
        console.error('Google OAuth initiation error:', error)
        const errorInfo = NetworkErrorHandler.handleAuthError(error)
        if (showToast) {
          toast.error(errorInfo.userMessage)
        }
        return {
          success: false,
          isNewUser: false,
          error: errorInfo.userMessage
        }
      }

      return {
        success: true,
        isNewUser: false // Will be determined in callback
      }
    } catch (error) {
      console.error('Google auth initiation error:', error)
      if (options.showToast) {
        toast.error('An unexpected error occurred. Please try again.')
      }
      return {
        success: false,
        isNewUser: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  /**
   * Handles Google OAuth callback and determines if user is new or existing
   */
  static async handleGoogleCallback(): Promise<GoogleAuthResult> {
    try {
      // Get the stored context
      const contextStr = sessionStorage.getItem('google_auth_context')
      const context = contextStr ? JSON.parse(contextStr) : null
      const pendingUserType = sessionStorage.getItem('pending_google_user_type') as 'business' | 'individual' | null

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        return {
          success: false,
          isNewUser: false,
          error: 'Failed to establish session'
        }
      }

      if (!session?.user) {
        return {
          success: false,
          isNewUser: false,
          error: 'No user session found'
        }
      }

      const user = session.user
      const userEmail = user.email

      if (!userEmail) {
        return {
          success: false,
          isNewUser: false,
          error: 'No email found in Google account'
        }
      }

      // Check if user exists in our system
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userEmail)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Profile check error:', profileError)
        return {
          success: false,
          isNewUser: false,
          error: 'Failed to check user status'
        }
      }

      const isNewUser = !existingProfile

      if (isNewUser) {
        // New user - create profile
        const profileData = {
          id: user.id,
          email: userEmail,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          business_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || null,
          user_type: pendingUserType || 'business',
          tier: 'free_trial' as const,
          email_verified: user.email_confirmed_at ? true : false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single()

        if (createError) {
          console.error('Profile creation error:', createError)
          return {
            success: false,
            isNewUser: true,
            error: 'Failed to create user profile'
          }
        }

        // Clean up session storage
        sessionStorage.removeItem('google_auth_context')
        sessionStorage.removeItem('pending_google_user_type')

        return {
          success: true,
          isNewUser: true,
          user,
          profile: newProfile,
          requiresProfileSetup: true
        }
      } else {
        // Existing user - update last login
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            updated_at: new Date().toISOString(),
            email_verified: user.email_confirmed_at ? true : existingProfile.email_verified
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Profile update error:', updateError)
        }

        // Clean up session storage
        sessionStorage.removeItem('google_auth_context')
        sessionStorage.removeItem('pending_google_user_type')

        return {
          success: true,
          isNewUser: false,
          user,
          profile: existingProfile
        }
      }
    } catch (error) {
      console.error('Google callback handling error:', error)
      return {
        success: false,
        isNewUser: false,
        error: 'An unexpected error occurred during authentication'
      }
    }
  }

  /**
   * Checks if a Google account exists in our system
   */
  static async checkGoogleAccountExists(email: string): Promise<{ exists: boolean; profile?: any }> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Account check error:', error)
        return { exists: false }
      }

      return {
        exists: !!profile,
        profile: profile || undefined
      }
    } catch (error) {
      console.error('Account existence check error:', error)
      return { exists: false }
    }
  }

  /**
   * Gets user-friendly error messages for different scenarios
   */
  static getErrorMessage(error: string, context?: any): string {
    const errorLower = error.toLowerCase()

    if (errorLower.includes('popup') || errorLower.includes('blocked')) {
      return 'Please allow popups for this site to complete Google sign-in.'
    }

    if (errorLower.includes('network') || errorLower.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.'
    }

    if (errorLower.includes('cancelled') || errorLower.includes('denied')) {
      return 'Google sign-in was cancelled. Please try again if you want to continue.'
    }

    if (errorLower.includes('invalid') || errorLower.includes('malformed')) {
      return 'Invalid Google account. Please use a valid Google account.'
    }

    if (errorLower.includes('quota') || errorLower.includes('limit')) {
      return 'Too many requests. Please wait a moment and try again.'
    }

    return 'An error occurred during Google sign-in. Please try again.'
  }

  /**
   * Shows appropriate toast messages based on the result
   */
  static showAuthResultToast(result: GoogleAuthResult, context?: any): void {
    if (!result.success) {
      const message = this.getErrorMessage(result.error || 'Unknown error', context)
      toast.error(message)
      return
    }

    if (result.isNewUser) {
      toast.success('Welcome! Your account has been created successfully.')
    } else {
      toast.success('Welcome back! You\'ve been signed in successfully.')
    }
  }
}
