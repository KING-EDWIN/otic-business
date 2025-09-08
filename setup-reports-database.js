import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample user ID (replace with actual user ID from your auth.users table)
const SAMPLE_USER_ID = '7cb3476d-d013-4c3e-aef6-df76c86f730b' // Replace with actual user ID

const sampleReports = [
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'sales',
    title: 'Sales Report - Last 30 Days',
    content: `SALES REPORT - LAST 30 DAYS

Generated on: ${new Date().toLocaleDateString()}
Timeframe: Last 30 Days

SUMMARY:
- Total Revenue: UGX 2,750,000
- Total Sales: 145 transactions
- Average Order Value: UGX 18,965
- Top Product: Samsung Galaxy A54 (25 sales)
- Growth Rate: +12.5%

DETAILED ANALYSIS:
This report shows strong performance across all metrics. Sales have increased by 12.5% compared to the previous period, driven primarily by increased demand for electronics and accessories.

TOP SELLING PRODUCTS:
1. Samsung Galaxy A54 - 25 units - UGX 1,250,000
2. iPhone 14 - 18 units - UGX 1,080,000
3. AirPods Pro - 32 units - UGX 320,000
4. MacBook Air M2 - 8 units - UGX 1,200,000
5. iPad Air - 12 units - UGX 720,000

DAILY SALES BREAKDOWN:
- Week 1: UGX 650,000 (23 transactions)
- Week 2: UGX 720,000 (28 transactions)
- Week 3: UGX 680,000 (25 transactions)
- Week 4: UGX 700,000 (29 transactions)

RECOMMENDATIONS:
1. Increase inventory for Samsung Galaxy A54 due to high demand
2. Consider promotional pricing for iPhone 14 to boost sales
3. Expand AirPods Pro inventory as it's a high-volume item
4. Monitor MacBook Air M2 sales for potential bulk orders`,
    timeframe: 'last_30_days',
    status: 'completed',
    generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'financial',
    title: 'Financial Report - This Month',
    content: `FINANCIAL REPORT - THIS MONTH

Generated on: ${new Date().toLocaleDateString()}
Timeframe: This Month

PROFIT & LOSS STATEMENT:
Revenue: UGX 2,750,000
Cost of Goods Sold: UGX 1,650,000
Gross Profit: UGX 1,100,000
Operating Expenses: UGX 450,000
Net Profit: UGX 650,000

BALANCE SHEET:
Assets:
- Cash: UGX 1,200,000
- Inventory: UGX 2,100,000
- Accounts Receivable: UGX 180,000
- Equipment: UGX 500,000
Total Assets: UGX 3,980,000

Liabilities:
- Accounts Payable: UGX 320,000
- Short-term Loans: UGX 150,000
Total Liabilities: UGX 470,000

Equity: UGX 3,510,000

CASH FLOW:
Operating Cash Flow: UGX 650,000
Investing Cash Flow: -UGX 50,000
Financing Cash Flow: UGX 0
Net Cash Flow: UGX 600,000

KEY METRICS:
- Gross Margin: 40.0%
- Net Profit Margin: 23.6%
- Return on Assets: 16.3%
- Current Ratio: 2.1

RECOMMENDATIONS:
1. Strong cash position allows for inventory expansion
2. Consider investing in new equipment to improve efficiency
3. Monitor accounts receivable to maintain healthy cash flow`,
    timeframe: 'this_month',
    status: 'completed',
    generated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'inventory',
    title: 'Inventory Report - Current Status',
    content: `INVENTORY REPORT - CURRENT STATUS

Generated on: ${new Date().toLocaleDateString()}
Timeframe: Current

INVENTORY SUMMARY:
- Total Products: 156
- Total Value: UGX 2,100,000
- Low Stock Items: 12
- Out of Stock Items: 3
- Average Stock Value: UGX 13,462

LOW STOCK ALERTS:
1. iPhone 14 - 2 units remaining (Min: 5)
2. AirPods Pro - 3 units remaining (Min: 10)
3. MacBook Air M2 - 1 unit remaining (Min: 3)
4. iPad Air - 2 units remaining (Min: 5)
5. Samsung Galaxy A54 - 4 units remaining (Min: 8)

OUT OF STOCK:
1. iPhone 15 Pro - 0 units
2. AirPods Max - 0 units
3. Apple Watch Series 9 - 0 units

TOP VALUE ITEMS:
1. MacBook Pro M3 - UGX 450,000 (2 units)
2. iPhone 15 Pro Max - UGX 380,000 (0 units)
3. MacBook Air M2 - UGX 150,000 (1 unit)
4. iPad Pro - UGX 120,000 (3 units)
5. Mac Studio - UGX 100,000 (1 unit)

CATEGORY BREAKDOWN:
- Smartphones: 45 items (UGX 800,000)
- Laptops: 25 items (UGX 750,000)
- Accessories: 60 items (UGX 300,000)
- Tablets: 20 items (UGX 200,000)
- Other: 6 items (UGX 50,000)

RECOMMENDATIONS:
1. Urgent: Reorder out-of-stock items
2. High Priority: Restock low inventory items
3. Consider bulk purchasing for high-demand items
4. Review pricing strategy for high-value items`,
    timeframe: 'current',
    status: 'completed',
    generated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  }
]

