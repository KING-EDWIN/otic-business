// QuickBooks Reconnection Script
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

const supabase = createClient(supabaseUrl, supabaseKey)

const CLIENT_ID = 'ABGW5r0sdJAUxXPeIZOabf6Q0uOh7ZFQeHRpAveNPkCuwsNkZH'
const CLIENT_SECRET = 'KAvxhN2XfjV04Qv03llNuolTvOv6SUuBR3KLC8Za'
const REDIRECT_URI = 'http://localhost:8080/quickbooks/callback'
const COMPANY_ID = '9341455307021048'

async function reconnectQuickBooks() {
  console.log('🔄 Starting QuickBooks Reconnection Process...')
  
  try {
    // Step 1: Generate OAuth URL
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${CLIENT_ID}&scope=com.intuit.quickbooks.accounting&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&access_type=offline&state=reconnect_${Date.now()}`
    
    console.log('\n📋 Manual OAuth Steps:')
    console.log('1. Open this URL in your browser:')
    console.log(authUrl)
    console.log('\n2. Complete the OAuth flow')
    console.log('3. Copy the authorization code from the callback URL')
    console.log('4. Run: node quickbooks-reconnect.js <authorization_code>')
    
    // If authorization code is provided as argument
    const authCode = process.argv[2]
    if (authCode) {
      console.log(`\n🔄 Processing authorization code: ${authCode}`)
      await exchangeCodeForToken(authCode)
    }
    
  } catch (error) {
    console.error('❌ Reconnection failed:', error)
  }
}

async function exchangeCodeForToken(authCode) {
  try {
    console.log('🔄 Exchanging authorization code for access token...')
    
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: REDIRECT_URI
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
    }

    const tokenData = await response.json()
    console.log('✅ Token exchange successful!')
    console.log('📊 Token data:', {
      access_token: tokenData.access_token.substring(0, 20) + '...',
      refresh_token: tokenData.refresh_token.substring(0, 20) + '...',
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type
    })

    // Test the connection
    console.log('\n🔗 Testing QuickBooks connection...')
    const testResponse = await fetch(`https://sandbox-quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/companyinfo/1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    })

    if (testResponse.ok) {
      const companyData = await testResponse.json()
      console.log('✅ QuickBooks connection test successful!')
      console.log('📊 Company Info:', {
        companyName: companyData.QueryResponse?.CompanyInfo?.[0]?.CompanyName,
        legalName: companyData.QueryResponse?.CompanyInfo?.[0]?.LegalName,
        country: companyData.QueryResponse?.CompanyInfo?.[0]?.Country
      })

      // Update tokens in database
      console.log('\n💾 Updating tokens in database...')
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      
      const { error: updateError } = await supabase
        .from('quickbooks_tokens')
        .upsert({
          user_id: '00000000-0000-0000-0000-000000000001', // Demo user ID
          company_id: COMPANY_ID,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        })

      if (updateError) {
        console.error('❌ Error updating tokens:', updateError)
        return
      }

      console.log('✅ Tokens updated successfully!')
      console.log('🎉 QuickBooks reconnection complete!')
      console.log('\n📋 Next steps:')
      console.log('1. Refresh your accounting dashboard')
      console.log('2. The status should now show "Connected"')
      console.log('3. You can now use all QuickBooks features')
      
    } else {
      throw new Error(`Connection test failed: ${testResponse.status}`)
    }

  } catch (error) {
    console.error('❌ Token exchange failed:', error)
  }
}

// Run the reconnection process
reconnectQuickBooks()
