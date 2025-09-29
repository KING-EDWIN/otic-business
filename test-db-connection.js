// Database Connection Test
// This script tests the database connection and queries

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError)
      return
    }
    console.log('✅ Basic connection successful')
    
    // Test 2: Check user account
    console.log('2. Checking test account...')
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'dylankats12@gmail.com')
      .single()
    
    if (userError) {
      console.error('❌ User lookup failed:', userError)
      return
    }
    console.log('✅ User found:', userData.id, userData.user_type)
    
    // Test 3: Check products table
    console.log('3. Testing products table...')
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, user_id')
      .eq('user_id', userData.id)
      .limit(5)
    
    if (productsError) {
      console.error('❌ Products query failed:', productsError)
      return
    }
    console.log('✅ Products found:', productsData.length)
    
    // Test 4: Check sales table
    console.log('4. Testing sales table...')
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('id, total, user_id')
      .eq('user_id', userData.id)
      .limit(5)
    
    if (salesError) {
      console.error('❌ Sales query failed:', salesError)
      return
    }
    console.log('✅ Sales found:', salesData.length)
    
    // Test 5: Check vft_categories table
    console.log('5. Testing vft_categories table...')
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('vft_categories')
      .select('id, name')
      .limit(5)
    
    if (categoriesError) {
      console.error('❌ vft_categories query failed:', categoriesError)
      console.log('💡 This might be why inventory is failing')
    } else {
      console.log('✅ Categories found:', categoriesData.length)
    }
    
    console.log('')
    console.log('📊 SUMMARY:')
    console.log(`User ID: ${userData.id}`)
    console.log(`Business ID: ${userData.business_id}`)
    console.log(`Products: ${productsData.length}`)
    console.log(`Sales: ${salesData.length}`)
    console.log(`Categories: ${categoriesData?.length || 0}`)
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

// Run the test
testDatabaseConnection()
