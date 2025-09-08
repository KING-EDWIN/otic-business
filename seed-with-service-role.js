import { createClient } from '@supabase/supabase-js'

// Using service role key to bypass RLS
const supabaseUrl = "https://jvgiyscchxxekcbdicco.supabase.co"
// You'll need to get the service role key from your Supabase project settings
// For now, let's try with the anon key but disable RLS temporarily
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8"

const supabase = createClient(supabaseUrl, supabaseKey)

const SAMPLE_USER_ID = '00000000-0000-0000-0000-000000000001'

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

RECOMMENDATIONS:
1. Increase inventory for Samsung Galaxy A54 due to high demand
2. Consider promotional pricing for iPhone 14 to boost sales
3. Expand AirPods Pro inventory as it's a high-volume item
4. Monitor MacBook Air M2 sales for potential bulk orders`,
    timeframe: 'last_30_days',
    status: 'completed',
    generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
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
    generated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
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

RECOMMENDATIONS:
1. Urgent: Reorder out-of-stock items
2. High Priority: Restock low inventory items
3. Consider bulk purchasing for high-demand items
4. Review pricing strategy for high-value items`,
    timeframe: 'current',
    status: 'completed',
    generated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
]

async function seedReportsData() {
  try {
    console.log('🌱 Starting to seed reports data with service role...')
    console.log('📝 Using user ID:', SAMPLE_USER_ID)

    // First, let's try to temporarily disable RLS for the reports table
    console.log('🔧 Attempting to disable RLS temporarily...')
    
    // Try to insert reports directly
    console.log('📊 Inserting sample reports...')
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .insert(sampleReports)
      .select()

    if (reportsError) {
      console.error('❌ Error inserting reports:', reportsError)
      
      if (reportsError.code === '42501') {
        console.log('💡 RLS is blocking the insert. You need to either:')
        console.log('   1. Use a service role key instead of anon key')
        console.log('   2. Temporarily disable RLS for the reports table')
        console.log('   3. Or create the reports through the app interface')
        
        console.log('\n🔧 To temporarily disable RLS, run this SQL in Supabase:')
        console.log('   ALTER TABLE reports DISABLE ROW LEVEL SECURITY;')
        console.log('   -- Then run this script again')
        console.log('   -- Then re-enable RLS: ALTER TABLE reports ENABLE ROW LEVEL SECURITY;')
      }
      return
    }

    console.log('✅ Successfully inserted', reportsData.length, 'reports')

    // Insert some sample report views
    console.log('👁️  Inserting sample report views...')
    const reportViews = []
    for (const report of reportsData) {
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
    } else {
      console.log('✅ Successfully inserted', viewsData.length, 'report views')
    }

    console.log('🎉 Reports data seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Reports: ${reportsData.length}`)
    console.log(`- Views: ${viewsData?.length || 0}`)
    console.log('\n🚀 You can now test the Reports dashboard at /reports')

  } catch (error) {
    console.error('❌ Error seeding reports data:', error)
  }
}

seedReportsData()
