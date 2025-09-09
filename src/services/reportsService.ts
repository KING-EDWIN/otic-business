import { supabase } from '@/lib/supabaseClient'

export interface Report {
  id: string
  user_id: string
  report_type: string
  title: string
  content: string
  timeframe: string
  status: 'completed' | 'generating' | 'failed'
  generated_at: string
  created_at: string
  updated_at: string
}

export interface ReportSchedule {
  id: string
  user_id: string
  report_type: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  recipient_email: string
  timeframe: string
  next_run_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ReportView {
  id: string
  report_id: string
  user_id: string
  viewed_at: string
}

export interface ReportStats {
  totalReports: number
  scheduledReports: number
  thisMonthReports: number
  totalViews: number
}

export class ReportsService {
  async getReports(userId: string): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching reports:', error)
      throw error
    }
  }

  async getReportById(reportId: string): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching report:', error)
      throw error
    }
  }

  async createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([report])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    }
  }

  async updateReport(reportId: string, updates: Partial<Report>): Promise<Report> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating report:', error)
      throw error
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  }

  async getReportSchedules(userId: string): Promise<ReportSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching report schedules:', error)
      throw error
    }
  }

  async createReportSchedule(schedule: Omit<ReportSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<ReportSchedule> {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .insert([schedule])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating report schedule:', error)
      throw error
    }
  }

  async updateReportSchedule(scheduleId: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule> {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .update(updates)
        .eq('id', scheduleId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating report schedule:', error)
      throw error
    }
  }

  async deleteReportSchedule(scheduleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('report_schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting report schedule:', error)
      throw error
    }
  }

  async recordReportView(reportId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('report_views')
        .insert([{
          report_id: reportId,
          user_id: userId,
          viewed_at: new Date().toISOString()
        }])

      if (error) throw error
    } catch (error) {
      console.error('Error recording report view:', error)
      throw error
    }
  }

  async getReportStats(userId: string): Promise<ReportStats> {
    try {
      // Get total reports
      const { count: totalReports, error: reportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (reportsError) throw reportsError

      // Get scheduled reports
      const { count: scheduledReports, error: schedulesError } = await supabase
        .from('report_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true)

      if (schedulesError) throw schedulesError

      // Get this month's reports
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: thisMonthReports, error: monthError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('generated_at', startOfMonth.toISOString())

      if (monthError) throw monthError

      // Get total views
      const { count: totalViews, error: viewsError } = await supabase
        .from('report_views')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (viewsError) throw viewsError

      return {
        totalReports: totalReports || 0,
        scheduledReports: scheduledReports || 0,
        thisMonthReports: thisMonthReports || 0,
        totalViews: totalViews || 0
      }
    } catch (error) {
      console.error('Error fetching report stats:', error)
      throw error
    }
  }

  async generateReportContent(reportType: string, timeframe: string, userId: string): Promise<string> {
    try {
      // This would generate actual report content based on real data
      // For now, we'll create comprehensive mock content based on the report type
      
      const now = new Date()
      const timeframes = {
        'today': 'Today',
        'last_7_days': 'Last 7 Days',
        'last_30_days': 'Last 30 Days',
        'this_month': 'This Month',
        'last_month': 'Last Month',
        'this_quarter': 'This Quarter',
        'last_quarter': 'Last Quarter',
        'this_year': 'This Year',
        'last_year': 'Last Year',
        'current': 'Current'
      }

      const timeframeName = timeframes[timeframe as keyof typeof timeframes] || timeframe

      switch (reportType) {
        case 'sales':
          return await this.generateSalesReport(timeframeName, userId)
        case 'financial':
          return await this.generateFinancialReport(timeframeName, userId)
        case 'inventory':
          return await this.generateInventoryReport(timeframeName, userId)
        case 'customer':
          return await this.generateCustomerReport(timeframeName, userId)
        case 'tax':
          return await this.generateTaxReport(timeframeName, userId)
        case 'expense':
          return await this.generateExpenseReport(timeframeName, userId)
        default:
          return `Report content for ${reportType} - ${timeframeName}`
      }
    } catch (error) {
      console.error('Error generating report content:', error)
      throw error
    }
  }

  private async generateSalesReport(timeframe: string, userId: string): Promise<string> {
    // This would fetch real sales data from Supabase
    // For now, return comprehensive mock data
    return `SALES REPORT - ${timeframe.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}
Timeframe: ${timeframe}

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
4. Monitor MacBook Air M2 sales for potential bulk orders`
  }

  private async generateFinancialReport(timeframe: string, userId: string): Promise<string> {
    return `FINANCIAL REPORT - ${timeframe.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}
Timeframe: ${timeframe}

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
3. Monitor accounts receivable to maintain healthy cash flow`
  }

  private async generateInventoryReport(timeframe: string, userId: string): Promise<string> {
    return `INVENTORY REPORT - ${timeframe.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}
Timeframe: ${timeframe}

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
4. Review pricing strategy for high-value items`
  }

  private async generateCustomerReport(timeframe: string, userId: string): Promise<string> {
    return `CUSTOMER REPORT - ${timeframe.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}
Timeframe: ${timeframe}

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
4. Create targeted campaigns for new customers`
  }

  private async generateTaxReport(timeframe: string, userId: string): Promise<string> {
    return `TAX REPORT - ${timeframe.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}
Timeframe: ${timeframe}

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
4. Monitor changes in tax regulations`
  }

  private async generateExpenseReport(timeframe: string, userId: string): Promise<string> {
    return `EXPENSE REPORT - ${timeframe.toUpperCase()}

Generated on: ${new Date().toLocaleDateString()}
Timeframe: ${timeframe}

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
4. Regular expense review meetings`
  }
}

export const reportsService = new ReportsService()

