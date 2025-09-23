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

    const { contactId, name, email, subject, message, userId } = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get admin email (you can configure this)
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'info@oticbusiness.com'
    
    // Create email content
    const emailSubject = `New Contact Message: ${subject}`
    const emailContent = `
      <h2>New Contact Message Received</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message ID:</strong> ${contactId}</p>
      ${userId ? `<p><strong>User ID:</strong> ${userId}</p>` : ''}
      
      <h3>Message:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This message was sent from the OTIC Business contact form.</em></p>
    `

    // Send email using Supabase's built-in email service
    const { error: emailError } = await supabaseClient.auth.admin.generateLink({
      type: 'signup',
      email: adminEmail,
      options: {
        data: {
          email_subject: emailSubject,
          email_content: emailContent,
          contact_id: contactId,
          sender_name: name,
          sender_email: email
        }
      }
    })

    if (emailError) {
      console.error('Email sending error:', emailError)
      
      // Fallback: Try using Resend API if configured
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      if (resendApiKey) {
        try {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'noreply@oticbusiness.com',
              to: [adminEmail],
              subject: emailSubject,
              html: emailContent,
            }),
          })

          if (!resendResponse.ok) {
            throw new Error('Resend API failed')
          }

          console.log('Email sent via Resend API')
        } catch (resendError) {
          console.error('Resend API error:', resendError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to send notification email',
              details: 'Please try again or contact support directly'
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send notification email',
            details: 'Email service not configured'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Log the notification attempt
    console.log(`Contact notification sent for message ${contactId} from ${name} (${email})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact notification sent successfully',
        contactId: contactId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Contact notification error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
