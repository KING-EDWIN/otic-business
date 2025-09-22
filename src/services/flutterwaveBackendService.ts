// Flutterwave Backend Service - Server-side verification
// This service handles secure Flutterwave API calls from the backend

export interface FlutterwaveVerifyRequest {
  transaction_id: string
}

export interface FlutterwaveVerifyResponse {
  status: string
  message: string
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    device_fingerprint: string
    amount: number
    currency: string
    charged_amount: number
    app_fee: number
    merchant_fee: number
    processor_response: string
    auth_model: string
    card?: {
      first_6digits: string
      last_4digits: string
      issuer: string
      country: string
      type: string
      token: string
      expiry: string
    }
    created_at: string
    status: string
    payment_type: string
    account_id: number
    customer: {
      id: number
      phone_number: string
      name: string
      email: string
      created_at: string
    }
  }
}

export interface PaymentOrder {
  id?: string
  tx_ref: string
  transaction_id?: string
  amount: number
  currency: string
  payment_status: 'pending' | 'paid' | 'failed'
  customer_name: string
  customer_email: string
  customer_phone?: string
  created_at?: string
  updated_at?: string
  user_id: string
  tier?: 'basic' | 'standard' | 'premium'
  description?: string
}

class FlutterwaveBackendService {
  private baseUrl = 'https://api.flutterwave.com/v3'
  private secretKey: string

  constructor() {
    this.secretKey = import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY || ''
    
    if (!this.secretKey) {
      console.warn('Flutterwave Secret Key not configured')
    }
  }

  /**
   * Verify payment transaction with Flutterwave API
   */
  async verifyPayment(transactionId: string): Promise<FlutterwaveVerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Flutterwave verification error: ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Flutterwave payment verification error:', error)
      throw new Error(`Failed to verify payment: ${error.message}`)
    }
  }

  /**
   * Verify payment by transaction reference
   */
  async verifyPaymentByReference(txRef: string): Promise<FlutterwaveVerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/verify_by_reference?tx_ref=${txRef}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Flutterwave verification error: ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Flutterwave payment verification error:', error)
      throw new Error(`Failed to verify payment: ${error.message}`)
    }
  }

  /**
   * Generate transaction reference
   */
  generateTxRef(): string {
    return `OTIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Format amount for Flutterwave (multiply by 100 for cents)
   */
  formatAmount(amount: number): number {
    return Math.round(amount * 100)
  }
}

export const flutterwaveBackendService = new FlutterwaveBackendService()

