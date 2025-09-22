// Flutterwave API Service - Backend Integration
// This service handles secure Flutterwave API calls from the backend

export interface FlutterwavePaymentRequest {
  tx_ref: string
  amount: number
  currency: string
  redirect_url: string
  payment_options: string
  customer: {
    email: string
    name: string
    phone_number?: string
  }
  customizations: {
    title: string
    description: string
    logo?: string
  }
  meta?: Record<string, any>
}

export interface FlutterwavePaymentResponse {
  status: string
  message: string
  data: {
    link: string
    reference: string
  }
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
    card: {
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
    created_at: string
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

class FlutterwaveApiService {
  private baseUrl = 'https://api.flutterwave.com/v3'
  private publicKey: string
  private secretKey: string

  constructor() {
    this.publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || ''
    this.secretKey = import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY || ''
    
    if (!this.publicKey || !this.secretKey) {
      console.warn('Flutterwave API keys not configured')
    }
  }

  // Initialize payment - this should be called from backend
  async initializePayment(paymentData: FlutterwavePaymentRequest): Promise<FlutterwavePaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Flutterwave API error: ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Flutterwave payment initialization error:', error)
      throw new Error(`Failed to initialize payment: ${error.message}`)
    }
  }

  // Verify payment - this should be called from backend
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

  // Generate transaction reference
  generateTxRef(): string {
    return `otic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Format amount for Flutterwave (multiply by 100 for cents)
  formatAmount(amount: number): number {
    return Math.round(amount * 100)
  }
}

export const flutterwaveApiService = new FlutterwaveApiService()

