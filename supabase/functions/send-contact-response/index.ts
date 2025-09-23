import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { toEmail, toName, subject, message, originalMessage } = await req.json()

    // Validate required fields
    if (!toEmail || !toName || !subject || !message) {
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
    const emailSubject = `Re: ${subject}`
    const emailContent = `
      <h2>Response from OTIC Business Support</h2>
      <p>Hello ${toName},</p>
      
      <p>Thank you for contacting us. Here's our response to your inquiry:</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Your Original Message:</h3>
        <p style="white-space: pre-wrap;">${originalMessage}</p>
      </div>
      
      <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #040458;">
        <h3>Our Response:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      
      <p>If you have any further questions, please don't hesitate to contact us again.</p>
      
      <hr>
      <p><em>Best regards,<br>OTIC Business Support Team</em></p>
      <p><small>This is an automated response from the OTIC Business support system.</small></p>
    `

    // Send email using Resend API if configured
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
            from: 'OTIC Business Support <info@oticbusiness.com>',
            to: [toEmail],
            subject: emailSubject,
            html: emailContent,
          }),
        })

        if (!resendResponse.ok) {
          throw new Error('Resend API failed')
        }

        console.log(`Contact response sent to ${toEmail} via Resend API`)
      } catch (resendError) {
        console.error('Resend API error:', resendError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send response email',
            details: 'Email service not available'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      // Log the response for manual sending if Resend is not configured
      console.log('📧 Contact Response (Resend not configured):')
      console.log('To:', toEmail)
      console.log('Subject:', emailSubject)
      console.log('Content:', emailContent)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact response sent successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Contact response error:', error)
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
