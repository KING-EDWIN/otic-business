import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendOTPRequest {
  email: string
  otp: string
  expiresIn: number
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

    // Parse request body
    const { email, otp, expiresIn }: SendOTPRequest = await req.json()

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTIC Business - Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #040458, #faa51a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #040458; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 8px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Two-Factor Authentication</h1>
            <p>Your verification code for OTIC Business</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>You're signing in to your OTIC Business account. Use the verification code below to complete your login:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This code expires in ${expiresIn} minutes</li>
                <li>Never share this code with anyone</li>
                <li>OTIC Business will never ask for this code via email or phone</li>
              </ul>
            </div>
            
            <p>If you didn't request this code, please ignore this email or contact our support team.</p>
            
            <div class="footer">
              <p>This email was sent by OTIC Business</p>
              <p>© 2024 OTIC Business. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const emailText = `
OTIC Business - Two-Factor Authentication

Hello!

You're signing in to your OTIC Business account. Use the verification code below to complete your login:

Verification Code: ${otp}

Important:
- This code expires in ${expiresIn} minutes
- Never share this code with anyone
- OTIC Business will never ask for this code via email or phone

If you didn't request this code, please ignore this email or contact our support team.

This email was sent by OTIC Business
© 2024 OTIC Business. All rights reserved.
    `

    // Send email using Supabase's built-in email service
    const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: email,
        subject: 'OTIC Business - Your Verification Code',
        html: emailHtml,
        text: emailText,
        from: 'noreply@oticbusiness.com'
      }
    })

    if (emailError) {
      console.error('Email sending error:', emailError)
      
      // Fallback: Try using a custom SMTP service if configured
      const smtpConfig = {
        host: Deno.env.get('SMTP_HOST'),
        port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
        username: Deno.env.get('SMTP_USERNAME'),
        password: Deno.env.get('SMTP_PASSWORD'),
        from: Deno.env.get('SMTP_FROM') || 'noreply@oticbusiness.com'
      }

      if (smtpConfig.host && smtpConfig.username && smtpConfig.password) {
        try {
          // Use Deno's built-in SMTP capabilities or a third-party service
          const smtpResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: Deno.env.get('EMAILJS_SERVICE_ID'),
              template_id: Deno.env.get('EMAILJS_TEMPLATE_ID'),
              user_id: Deno.env.get('EMAILJS_USER_ID'),
              template_params: {
                to_email: email,
                otp_code: otp,
                expires_in: expiresIn
              }
            })
          })

          if (!smtpResponse.ok) {
            throw new Error('SMTP fallback failed')
          }
        } catch (smtpError) {
          console.error('SMTP fallback error:', smtpError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to send verification email',
              details: 'Please try again or contact support'
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
            error: 'Email service not configured',
            details: 'Please contact support'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Send OTP email error:', error)
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

