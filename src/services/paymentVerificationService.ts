// Payment Verification Service
// Handles Flutterwave payment verification following the OTIC Business integration plan

import { supabase } from '@/lib/supabaseClient'
import { flutterwaveBackendService } from './flutterwaveBackendService'

export interface PaymentVerificationRequest {
  transaction_id: string
  tx_ref?: string
}

export interface PaymentVerificationResponse {
  success: boolean
  message: string
  data?: {
    tx_ref: string
    transaction_id: string
    amount: number
    currency: string
    customer_email: string
    customer_name: string
    status: string
  }
}

export interface OrderData {
  id?: string
  tx_ref: string
  transaction_id?: string
  amount: number
  currency: string
  payment_status: 'pending' | 'paid' | 'failed'
  customer_name: string
  customer_email: string
  customer_phone?: string
  user_id: string
  tier?: 'basic' | 'standard' | 'premium'
  description?: string
  flutterwave_tx_id?: string
  flutterwave_reference?: string
}

class PaymentVerificationService {
  /**
   * Verify payment with Flutterwave and update order status
   * Following the exact backend verification flow from the integration plan
   */
  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      console.log('🔍 Verifying payment:', request)

      // Verify with Flutterwave API
      const flutterwaveResponse = await flutterwaveBackendService.verifyPayment(request.transaction_id)

