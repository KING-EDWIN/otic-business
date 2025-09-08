import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

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
  },
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'customer',
    title: 'Customer Report - Last 30 Days',
    content: `CUSTOMER REPORT - LAST 30 DAYS

Generated on: ${new Date().toLocaleDateString()}
Timeframe: Last 30 Days

CUSTOMER SUMMARY:
- Total Customers: 89
- New Customers: 23
- Returning Customers: 66
- VIP Customers: 12
- Average Order Value: UGX 18,965

TOP CUSTOMERS BY SPENDING:
1. John Mukasa - UGX 450,000 (3 orders)
2. Sarah Nakamya - UGX 380,000 (2 orders)
3. David Ssemwogerere - UGX 320,000 (4 orders)
4. Grace Nalubega - UGX 280,000 (2 orders)
5. Peter Kato - UGX 250,000 (3 orders)

CUSTOMER GROWTH:
- Week 1: 5 new customers
- Week 2: 8 new customers
- Week 3: 6 new customers
- Week 4: 4 new customers

CUSTOMER SEGMENTS:
- High Value (>UGX 100,000): 12 customers
- Medium Value (UGX 50,000-100,000): 28 customers
- Low Value (<UGX 50,000): 49 customers

RETENTION ANALYSIS:
- First-time buyers: 23 customers
- Repeat buyers: 66 customers
- Retention rate: 74.2%

GEOGRAPHIC DISTRIBUTION:
- Kampala: 45 customers
- Entebbe: 18 customers
- Jinja: 12 customers
- Other: 14 customers

RECOMMENDATIONS:
1. Implement loyalty program for repeat customers
2. Focus marketing on high-value customer segments
3. Expand reach to other regions
4. Create targeted campaigns for new customers`,
    timeframe: 'last_30_days',
    status: 'completed',
    generated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'tax',
    title: 'Tax Report - This Quarter',
    content: `TAX REPORT - THIS QUARTER

Generated on: ${new Date().toLocaleDateString()}
Timeframe: This Quarter

TAX SUMMARY:
- Total Revenue: UGX 8,250,000
- VAT Collected (18%): UGX 1,485,000
- Income Tax (30%): UGX 195,000
- Withholding Tax (6%): UGX 495,000
- Total Tax Liability: UGX 2,175,000

VAT BREAKDOWN:
- Standard Rate (18%): UGX 1,485,000
- Zero Rate: UGX 0
- Exempt: UGX 0

INCOME TAX CALCULATION:
- Net Profit: UGX 650,000
- Taxable Income: UGX 650,000
- Income Tax (30%): UGX 195,000

WITHHOLDING TAX:
- Services: UGX 495,000
- Interest: UGX 0
- Dividends: UGX 0

EFRIS COMPLIANCE:
- TIN Number: 1001234567
- VAT Registration: Active
- Filing Status: Up to date
- Next Filing Due: End of quarter

QUARTERLY COMPARISON:
- Q1 2024: UGX 1,950,000
- Q2 2024: UGX 2,100,000
- Q3 2024: UGX 2,175,000 (Current)
- Growth: +3.6%

RECOMMENDATIONS:
1. Ensure timely EFRIS filing
2. Maintain proper tax records
3. Consider tax planning strategies
4. Monitor changes in tax regulations`,
    timeframe: 'this_quarter',
    status: 'completed',
    generated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'expense',
    title: 'Expense Report - This Month',
    content: `EXPENSE REPORT - THIS MONTH

Generated on: ${new Date().toLocaleDateString()}
Timeframe: This Month

EXPENSE SUMMARY:
- Total Expenses: UGX 450,000
- Operating Expenses: UGX 380,000
- Administrative Expenses: UGX 70,000
- Expense Ratio: 16.4%

EXPENSE BREAKDOWN:
1. Rent: UGX 150,000 (33.3%)
2. Utilities: UGX 45,000 (10.0%)
3. Salaries: UGX 120,000 (26.7%)
4. Marketing: UGX 35,000 (7.8%)
5. Office Supplies: UGX 25,000 (5.6%)
6. Insurance: UGX 30,000 (6.7%)
7. Professional Services: UGX 20,000 (4.4%)
8. Other: UGX 25,000 (5.6%)

MONTHLY TREND:
- January: UGX 420,000
- February: UGX 435,000
- March: UGX 450,000 (Current)
- Growth: +3.4%

CATEGORY ANALYSIS:
- Fixed Expenses: UGX 300,000 (66.7%)
- Variable Expenses: UGX 150,000 (33.3%)

COST CONTROL MEASURES:
1. Negotiate better rent terms
2. Implement energy-saving measures
3. Review marketing ROI
4. Optimize inventory management

RECOMMENDATIONS:
1. Monitor expense growth rate
2. Identify cost reduction opportunities
3. Implement expense approval process
4. Regular expense review meetings`,
    timeframe: 'this_month',
    status: 'completed',
    generated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
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
  },
  {
    user_id: SAMPLE_USER_ID,
    report_type: 'inventory',
    frequency: 'daily',
    recipient_email: 'demo@oticbusiness.com',
    timeframe: 'current',
    next_run_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    is_active: true
  }
]

async function seedReportsData() {
  try {
    console.log('🌱 Starting to seed reports data...')

    // Insert sample reports
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
    console.error('❌ Error seeding reports data:', error)
  }
}

// Run the seeding function
seedReportsData()
