// Flutterwave Web SDK Service - Following OTIC Business Integration Plan
// This service implements the exact Flutterwave integration flow specified

import { getUrl } from './environmentService'

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
    transaction_id?: string
  }
}

export interface PaymentTransaction {
  id: string
  tx_ref: string
  transaction_id?: string
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

// Extend Window interface for Flutterwave
declare global {
  interface Window {
    FlutterwaveCheckout: any
  }
}

class FlutterwaveWebService {
  private publicKey: string

  constructor() {
    this.publicKey = this.getPublicKey()
    
    console.log('🔧 Flutterwave Web Service Initialized:')
    console.log('Public Key:', this.publicKey ? `${this.publicKey.substring(0, 20)}...` : 'MISSING')
    console.log('Environment check:', {
      'import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY': !!import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
      'process.env.VITE_FLUTTERWAVE_PUBLIC_KEY': !!process.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
      'window.location.hostname': window.location.hostname
    })
  }

  private getPublicKey(): string {
    // Try import.meta.env first (Vite)
    if (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY) {
      return import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY
    }
    
    // Try process.env (fallback)
    if (process.env.VITE_FLUTTERWAVE_PUBLIC_KEY) {
      return process.env.VITE_FLUTTERWAVE_PUBLIC_KEY
    }
    
    // Try to get from window (if injected)
    if ((window as any).VITE_FLUTTERWAVE_PUBLIC_KEY) {
      return (window as any).VITE_FLUTTERWAVE_PUBLIC_KEY
    }
    
    return ''
  }

  /**
   * Load Flutterwave SDK
   */
  private async loadFlutterwaveSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.FlutterwaveCheckout) {
        resolve()
        return
      }

      // Load Flutterwave SDK directly
      const flutterwaveScript = document.createElement('script')
      flutterwaveScript.src = 'https://checkout.flutterwave.com/v3.js'
      flutterwaveScript.onload = () => {
        console.log('✅ Flutterwave SDK loaded successfully')
        resolve()
      }
      flutterwaveScript.onerror = () => {
        console.error('❌ Failed to load Flutterwave SDK')
        reject(new Error('Failed to load Flutterwave SDK'))
      }
      document.head.appendChild(flutterwaveScript)
    })
  }

  /**
   * Initialize payment using Flutterwave Checkout Modal
   * Following the exact specification from the integration plan
   */
  async initializePayment(paymentData: FlutterwavePaymentData): Promise<FlutterwaveResponse> {
    try {
      // Validate API keys
      if (!this.publicKey) {
        throw new Error('Flutterwave public key not configured')
      }

      // Load Flutterwave SDK
      await this.loadFlutterwaveSDK()

      // Create payment configuration following the exact specification
      const flutterwaveConfig = {
        public_key: this.publicKey,
        tx_ref: paymentData.tx_ref,
        amount: this.formatAmount(paymentData.amount),
        currency: paymentData.currency,
        payment_options: "mobilemoneyuganda,card,ussd",
        customer: {
          email: paymentData.email,
          phonenumber: paymentData.phone_number || '',
          name: paymentData.name,
        },
        customizations: {
          title: "OTIC Business Payment",
          description: paymentData.description,
          logo: getUrl('/logo.png')
        },
        redirect_url: paymentData.redirect_url || getUrl('/payments/success'),
        meta: paymentData.meta || {}
      }

      console.log('🚀 Initializing Flutterwave payment:', flutterwaveConfig)

      // Use Flutterwave's web SDK following the exact specification
      return new Promise((resolve, reject) => {
        try {
          window.FlutterwaveCheckout({
            ...flutterwaveConfig,
            callback: (payment: any) => {
              console.log('💳 Flutterwave payment callback:', payment)
              
              if (payment.status === 'successful') {
                resolve({
                  status: 'success',
                  message: 'Payment successful',
                  data: {
                    link: payment.redirect_url,
                    reference: payment.tx_ref,
                    transaction_id: payment.transaction_id
                  }
                })
              } else {
                reject(new Error(payment.message || 'Payment failed'))
              }
            },
            onclose: () => {
              console.log('❌ Payment cancelled by user')
              reject(new Error('Payment cancelled by user'))
            }
          })
        } catch (error: any) {
          console.error('❌ Flutterwave checkout error:', error)
          reject(new Error(`Checkout initialization failed: ${error.message}`))
        }
      })

    } catch (error: any) {
      console.error('❌ Flutterwave payment error:', error)
      throw new Error(`Failed to initialize payment: ${error.message}`)
    }
  }

  /**
   * Generate transaction reference following OTIC Business format
   */
  generateTxRef(): string {
    return `OTIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Format amount for Flutterwave (amounts are already in correct currency units)
   */
  formatAmount(amount: number): number {
    return Math.round(amount)
  }

  /**
   * Verify payment status (this should be called from backend for security)
   */
  async verifyPayment(txRef: string): Promise<any> {
    try {
      // This should be called from backend for security
      const response = await fetch('/api/flutterwave/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx_ref: txRef })
      })

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Payment verification error:', error)
      throw new Error(`Failed to verify payment: ${error.message}`)
    }
  }
}

export const flutterwaveWebService = new FlutterwaveWebService()
export default flutterwaveWebService