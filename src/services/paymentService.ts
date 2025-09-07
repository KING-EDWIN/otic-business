// Payment Service for handling payments and subscriptions
import { supabase } from '@/lib/supabase'
import { getCurrentUserInfo } from '@/utils/userUtils'

export interface PaymentRequest {
  id?: string
  user_id: string
  tier: 'basic' | 'standard' | 'premium'
  amount: number
  payment_method: string
  payment_proof_url?: string
  status: 'pending' | 'verified' | 'rejected'
  created_at?: string
  verified_at?: string
  verified_by?: string
  notes?: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'mobile_money' | 'bank_transfer'
  merchantCode?: string
  accountNumber?: string
  bankName?: string
  branch?: string
}

export class PaymentService {
  private tierPricing = {
    basic: 50000,
    standard: 150000,
    premium: 300000
  }

  private paymentMethods: PaymentMethod[] = [
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      merchantCode: '720504'
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      type: 'mobile_money',
      merchantCode: '4379529'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      accountNumber: '9030025213237',
      bankName: 'Stanbic Bank',
      branch: 'Garden City'
    }
  ]

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethods
  }

  async getTierPricing() {
    return this.tierPricing
  }

  async createPaymentRequest(
    tier: 'basic' | 'standard' | 'premium',
    paymentMethod: string,
    proofFile?: File
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        return { success: false, error: 'User not authenticated' }
      }

      const amount = this.tierPricing[tier]
      let proofUrl = ''

      // Upload proof file if provided
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `payment-proof-${userInfo.id}-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, proofFile)

        if (uploadError) {
          console.error('Error uploading proof:', uploadError)
          return { success: false, error: 'Failed to upload payment proof' }
        }

        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName)

        proofUrl = publicUrl
      }

      // Create payment request
      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: userInfo.id,
          tier,
          amount,
          payment_method: paymentMethod,
          payment_proof_url: proofUrl,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating payment request:', error)
        return { success: false, error: 'Failed to create payment request' }
      }

      return { success: true, paymentId: data.id }
    } catch (error) {
      console.error('Error in createPaymentRequest:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async getPaymentRequests(): Promise<PaymentRequest[]> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        return []
      }

      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', userInfo.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching payment requests:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getPaymentRequests:', error)
      return []
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentRequest | null> {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (error) {
        console.error('Error fetching payment status:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getPaymentStatus:', error)
      return null
    }
  }

  async getAllPaymentRequests(): Promise<PaymentRequest[]> {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          user_profiles!inner(email, business_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all payment requests:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllPaymentRequests:', error)
      return []
    }
  }

  async verifyPayment(
    paymentId: string,
    status: 'verified' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update payment request
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status,
          verified_at: new Date().toISOString(),
          verified_by: 'admin', // In production, use actual admin user ID
          notes
        })
        .eq('id', paymentId)

      if (updateError) {
        console.error('Error updating payment request:', updateError)
        return { success: false, error: 'Failed to update payment request' }
      }

      // If verified, update user's subscription
      if (status === 'verified') {
        const { data: payment, error: fetchError } = await supabase
          .from('payment_requests')
          .select('user_id, tier, amount, payment_method')
          .eq('id', paymentId)
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
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            payment_method: payment.payment_method,
            amount: payment.amount
          })

        if (subError) {
          console.error('Error creating subscription:', subError)
          return { success: false, error: 'Failed to create subscription' }
        }

        // Add to payment history
        const { error: historyError } = await supabase
          .from('payment_history')
          .insert({
            user_id: payment.user_id,
            payment_request_id: paymentId,
            tier: payment.tier,
            amount: payment.amount,
            payment_method: payment.payment_method,
            status: 'completed',
            processed_at: new Date().toISOString()
          })

        if (historyError) {
          console.error('Error adding to payment history:', historyError)
          // Don't fail the whole operation for this
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in verifyPayment:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async getPaymentHistory(): Promise<any[]> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        return []
      }

      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userInfo.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching payment history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getPaymentHistory:', error)
      return []
    }
  }
}

export const paymentService = new PaymentService()