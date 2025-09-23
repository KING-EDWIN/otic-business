import { supabase } from '@/lib/supabaseClient'

export interface FlutterwavePaymentData {
  amount: number
  currency: string
  email: string
  phone_number?: string
  name: string
  tx_ref: string
  description: string
  redirect_url?: string
  meta?: Record<string, any>
}

export interface FlutterwaveResponse {
  status: string
  message: string
  data?: {
    link: string
    reference: string
  }
}

export interface PaymentTransaction {
  id: string
  tx_ref: string
  amount: number
  currency: string
  status: 'pending' | 'successful' | 'failed' | 'cancelled'
  payment_method: string
  customer_email: string
  customer_name: string
  description: string
  created_at: string
  updated_at: string
  business_id?: string
  user_id: string
  flutterwave_tx_id?: string
  flutterwave_reference?: string
}

class FlutterwaveService {
  private baseUrl = 'https://api.flutterwave.com/v3'
  private publicKey: string
  private secretKey: string
  private encryptionKey: string
  private merchantId: string

  constructor() {
    // These will be set from environment variables
    this.publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || ''
    this.secretKey = import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY || ''
    this.encryptionKey = import.meta.env.VITE_FLUTTERWAVE_ENCRYPTION_KEY || ''
    this.merchantId = import.meta.env.VITE_FLUTTERWAVE_MERCHANT_ID || ''
    
    // Debug logging
    console.log('🔧 Flutterwave Service Initialized:')
    console.log('Public Key:', this.publicKey ? `${this.publicKey.substring(0, 20)}...` : 'MISSING')
    console.log('Secret Key:', this.secretKey ? `${this.secretKey.substring(0, 20)}...` : 'MISSING')
    console.log('Encryption Key:', this.encryptionKey ? `${this.encryptionKey.substring(0, 10)}...` : 'MISSING')
    console.log('Merchant ID:', this.merchantId || 'MISSING')
  }

  /**
   * Initialize payment with Flutterwave
   */
  async initializePayment(paymentData: FlutterwavePaymentData): Promise<FlutterwaveResponse> {
    try {
      // Validate API keys
      if (!this.publicKey || !this.secretKey) {
        throw new Error('Flutterwave API keys not configured. Please check your environment variables.')
      }

      const payload = {
        tx_ref: paymentData.tx_ref,
        amount: paymentData.amount,
        currency: paymentData.currency,
        redirect_url: paymentData.redirect_url || `${window.location.origin}/payments/success`,
        customer: {
          email: paymentData.email,
          phonenumber: paymentData.phone_number || '',
          name: paymentData.name
        },
        customizations: {
          title: 'Otic Business Payment',
          description: paymentData.description,
          logo: `${window.location.origin}/logo.png`
        },
        meta: paymentData.meta || {},
        // Enable mobile money for Uganda
        payment_options: 'card,mobilemoneyuganda,ussd',
        // Set default payment method to mobile money if phone number provided
        ...(paymentData.phone_number && {
          payment_plan: 'mobilemoneyuganda'
        })
      }

      console.log('Flutterwave payload:', payload)
      console.log('Using secret key:', this.secretKey ? 'Present' : 'Missing')

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      console.log('Flutterwave response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Flutterwave API error:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Flutterwave result:', result)
      
      if (result.status === 'success') {
        return {
          status: 'success',
          message: 'Payment initialized successfully',
          data: {
            link: result.data.link,
            reference: result.data.tx_ref
          }
        }
      } else {
        throw new Error(result.message || 'Failed to initialize payment')
      }
    } catch (error) {
      console.error('Flutterwave payment initialization error:', error)
      throw new Error(`Failed to initialize payment: ${error.message}`)
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Flutterwave payment verification error:', error)
      throw new Error('Failed to verify payment')
    }
  }

  /**
   * Save payment transaction to database
   */
  async saveTransaction(transaction: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentTransaction> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert([{
          ...transaction,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving payment transaction:', error)
      throw new Error('Failed to save payment transaction')
    }
  }

  /**
   * Update payment transaction status
   */
  async updateTransactionStatus(txRef: string, status: PaymentTransaction['status'], flutterwaveData?: any): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (flutterwaveData) {
        updateData.flutterwave_tx_id = flutterwaveData.id
        updateData.flutterwave_reference = flutterwaveData.reference
      }

      const { error } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('tx_ref', txRef)

      if (error) throw error
    } catch (error) {
      console.error('Error updating payment transaction:', error)
      throw new Error('Failed to update payment transaction')
    }
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(userId: string, businessId?: string): Promise<PaymentTransaction[]> {
    try {
      let query = supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching payment history:', error)
      throw new Error('Failed to fetch payment history')
    }
  }

  /**
   * Generate unique transaction reference
   */
  generateTxRef(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `otic_${timestamp}_${random}`
  }

  /**
   * Format amount for Flutterwave (multiply by 100 for kobo/cent)
   */
  formatAmount(amount: number): number {
    return Math.round(amount * 100)
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return ['UGX', 'KES', 'TZS', 'USD', 'EUR', 'GBP']
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return [
      'card',
      'mobilemoney',
      'banktransfer',
      'ussd',
      'qr',
      'mpesa',
      'mobilemoneyuganda',
      'mobilemoneyghana',
      'mobilemoneyzambia',
      'mobilemoneyrwanda'
    ]
  }
}

export const flutterwaveService = new FlutterwaveService()
