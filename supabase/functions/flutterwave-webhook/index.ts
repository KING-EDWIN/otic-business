import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Flutterwave credentials from environment
    const flutterwaveSecretKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY')
    if (!flutterwaveSecretKey) {
      throw new Error('Flutterwave secret key not configured')
    }

    // Parse the webhook payload
    const payload = await req.json()
    console.log('Flutterwave webhook payload:', payload)

    // Verify the webhook signature (optional but recommended)
    const signature = req.headers.get('verif-hash')
    if (signature && !verifyWebhookSignature(payload, signature, flutterwaveSecretKey)) {
      console.error('Invalid webhook signature')
      return new Response('Invalid signature', { status: 401, headers: corsHeaders })
    }

    // Handle different webhook events
    const eventType = payload.event
    const data = payload.data

    switch (eventType) {
      case 'charge.completed':
        await handlePaymentCompleted(supabaseClient, data)
        break
      
      case 'charge.failed':
        await handlePaymentFailed(supabaseClient, data)
        break
      
      case 'transfer.completed':
        await handleTransferCompleted(supabaseClient, data)
        break
      
      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return new Response('Webhook processed successfully', { 
      status: 200, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

async function handlePaymentCompleted(supabaseClient: any, data: any) {
  try {
    console.log('Processing completed payment:', data)
    
    // Update payment transaction status
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update({
        status: 'successful',
        flutterwave_tx_id: data.id,
        flutterwave_reference: data.reference,
        updated_at: new Date().toISOString()
      })
      .eq('tx_ref', data.tx_ref)

    if (updateError) {
      console.error('Error updating payment transaction:', updateError)
      return
    }

    // Create payment record if it doesn't exist
    const { data: existingPayment, error: fetchError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('tx_ref', data.tx_ref)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // Payment doesn't exist, create it
      const { error: insertError } = await supabaseClient
        .from('payment_transactions')
        .insert([{
          tx_ref: data.tx_ref,
          amount: data.amount,
          currency: data.currency,
          status: 'successful',
          payment_method: data.payment_type || 'card',
          customer_email: data.customer?.email || '',
          customer_name: data.customer?.name || '',
          description: data.narration || 'Payment completed',
          flutterwave_tx_id: data.id,
          flutterwave_reference: data.reference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (insertError) {
        console.error('Error creating payment transaction:', insertError)
      }
    }

    // Update user tier if this is a subscription payment
    if (data.meta && data.meta.tier) {
      await updateUserTier(supabaseClient, data.customer?.email, data.meta.tier)
    }

    console.log('Payment completed successfully:', data.tx_ref)
  } catch (error) {
    console.error('Error handling payment completed:', error)
  }
}

async function handlePaymentFailed(supabaseClient: any, data: any) {
  try {
    console.log('Processing failed payment:', data)
    
    const { error } = await supabaseClient
      .from('payment_transactions')
      .update({
        status: 'failed',
        flutterwave_tx_id: data.id,
        flutterwave_reference: data.reference,
        updated_at: new Date().toISOString()
      })
      .eq('tx_ref', data.tx_ref)

    if (error) {
      console.error('Error updating failed payment:', error)
    }

    console.log('Payment failed processed:', data.tx_ref)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleTransferCompleted(supabaseClient: any, data: any) {
  try {
    console.log('Processing completed transfer:', data)
    // Handle transfer completion logic here
    // This could be for refunds or payouts
  } catch (error) {
    console.error('Error handling transfer completed:', error)
  }
}

async function updateUserTier(supabaseClient: any, email: string, tier: string) {
  try {
    const { error } = await supabaseClient
      .from('user_profiles')
      .update({ tier })
      .eq('email', email)

    if (error) {
      console.error('Error updating user tier:', error)
    } else {
      console.log(`Updated user tier to ${tier} for ${email}`)
    }
  } catch (error) {
    console.error('Error updating user tier:', error)
  }
}

function verifyWebhookSignature(payload: any, signature: string, secretKey: string): boolean {
  // Implement webhook signature verification
  // This is a simplified version - you should implement proper HMAC verification
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