      if (flutterwaveResponse.status === 'success') {
        const paymentData = flutterwaveResponse.data
        
        // Update order in database with "paid" status
        const orderUpdate = await this.updateOrderStatus({
          tx_ref: paymentData.tx_ref,
          transaction_id: paymentData.id.toString(),
          amount: paymentData.amount / 100, // Convert from cents
          currency: paymentData.currency,
          customer_email: paymentData.customer.email,
          customer_name: paymentData.customer.name,
          status: 'paid',
          flutterwave_tx_id: paymentData.id.toString(),
          flutterwave_reference: paymentData.flw_ref
        })

        if (orderUpdate.success) {
          return {
            success: true,
            message: 'Payment successful',
            data: {
              tx_ref: paymentData.tx_ref,
              transaction_id: paymentData.id.toString(),
              amount: paymentData.amount / 100,
              currency: paymentData.currency,
              customer_email: paymentData.customer.email,
              customer_name: paymentData.customer.name,
              status: 'paid'
            }
          }
        } else {
          return {
            success: false,
            message: 'Payment verified but failed to update order status'
          }
        }
      } else {
        // Payment failed
        await this.updateOrderStatus({
          tx_ref: request.tx_ref || '',
          transaction_id: request.transaction_id,
          status: 'failed'
        })

        return {
          success: false,
          message: 'Payment verification failed'
        }
      }
    } catch (error: any) {
      console.error('❌ Payment verification error:', error)
      
      // Update order status to failed
      if (request.tx_ref) {
        await this.updateOrderStatus({
          tx_ref: request.tx_ref,
          transaction_id: request.transaction_id,
          status: 'failed'
        })
      }

      return {
        success: false,
        message: `Server error: ${error.message}`
      }
    }
  }

  /**
   * Update order status in database using the existing orders table structure
   */
  private async updateOrderStatus(orderData: Partial<OrderData>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (orderData.transaction_id) updateData.transaction_id = orderData.transaction_id
      if (orderData.amount) updateData.total_amount = orderData.amount // Use total_amount for existing orders table
      if (orderData.currency) updateData.currency = orderData.currency
      if (orderData.customer_email) updateData.customer_email = orderData.customer_email
      if (orderData.customer_name) updateData.customer_name = orderData.customer_name
      if (orderData.status) updateData.payment_status = orderData.status
      if (orderData.flutterwave_tx_id) updateData.flutterwave_tx_id = orderData.flutterwave_tx_id
      if (orderData.flutterwave_reference) updateData.flutterwave_reference = orderData.flutterwave_reference

      // Also update the main status field
      if (orderData.status === 'paid') {
        updateData.status = 'completed'
      } else if (orderData.status === 'failed') {
        updateData.status = 'cancelled'
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('tx_ref', orderData.tx_ref)

      if (error) {
        console.error('❌ Error updating order:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Order status updated successfully')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Error updating order status:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Create new order in database using existing orders table structure
   */
  async createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // First, try to get the first business for the user
      let { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('created_by', orderData.user_id)
        .limit(1)

      // If no business found, try to get business through business_memberships
      if (!businesses || businesses.length === 0) {
        console.log('🔍 No business found via created_by, checking business_memberships...')
        
        const { data: memberships, error: membershipError } = await supabase
          .from('business_memberships')
          .select('business_id')
          .eq('user_id', orderData.user_id)
          .eq('status', 'active')
          .limit(1)

        if (memberships && memberships.length > 0) {
          businesses = [{ id: memberships[0].business_id }]
          console.log('✅ Found business via membership:', businesses[0].id)
        }
      }

      // If still no business found, create a default business
      if (!businesses || businesses.length === 0) {
        console.log('🔧 No business found, creating default business...')
        
        // Get user profile for default business data
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('business_name, email, phone, address')
          .eq('id', orderData.user_id)
          .single()

        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError)
          return { success: false, error: 'Failed to fetch user profile for business creation' }
        }

        // Create default business
        const defaultBusinessData = {
          name: profile.business_name || 'My Business',
          description: 'Your main business account',
          business_type: 'retail',
          industry: 'general',
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          city: 'Kampala',
          country: 'Uganda',
          created_by: orderData.user_id
        }

        const { data: newBusiness, error: createBusinessError } = await supabase
          .from('businesses')
          .insert(defaultBusinessData)
          .select('id')
          .single()

        if (createBusinessError) {
          console.error('❌ Error creating default business:', createBusinessError)
          return { success: false, error: 'Failed to create default business' }
        }

        // Create business membership
        const { error: membershipError } = await supabase
          .from('business_memberships')
          .insert({
            user_id: orderData.user_id,
            business_id: newBusiness.id,
            role: 'owner',
            status: 'active',
            joined_at: new Date().toISOString()
          })

        if (membershipError) {
          console.error('❌ Error creating business membership:', membershipError)
          // Don't fail the entire operation, just log the error
        }

        businesses = [{ id: newBusiness.id }]
        console.log('✅ Default business created:', newBusiness.id)
      }

      console.log('📝 Creating order with business_id:', businesses[0].id)
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          business_id: businesses[0].id,
          customer_id: null, // No customer_id for Flutterwave orders
          order_number: orderData.tx_ref, // Use tx_ref as order_number
          status: 'pending', // Use existing status field
          total_amount: orderData.amount, // Use total_amount for existing orders table
          tax_amount: 0,
          discount_amount: 0,
          notes: orderData.description,
          tx_ref: orderData.tx_ref,
          transaction_id: orderData.transaction_id,
          currency: orderData.currency,
          payment_status: orderData.payment_status,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          tier: orderData.tier,
          description: orderData.description,
          flutterwave_tx_id: orderData.flutterwave_tx_id,
          flutterwave_reference: orderData.flutterwave_reference,
          payment_method: 'flutterwave',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single()

      if (error) {
        console.error('❌ Error creating order:', error)
        console.error('❌ Order data:', {
          business_id: businesses[0].id,
          tx_ref: orderData.tx_ref,
          amount: orderData.amount,
          customer_email: orderData.customer_email
        })
        return { success: false, error: error.message }
      }

      console.log('✅ Order created successfully:', data.id)
      return { success: true, orderId: data.id }
    } catch (error: any) {
      console.error('❌ Error creating order:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get order by transaction reference using existing orders table structure
   */
  async getOrderByTxRef(txRef: string): Promise<{ success: boolean; order?: OrderData; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tx_ref', txRef)
        .single()

      if (error) {
        console.error('❌ Error fetching order:', error)
        return { success: false, error: error.message }
      }

      // Map the existing orders table structure to OrderData interface
      const orderData: OrderData = {
        id: data.id,
        tx_ref: data.tx_ref,
        transaction_id: data.transaction_id,
        amount: data.total_amount, // Map total_amount to amount
        currency: data.currency,
        payment_status: data.payment_status,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        user_id: data.business_id, // Use business_id as user_id for now
        tier: data.tier,
        description: data.description,
        flutterwave_tx_id: data.flutterwave_tx_id,
        flutterwave_reference: data.flutterwave_reference,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      return { success: true, order: orderData }
    } catch (error: any) {
      console.error('❌ Error fetching order:', error)
      return { success: false, error: error.message }
    }
  }
}

export const paymentVerificationService = new PaymentVerificationService()
