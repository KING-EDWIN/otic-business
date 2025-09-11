import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'admin'
  last_login_at?: string | null
  created_at?: string
}

export interface AdminLogEntry {
  id?: string
  admin_user_id: string
  action: string
  metadata?: Record<string, any>
  created_at?: string
}

export interface TierUpgradeRequest {
  id: string
  user_id: string
  tier: string
  amount: number
  payment_method: string
  payment_proof_url?: string
  status: 'pending' | 'verified' | 'rejected'
  created_at: string
  verified_at?: string
  verified_by?: string
  notes?: string
  user_profile: {
    email: string
    business_name?: string
    phone?: string
    tier: string
  }
}

export interface UserVerification {
  id: string
  email: string
  business_name?: string
  phone?: string
  tier: string
  email_verified: boolean
  verification_timestamp?: string
  verified_by?: string
  created_at: string
  verification_status: string
}

export class AdminService {
  async authenticateAdmin(email: string, password: string): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        return { success: false, error: 'Invalid credentials' }
      }

      const isValidPassword = await bcrypt.compare(password, data.password_hash)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Update last login
      await this.touchLastLogin(data.id)

      return { success: true, admin: data }
    } catch (error) {
      return { success: false, error: 'Authentication failed' }
    }
  }

  async touchLastLogin(adminId: string): Promise<void> {
    await supabase
      .from('admin_auth')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminId)
  }

  async logAction(adminId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: adminId,
        action,
        metadata: metadata || null
      })
  }

  async resendEmailConfirmation(email: string): Promise<{ error?: any }> {
    try {
      // For now, just log the action - implement actual email sending later
      console.log(`Email resend requested for: ${email}`)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Simple cache to avoid repeated queries
  private static tierUpgradeCache: { data: TierUpgradeRequest[], timestamp: number } | null = null
  private static CACHE_DURATION = 30000 // 30 seconds

  async getTierUpgradeRequests(): Promise<TierUpgradeRequest[]> {
    try {
      // Check cache first
      if (AdminService.tierUpgradeCache && 
          Date.now() - AdminService.tierUpgradeCache.timestamp < AdminService.CACHE_DURATION) {
        return AdminService.tierUpgradeCache.data
      }

      // Optimized query - only get essential fields
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          id,
          user_id,
          tier,
          amount,
          payment_method,
          status,
          created_at,
          verified_at
        `)
        .order('created_at', { ascending: false })
        .limit(20) // Reduced limit for faster loading

      if (error) {
        console.error('Error fetching tier upgrade requests:', error)
        return []
      }

      if (!data || data.length === 0) {
        AdminService.tierUpgradeCache = { data: [], timestamp: Date.now() }
        return []
      }

      // Get user profiles in parallel for better performance
      const userIds = [...new Set(data.map(req => req.user_id))]
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('id, email, business_name, phone, tier')
        .in('id', userIds)

      // Create a map for quick lookup
      const profileMap = new Map()
      userProfiles?.forEach(profile => {
        profileMap.set(profile.id, profile)
      })

      // Combine the data
      const result = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        tier: item.tier,
        amount: item.amount,
        payment_method: item.payment_method,
        payment_proof_url: '', // Simplified - not needed for admin list
        status: item.status,
        created_at: item.created_at,
        verified_at: item.verified_at,
        verified_by: null, // Simplified
        notes: null, // Simplified
        user_profile: {
          email: profileMap.get(item.user_id)?.email || '',
          business_name: profileMap.get(item.user_id)?.business_name || '',
          phone: profileMap.get(item.user_id)?.phone || '',
          tier: profileMap.get(item.user_id)?.tier || 'free_trial'
        }
      }))

      // Cache the result
      AdminService.tierUpgradeCache = { data: result, timestamp: Date.now() }
      return result
    } catch (error) {
      console.error('Error fetching tier upgrade requests:', error)
      return []
    }
  }

  // Clear cache when data is updated
  private static clearCache() {
    AdminService.tierUpgradeCache = null
  }

  async updateUserTier(requestId: string, newTier: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear cache before updating
      AdminService.clearCache()
      
      // First get the payment request details
      const { data: paymentRequest, error: fetchError } = await supabase
        .from('payment_requests')
        .select('user_id, tier, amount, payment_method')
        .eq('id', requestId)
        .single()

      if (fetchError || !paymentRequest) {
        return { success: false, error: 'Payment request not found' }
      }

      // Update user profile tier
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ tier: newTier })
        .eq('id', paymentRequest.user_id)

      if (profileError) {
        console.error('Error updating user profile:', profileError)
        return { success: false, error: 'Failed to update user profile' }
      }

      // Update or create subscription
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: paymentRequest.user_id,
          tier: newTier,
          status: 'active',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        })

      if (subError) {
        console.error('Error updating subscription:', subError)
        return { success: false, error: 'Failed to update subscription' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating user tier:', error)
      return { success: false, error: 'Failed to update user tier' }
    }
  }

  async verifyPaymentRequest(requestId: string, status: 'verified' | 'rejected'): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear cache before updating
      AdminService.clearCache()
      
      // Update payment request status
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status,
          verified_at: new Date().toISOString(),
          verified_by: '00000000-0000-0000-0000-000000000000', // Admin UUID placeholder
        })
        .eq('id', requestId)

      if (updateError) {
        console.error('Error updating payment request:', updateError)
        return { success: false, error: 'Failed to update payment request' }
      }

      // If verified, also update user's tier
      if (status === 'verified') {
        const { data: payment, error: fetchError } = await supabase
          .from('payment_requests')
          .select('user_id, tier, amount, payment_method')
          .eq('id', requestId)
          .single()

        if (fetchError) {
          console.error('Error fetching payment details:', fetchError)
          return { success: false, error: 'Failed to fetch payment details' }
        }

        // Update user profile tier
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ tier: payment.tier })
          .eq('id', payment.user_id)

        if (profileError) {
          console.error('Error updating user profile:', profileError)
          return { success: false, error: 'Failed to update user profile' }
        }

        // Create/update subscription
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: payment.user_id,
            tier: payment.tier,
            status: 'active',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
          })

        if (subError) {
          console.error('Error creating subscription:', subError)
          return { success: false, error: 'Failed to create subscription' }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error verifying payment request:', error)
      return { success: false, error: 'Failed to verify payment request' }
    }
  }

  async getUserVerificationStatus(): Promise<UserVerification[]> {
    try {
      const { data, error } = await supabase
        .from('user_verification_status')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user verification status:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user verification status:', error)
      return []
    }
  }

  async verifyUserEmail(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update our database
      const { error: dbError } = await supabase
        .from('user_profiles')
        .update({
          email_verified: true,
          verification_timestamp: new Date().toISOString(),
          verified_by: '00000000-0000-0000-0000-000000000000' // Admin UUID placeholder
        })
        .eq('id', userId)

      if (dbError) {
        console.error('Error verifying user email in database:', dbError)
        return { success: false, error: dbError.message }
      }

      // Also try to confirm the user in Supabase auth (this might fail if they haven't clicked email link)
      try {
        const { data: userData } = await supabase.auth.admin.updateUserById(userId, {
          email_confirm: true
        })
        console.log('User confirmed in Supabase auth:', userData)
      } catch (authError) {
        console.log('Could not confirm in Supabase auth (user needs to click email link):', authError)
        // This is not a critical error - our database verification is enough
      }

      return { success: true }
    } catch (error) {
      console.error('Error verifying user email:', error)
      return { success: false, error: 'Failed to verify email' }
    }
  }

  async unverifyUserEmail(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email_verified: false,
          verification_timestamp: null,
          verified_by: null
        })
        .eq('id', userId)

      if (error) {
        console.error('Error unverifying user email:', error)
        return { success: false, error: 'Failed to remove verification' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error unverifying user email:', error)
      return { success: false, error: 'Failed to remove verification' }
    }
  }

  async getUnverifiedUsers(): Promise<UserVerification[]> {
    try {
      const { data, error } = await supabase
        .from('unverified_users')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching unverified users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching unverified users:', error)
      return []
    }
  }

  // Call secure API route to verify/unverify a user
  async setUserVerification(userId: string, verified: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': import.meta.env.VITE_ADMIN_API_SECRET || '',
        },
        body: JSON.stringify({ userId, verified })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return { success: false, error: data?.error || 'Request failed' }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }
}

export const adminService = new AdminService()


