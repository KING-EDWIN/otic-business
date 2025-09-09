const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAccountingTables() {
  console.log('🚀 Setting up accounting tables...')

  try {
    // 1. Create Chart of Accounts table
    console.log('📊 Creating chart_of_accounts table...')
    const { error: chartError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chart_of_accounts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          account_code VARCHAR(10) NOT NULL,
          account_name VARCHAR(255) NOT NULL,
          account_type VARCHAR(50) NOT NULL,
          parent_account_id UUID REFERENCES chart_of_accounts(id),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (chartError) console.log('Chart of accounts error:', chartError)

    // 2. Create Bank Accounts table
    console.log('🏦 Creating bank_accounts table...')
    const { error: bankError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS bank_accounts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          account_name VARCHAR(255) NOT NULL,
          account_number VARCHAR(50),
          bank_name VARCHAR(255),
          account_type VARCHAR(50) NOT NULL,
          opening_balance DECIMAL(15,2) DEFAULT 0,
          current_balance DECIMAL(15,2) DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (bankError) console.log('Bank accounts error:', bankError)

    // 3. Create Invoices table
    console.log('📄 Creating invoices table...')
    const { error: invoiceError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS invoices (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          invoice_number VARCHAR(50) NOT NULL,
          customer_id UUID,
          customer_name VARCHAR(255),
          issue_date DATE NOT NULL,
          due_date DATE NOT NULL,
          subtotal DECIMAL(15,2) NOT NULL,
          tax_amount DECIMAL(15,2) DEFAULT 0,
          total_amount DECIMAL(15,2) NOT NULL,
          status VARCHAR(20) DEFAULT 'draft',
          payment_terms VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (invoiceError) console.log('Invoices error:', invoiceError)

    // 4. Create Invoice Items table
    console.log('📋 Creating invoice_items table...')
    const { error: invoiceItemsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS invoice_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
          description VARCHAR(255) NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          unit_price DECIMAL(15,2) NOT NULL,
          line_total DECIMAL(15,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (invoiceItemsError) console.log('Invoice items error:', invoiceItemsError)

    // 5. Create Expenses table
    console.log('💰 Creating expenses table...')
    const { error: expensesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS expenses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          expense_date DATE NOT NULL,
          category VARCHAR(100) NOT NULL,
          description VARCHAR(255) NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          payment_method VARCHAR(50),
          bank_account_id UUID REFERENCES bank_accounts(id),
          vendor_name VARCHAR(255),
          receipt_url TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (expensesError) console.log('Expenses error:', expensesError)

    // 6. Create Transactions table
    console.log('📊 Creating transactions table...')
    const { error: transactionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          transaction_date DATE NOT NULL,
          description VARCHAR(255) NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          transaction_type VARCHAR(20) NOT NULL,
          account_id UUID REFERENCES chart_of_accounts(id),
          bank_account_id UUID REFERENCES bank_accounts(id),
          reference VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (transactionsError) console.log('Transactions error:', transactionsError)

    // 7. Create Profit Loss Summary table
    console.log('📈 Creating profit_loss_summary table...')
    const { error: plError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profit_loss_summary (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          total_revenue DECIMAL(15,2) DEFAULT 0,
          total_expenses DECIMAL(15,2) DEFAULT 0,
          net_income DECIMAL(15,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (plError) console.log('Profit loss summary error:', plError)

    // 8. Create Customers table
    console.log('👥 Creating customers table...')
    const { error: customersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          customer_name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(50),
          address TEXT,
          tax_id VARCHAR(50),
          payment_terms VARCHAR(100),
          credit_limit DECIMAL(15,2) DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (customersError) console.log('Customers error:', customersError)

    console.log('✅ All tables created successfully!')

    // Add sample data
    console.log('📝 Adding sample data...')
    await addSampleData()

  } catch (error) {
    console.error('❌ Error setting up tables:', error)
  }
}

async function addSampleData() {
  try {
    // Get a sample user ID (we'll use the first user or create a demo user)
    const { data: users } = await supabase.auth.admin.listUsers()
    let userId = null
    
    if (users && users.users && users.users.length > 0) {
      userId = users.users[0].id
    } else {
      // Create a demo user
      const { data: demoUser, error: userError } = await supabase.auth.admin.createUser({
        email: 'demo@oticbusiness.com',
        password: 'demo123456',
        email_confirm: true
      })
      if (userError) {
        console.log('Demo user creation error:', userError)
        return
      }
      userId = demoUser.user.id
    }

    console.log('Using user ID:', userId)

    // Add sample bank accounts
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

    if (bankError) console.log('Bank accounts sample data error:', bankError)

    // Add sample expenses
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

    if (expensesError) console.log('Expenses sample data error:', expensesError)

    // Add sample invoices
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

    if (invoicesError) console.log('Invoices sample data error:', invoicesError)

    console.log('✅ Sample data added successfully!')

  } catch (error) {
    console.error('❌ Error adding sample data:', error)
  }
}

// Run the setup
setupAccountingTables()