const sampleSchedules = [
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'sales',
    frequency: 'weekly',
    recipient_email: 'demo@oticbusiness.com',
    timeframe: 'last_7_days',
    next_run_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    is_active: true
  },
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'financial',
    frequency: 'monthly',
    recipient_email: 'demo@oticbusiness.com',
    timeframe: 'last_month',
    next_run_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Next month
    is_active: true
  }
]

async function setupReportsDatabase() {
  try {
    console.log('🌱 Setting up reports database...')

    // First, let's try to create the tables using direct SQL
    console.log('🔧 Creating reports table...')
    const { error: reportsTableError } = await supabase
      .from('reports')
      .select('id')
      .limit(1)

    if (reportsTableError && reportsTableError.code === 'PGRST116') {
      console.log('📝 Reports table does not exist, creating...')
      // Table doesn't exist, we need to create it via SQL editor or dashboard
      console.log('⚠️  Please create the reports table manually in Supabase SQL Editor using the create-reports-tables.sql file')
      console.log('   Then run this script again to seed the data.')
      return
    }

    console.log('✅ Reports table exists, proceeding with data seeding...')

    // Insert sample reports
    console.log('📊 Inserting sample reports...')
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .insert(sampleReports)
      .select()

    if (reportsError) {
      console.error('❌ Error inserting reports:', reportsError)
      return
    }

    console.log('✅ Successfully inserted', reportsData.length, 'reports')

    // Insert sample schedules
    console.log('📅 Inserting sample schedules...')
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('report_schedules')
      .insert(sampleSchedules)
      .select()

    if (schedulesError) {
      console.error('❌ Error inserting schedules:', schedulesError)
      return
    }

    console.log('✅ Successfully inserted', schedulesData.length, 'report schedules')

    // Insert some sample report views
    console.log('👁️  Inserting sample report views...')
    const reportViews = []
    for (const report of reportsData) {
      // Add 2-5 views per report
      const viewCount = Math.floor(Math.random() * 4) + 2
      for (let i = 0; i < viewCount; i++) {
        reportViews.push({
          report_id: report.id,
          user_id: SAMPLE_USER_ID,
          viewed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }

    const { data: viewsData, error: viewsError } = await supabase
      .from('report_views')
      .insert(reportViews)
      .select()

    if (viewsError) {
      console.error('❌ Error inserting views:', viewsError)
      return
    }

    console.log('✅ Successfully inserted', viewsData.length, 'report views')

    console.log('🎉 All reports data seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Reports: ${reportsData.length}`)
    console.log(`- Schedules: ${schedulesData.length}`)
    console.log(`- Views: ${viewsData.length}`)

  } catch (error) {
    console.error('❌ Error setting up reports database:', error)
  }
}

// Run the setup function
setupReportsDatabase()
