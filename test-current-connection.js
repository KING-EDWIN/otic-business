// Test current QuickBooks connection status
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCurrentConnection() {
  console.log('🔍 Testing Current QuickBooks Connection...')
  
  try {
    // Check if we have any tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('quickbooks_tokens')
      .select('*')
      .limit(1)
      .single()
    
    if (tokensError) {
      console.error('❌ No tokens found:', tokensError.message)
      console.log('💡 Need to create new tokens')
      return false
    }

    console.log('✅ Found tokens:', {
      id: tokens.id,
      user_id: tokens.user_id,
      company_id: tokens.company_id,
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
      created_at: tokens.created_at,
      expires_at: tokens.expires_at
    })

    // Check if token is expired
    if (tokens.expires_at) {
      const expiresAt = new Date(tokens.expires_at)
      const now = new Date()
      const isExpired = now > expiresAt
      
      console.log(`🕐 Token expires: ${expiresAt.toISOString()}`)
      console.log(`🕐 Current time: ${now.toISOString()}`)
      console.log(`⚠️  Token expired: ${isExpired}`)
      
      if (isExpired) {
        console.log('🔄 Token is expired, need fresh tokens')
        return false
      }
    }

    // Test the actual API connection
    const accessToken = tokens.access_token
    const companyId = tokens.company_id
    const baseUrl = 'https://sandbox-quickbooks.api.intuit.com'

    console.log('\n🔗 Testing QuickBooks API...')
    const response = await fetch(`${baseUrl}/v3/company/${companyId}/companyinfo/1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    console.log(`📊 Response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ QuickBooks API connection successful!')
      console.log('📊 Company Info:', {
        companyName: data.QueryResponse?.CompanyInfo?.[0]?.CompanyName,
        legalName: data.QueryResponse?.CompanyInfo?.[0]?.LegalName,
        country: data.QueryResponse?.CompanyInfo?.[0]?.Country
      })
      return true
    } else {
      console.error('❌ QuickBooks API connection failed:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return false
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

testCurrentConnection()
