import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAccountingTables() {
  console.log('🚀 Setting up accounting tables and sample data...')

  try {
    // First, let's check if we can connect
    console.log('🔌 Testing connection...')
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Connection test failed:', testError)
      return
    }

    console.log('✅ Connection successful!')

    // Get a user ID to work with
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, user_id')
      .limit(1)

    if (!profiles || profiles.length === 0) {
      console.log('❌ No user profiles found. Please create a user first.')
      return
    }

    const userId = profiles[0].user_id
    console.log('👤 Using user ID:', userId)

    // Create sample bank accounts
    console.log('🏦 Creating sample bank accounts...')
    const { error: bankError } = await supabase
      .from('bank_accounts')
      .insert([
        {
          user_id: userId,
          account_name: 'Cash on Hand',
          account_type: 'Cash',
          current_balance: 922050.00,
          is_active: true
        },
        {
          user_id: userId,
          account_name: 'Checking Account',
          account_type: 'Checking',
          current_balance: 153300.00,
          is_active: true
        },
        {
          user_id: userId,
          account_name: 'Credit Card',
          account_type: 'Credit Card',
          current_balance: -500.00,
          is_active: true
        }
      ])

    if (bankError) {
      console.log('⚠️ Bank accounts error (might already exist):', bankError.message)
    } else {
      console.log('✅ Bank accounts created!')
    }

    // Create sample expenses
    console.log('💰 Creating sample expenses...')
    const { error: expensesError } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: userId,
          expense_date: new Date().toISOString().split('T')[0],
          category: 'Online Marketing',
          description: 'Google Ads Campaign',
          amount: 10000.00,
          payment_method: 'Bank Transfer',
          vendor_name: 'Google',
          status: 'approved'
        },
        {
          user_id: userId,
          expense_date: new Date().toISOString().split('T')[0],
          category: 'Subscriptions',
          description: 'Software Subscriptions',
          amount: 6000.00,
          payment_method: 'Credit Card',
          vendor_name: 'Various',
          status: 'approved'
        },
        {
          user_id: userId,
          expense_date: new Date().toISOString().split('T')[0],
          category: 'Depreciation',
          description: 'Equipment Depreciation',
          amount: 2000.00,
          payment_method: 'Internal',
          vendor_name: 'Internal',
          status: 'approved'
        }
      ])

    if (expensesError) {
      console.log('⚠️ Expenses error (might already exist):', expensesError.message)
    } else {
      console.log('✅ Expenses created!')
    }

    // Create sample invoices
    console.log('📄 Creating sample invoices...')
    const { error: invoicesError } = await supabase
      .from('invoices')
      .insert([
        {
          user_id: userId,
          invoice_number: 'INV-001',
          customer_name: 'Acme Corporation',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: 500.00,
          tax_amount: 50.00,
          total_amount: 550.00,
          status: 'paid'
        },
        {
          user_id: userId,
          invoice_number: 'INV-002',
          customer_name: 'Tech Solutions Ltd',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: 147344.00,
          tax_amount: 14734.40,
          total_amount: 162078.40,
          status: 'overdue'
        }
      ])

    if (invoicesError) {
      console.log('⚠️ Invoices error (might already exist):', invoicesError.message)
    } else {
      console.log('✅ Invoices created!')
    }

    // Create sample customers
    console.log('👥 Creating sample customers...')
    const { error: customersError } = await supabase
      .from('customers')
      .insert([
        {
          user_id: userId,
          customer_name: 'Acme Corporation',
          email: 'contact@acme.com',
          phone: '+1-555-0123',
          address: '123 Business St, City, State 12345',
          payment_terms: 'Net 30',
          credit_limit: 50000.00,
          is_active: true
        },
        {
          user_id: userId,
          customer_name: 'Tech Solutions Ltd',
          email: 'info@techsolutions.com',
          phone: '+1-555-0456',
          address: '456 Tech Ave, City, State 67890',
          payment_terms: 'Net 15',
          credit_limit: 100000.00,
          is_active: true
        }
      ])

    if (customersError) {
      console.log('⚠️ Customers error (might already exist):', customersError.message)
    } else {
      console.log('✅ Customers created!')
    }

    console.log('🎉 Setup complete! You can now test the accounting page.')

  } catch (error) {
    console.error('❌ Error during setup:', error)
  }
}

// Run the setup
setupAccountingTables()
