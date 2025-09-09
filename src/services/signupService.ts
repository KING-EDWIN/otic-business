import { supabase } from '@/lib/supabaseClient'
import { isOfflineMode } from '@/config/storageConfig'

export interface SignupData {
  email: string
  password: string
  businessName: string
  phone?: string
  address?: string
}

export interface SignupResult {
  success: boolean
  error?: string
  user?: any
  profile?: any
}

export class SignupService {
  private static isOffline = isOfflineMode()

  /**
   * Complete signup process that creates user in all necessary tables
   */
  static async completeSignup(data: SignupData): Promise<SignupResult> {
    if (this.isOffline) {
      return this.offlineSignup(data)
    } else {
      return this.onlineSignup(data)
    }
  }

  /**
   * Offline signup for development/testing
   */
  private static async offlineSignup(data: SignupData): Promise<SignupResult> {
    try {
      const userId = 'offline-user-' + Date.now()
      const now = new Date().toISOString()

      const user = {
        id: userId,
        email: data.email,
        email_confirmed_at: now,
        created_at: now
      }

      const profile = {
        id: userId,
        email: data.email,
        full_name: data.businessName, // Use business name as full name for now
        business_name: data.businessName,
        phone: data.phone || '',
        address: data.address || '',
        tier: 'basic' as const,
        user_type: 'business' as const, // Default to business type
        email_verified: true,
        created_at: now,
        updated_at: now
      }

      const subscription = {
        id: 'sub-' + Date.now(),
        user_id: userId,
        tier: 'basic' as const,
        status: 'active' as const,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: now
      }

      // Save to localStorage
      localStorage.setItem('otic_user', JSON.stringify(user))
      localStorage.setItem('otic_profile', JSON.stringify(profile))
      localStorage.setItem('otic_subscription', JSON.stringify(subscription))

      console.log('Offline signup completed:', { user, profile, subscription })

      return {
        success: true,
        user,
        profile
      }
    } catch (error) {
      console.error('Offline signup error:', error)
      return {
        success: false,
        error: 'Failed to create offline user'
      }
    }
  }

  /**
   * Online signup with Supabase
   */
  private static async onlineSignup(data: SignupData): Promise<SignupResult> {
    try {
      console.log('Starting online signup for:', data.email)

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            business_name: data.businessName,
            phone: data.phone,
            address: data.address
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

      console.log('Auth user created:', authData.user.id)

      // Step 2: Create user profile
      const profileData = {
        id: authData.user.id,
        email: data.email,
        full_name: data.businessName, // Use business name as full name for now
        business_name: data.businessName,
        phone: data.phone || '',
        address: data.address || '',
        tier: 'basic' as const,
        user_type: 'business' as const, // Default to business type
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData)

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Try to clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return {
          success: false,
          error: `Profile creation failed: ${profileError.message}`
        }
      }

      console.log('User profile created successfully')

      // Step 3: Create subscription
      const subscriptionData = {
        id: crypto.randomUUID(),
        user_id: authData.user.id,
        tier: 'basic' as const,
        status: 'active' as const,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      }

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)

      if (subscriptionError) {
        console.error('Subscription creation error:', subscriptionError)
        // Don't fail the signup for subscription errors
      } else {
        console.log('Subscription created successfully')
      }

      // Step 4: Create initial payment request (optional)
      const paymentRequestData = {
        id: crypto.randomUUID(),
        user_id: authData.user.id,
        amount: 0.00,
        currency: 'USD',
        status: 'pending' as const,
        description: 'Initial account setup',
        created_at: new Date().toISOString()
      }

      const { error: paymentError } = await supabase
        .from('payment_requests')
        .insert(paymentRequestData)

      if (paymentError) {
        console.error('Payment request creation error:', paymentError)
        // Don't fail the signup for payment request errors
      } else {
        console.log('Payment request created successfully')
      }

      console.log('Complete signup successful for:', data.email)

      return {
        success: true,
        user: authData.user,
        profile: profileData
      }

    } catch (error) {
      console.error('Signup service error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during signup'
      }
    }
  }

  /**
   * Verify that all necessary tables have records for a user
   */
  static async verifyUserSetup(userId: string): Promise<{
    hasProfile: boolean
    hasSubscription: boolean
    hasPaymentRequest: boolean
    missing: string[]
  }> {
    if (this.isOffline) {
      return {
        hasProfile: !!localStorage.getItem('otic_profile'),
        hasSubscription: !!localStorage.getItem('otic_subscription'),
        hasPaymentRequest: true, // Assume true for offline
        missing: []
      }
    }

    try {
      const [profileResult, subscriptionResult, paymentResult] = await Promise.all([
        supabase.from('user_profiles').select('id').eq('id', userId).single(),
        supabase.from('subscriptions').select('id').eq('user_id', userId).single(),
        supabase.from('payment_requests').select('id').eq('user_id', userId).single()
      ])

      const missing = []
      if (profileResult.error) missing.push('profile')
      if (subscriptionResult.error) missing.push('subscription')
      if (paymentResult.error) missing.push('payment_request')

      return {
        hasProfile: !profileResult.error,
        hasSubscription: !subscriptionResult.error,
        hasPaymentRequest: !paymentResult.error,
        missing
      }
    } catch (error) {
      console.error('Error verifying user setup:', error)
      return {
        hasProfile: false,
        hasSubscription: false,
        hasPaymentRequest: false,
        missing: ['profile', 'subscription', 'payment_request']
      }
    }
  }

  /**
   * Complete missing user setup
   */
  static async completeMissingSetup(userId: string, userData: any): Promise<SignupResult> {
    try {
      const verification = await this.verifyUserSetup(userId)
      
      if (verification.missing.length === 0) {
        return { success: true }
      }

      console.log('Completing missing setup for user:', userId, 'Missing:', verification.missing)

      const now = new Date().toISOString()

      // Create missing profile
      if (verification.missing.includes('profile')) {
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: userData.email,
            full_name: userData.business_name || 'New Business',
            business_name: userData.business_name || 'New Business',
            tier: 'basic',
            user_type: 'business',
            email_verified: false,
            created_at: now,
            updated_at: now
          })

        if (error) {
          console.error('Error creating missing profile:', error)
        }
      }

      // Create missing subscription
      if (verification.missing.includes('subscription')) {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            tier: 'basic',
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: now
          })

        if (error) {
          console.error('Error creating missing subscription:', error)
        }
      }

      // Create missing payment request
      if (verification.missing.includes('payment_request')) {
        const { error } = await supabase
          .from('payment_requests')
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            amount: 0.00,
            currency: 'USD',
            status: 'pending',
            description: 'Initial account setup',
            created_at: now
          })

        if (error) {
          console.error('Error creating missing payment request:', error)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error completing missing setup:', error)
      return {
        success: false,
        error: 'Failed to complete user setup'
      }
    }
  }
}

export default SignupService
