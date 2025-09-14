// Advanced Reporting Service
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUserInfo, hasFeatureAccess } from '@/utils/userUtils'

export interface ReportFilters {
  startDate: string
  endDate: string
  category?: string
  productId?: string
  customerId?: string
}

export interface SalesReport {
  totalSales: number
  totalRevenue: number
  averageOrderValue: number
  totalOrders: number
  topProducts: Array<{
    product_id: string
    name: string
    quantity: number
    revenue: number
  }>
  salesByDay: Array<{
    date: string
    sales: number
    revenue: number
  }>
  salesByCategory: Array<{
    category: string
    sales: number
    revenue: number
  }>
}

export interface InventoryReport {
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
  topSellingProducts: Array<{
    product_id: string
    name: string
    quantity_sold: number
    revenue: number
  }>
  slowMovingProducts: Array<{
    product_id: string
    name: string
    quantity_sold: number
    last_sale_date: string
  }>
  categoryBreakdown: Array<{
    category: string
    count: number
    value: number
  }>
}

export interface FinancialReport {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  grossMargin: number
  profitMargin: number
  revenueByMonth: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  expenseBreakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>
  cashFlow: Array<{
    date: string
    inflow: number
    outflow: number
    net_flow: number
  }>
}

export interface CustomerReport {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  averageOrderValue: number
  topCustomers: Array<{
    customer_id: string
    name: string
    total_orders: number
    total_spent: number
    last_order_date: string
  }>
  customerGrowth: Array<{
    month: string
    new_customers: number
    total_customers: number
  }>
}

export class ReportService {
  async generateSalesReport(filters: ReportFilters): Promise<SalesReport> {
    // Get current user info
    const userInfo = await getCurrentUserInfo()
    if (!userInfo) {
      throw new Error('User not authenticated')
    }

    // Check if user has access to advanced reports
    if (!hasFeatureAccess(userInfo.tier, 'standard')) {
      throw new Error('Advanced reports require Standard tier or higher')
    }

    const userId = userInfo.id
    
    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items(
          *,
          products(name, category_id)
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', filters.startDate)
      .lte('created_at', filters.endDate)

    if (error) {
      console.error('Error fetching sales data:', error)
      throw error
    }

    const salesData = sales || []
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0)
    const totalOrders = salesData.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate top products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
    
    salesData.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const productId = item.product_id
        const existing = productSales.get(productId) || { name: item.products?.name || 'Unknown', quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.price * item.quantity
        productSales.set(productId, existing)
      })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([product_id, data]) => ({ product_id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Calculate sales by day
    const salesByDay = new Map<string, { sales: number; revenue: number }>()
    salesData.forEach(sale => {
      const date = sale.created_at.split('T')[0]
      const existing = salesByDay.get(date) || { sales: 0, revenue: 0 }
      existing.sales += 1
      existing.revenue += sale.total
      salesByDay.set(date, existing)
    })

    const salesByDayArray = Array.from(salesByDay.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate sales by category
    const salesByCategory = new Map<string, { sales: number; revenue: number }>()
    salesData.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const category = item.products?.category_id || 'Uncategorized'
        const existing = salesByCategory.get(category) || { sales: 0, revenue: 0 }
        existing.sales += item.quantity
        existing.revenue += item.price * item.quantity
        salesByCategory.set(category, existing)
      })
    })

    const salesByCategoryArray = Array.from(salesByCategory.entries())
      .map(([category, data]) => ({ category, ...data }))

    return {
      totalSales: salesData.length,
      totalRevenue,
      averageOrderValue,
      totalOrders,
      topProducts,
      salesByDay: salesByDayArray,
      salesByCategory: salesByCategoryArray
    }
  }

  async generateInventoryReport(): Promise<InventoryReport> {
    // Get current user info
    const userInfo = await getCurrentUserInfo()
    if (!userInfo) {
      throw new Error('User not authenticated')
    }

    // Check if user has access to inventory reports
    if (!hasFeatureAccess(userInfo.tier, 'basic')) {
      throw new Error('Inventory reports require Basic tier or higher')
    }

    const userId = userInfo.id
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      throw productsError
    }

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        sale_items(
          product_id,
          quantity,
          price,
          products(name, category_id)
        )
      `)
      .eq('user_id', userId)

    if (salesError) {
      console.error('Error fetching sales for inventory report:', salesError)
      throw salesError
    }

    const productsData = products || []
    const salesData = sales || []

    // Calculate product sales
    const productSales = new Map<string, { name: string; quantity_sold: number; revenue: number; last_sale_date: string }>()
    
    salesData.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const productId = item.product_id
        const existing = productSales.get(productId) || { 
          name: item.products?.name || 'Unknown', 
          quantity_sold: 0, 
          revenue: 0,
          last_sale_date: ''
        }
        existing.quantity_sold += item.quantity
        existing.revenue += item.price * item.quantity
        if (item.created_at > existing.last_sale_date) {
          existing.last_sale_date = item.created_at
        }
        productSales.set(productId, existing)
      })
    })

    const totalProducts = productsData.length
    const lowStockItems = productsData.filter(p => p.stock <= p.min_stock).length
    const outOfStockItems = productsData.filter(p => p.stock === 0).length
    const totalValue = productsData.reduce((sum, p) => sum + (p.stock * p.price), 0)

    const topSellingProducts = Array.from(productSales.entries())
      .map(([product_id, data]) => ({ product_id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    const slowMovingProducts = Array.from(productSales.entries())
      .map(([product_id, data]) => ({ product_id, ...data }))
      .sort((a, b) => a.quantity_sold - b.quantity_sold)
      .slice(0, 10)

    // Category breakdown
    const categoryBreakdown = new Map<string, { count: number; value: number }>()
    productsData.forEach(product => {
      const category = product.category_id || 'Uncategorized'
      const existing = categoryBreakdown.get(category) || { count: 0, value: 0 }
      existing.count += 1
      existing.value += product.stock * product.price
      categoryBreakdown.set(category, existing)
    })

    const categoryBreakdownArray = Array.from(categoryBreakdown.entries())
      .map(([category, data]) => ({ category, ...data }))

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalValue,
      topSellingProducts,
      slowMovingProducts,
      categoryBreakdown: categoryBreakdownArray
    }
  }

  async generateFinancialReport(filters: ReportFilters): Promise<FinancialReport> {
    // Get current user info
    const userInfo = await getCurrentUserInfo()
    if (!userInfo) {
      throw new Error('User not authenticated')
    }

    // Check if user has access to financial reports
    if (!hasFeatureAccess(userInfo.tier, 'standard')) {
      throw new Error('Financial reports require Standard tier or higher')
    }

    const userId = userInfo.id
    
    const [salesData, expensesData] = await Promise.all([
      this.getSalesData(filters, userId),
      this.getExpensesData(filters, userId)
    ])

    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0)
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Revenue by month
    const revenueByMonth = this.calculateMonthlyData(salesData, expensesData)

    // Expense breakdown
    const expenseBreakdown = this.calculateExpenseBreakdown(expensesData)

    // Cash flow
    const cashFlow = this.calculateCashFlow(salesData, expensesData)

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      grossMargin,
      profitMargin,
      revenueByMonth,
      expenseBreakdown,
      cashFlow
    }
  }

  async generateCustomerReport(filters: ReportFilters): Promise<CustomerReport> {
    // Get current user info
    const userInfo = await getCurrentUserInfo()
    if (!userInfo) {
      throw new Error('User not authenticated')
    }

    // Check if user has access to customer reports
    if (!hasFeatureAccess(userInfo.tier, 'basic')) {
      throw new Error('Customer reports require Basic tier or higher')
    }

    const userId = userInfo.id
    
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      throw customersError
    }

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', filters.startDate)
      .lte('created_at', filters.endDate)

    if (salesError) {
      console.error('Error fetching sales for customer report:', salesError)
      throw salesError
    }

    const customersData = customers || []
    const salesData = sales || []

    const totalCustomers = customersData.length
    const newCustomers = customersData.filter(c => 
      new Date(c.created_at) >= new Date(filters.startDate)
    ).length
    const returningCustomers = totalCustomers - newCustomers

    // Calculate customer metrics
    const customerMetrics = new Map<string, {
      name: string
      total_orders: number
      total_spent: number
      last_order_date: string
    }>()

    salesData.forEach(sale => {
      const customerId = sale.customer_id || 'walk-in'
      const existing = customerMetrics.get(customerId) || {
        name: 'Walk-in Customer',
        total_orders: 0,
        total_spent: 0,
        last_order_date: ''
      }
      existing.total_orders += 1
      existing.total_spent += sale.total
      if (sale.created_at > existing.last_order_date) {
        existing.last_order_date = sale.created_at
      }
      customerMetrics.set(customerId, existing)
    })

    const topCustomers = Array.from(customerMetrics.entries())
      .map(([customer_id, data]) => ({ customer_id, ...data }))
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10)

    const averageOrderValue = salesData.length > 0 
      ? salesData.reduce((sum, sale) => sum + sale.total, 0) / salesData.length 
      : 0

    // Customer growth (simplified)
    const customerGrowth = this.calculateCustomerGrowth(customersData)

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      averageOrderValue,
      topCustomers,
      customerGrowth
    }
  }

  private async getSalesData(filters: ReportFilters, userId: string) {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', filters.startDate)
      .lte('created_at', filters.endDate)

    if (error) throw error
    return data || []
  }

  private async getExpensesData(filters: ReportFilters, userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('paid_at', filters.startDate)
      .lte('paid_at', filters.endDate)

    if (error) throw error
    return data || []
  }

  private calculateMonthlyData(salesData: any[], expensesData: any[]) {
    const monthlyData = new Map<string, { revenue: number; expenses: number; profit: number }>()
    
    salesData.forEach(sale => {
      const month = sale.created_at.substring(0, 7) // YYYY-MM
      const existing = monthlyData.get(month) || { revenue: 0, expenses: 0, profit: 0 }
      existing.revenue += sale.total
      monthlyData.set(month, existing)
    })

    expensesData.forEach(expense => {
      const month = expense.paid_at.substring(0, 7)
      const existing = monthlyData.get(month) || { revenue: 0, expenses: 0, profit: 0 }
      existing.expenses += expense.amount
      monthlyData.set(month, existing)
    })

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  private calculateExpenseBreakdown(expensesData: any[]) {
    const breakdown = new Map<string, number>()
    
    expensesData.forEach(expense => {
      const category = expense.description || 'Other'
      const existing = breakdown.get(category) || 0
      breakdown.set(category, existing + expense.amount)
    })

    const total = Array.from(breakdown.values()).reduce((sum, amount) => sum + amount, 0)

    return Array.from(breakdown.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  private calculateCashFlow(salesData: any[], expensesData: any[]) {
    const dailyFlow = new Map<string, { inflow: number; outflow: number; net_flow: number }>()
    
    salesData.forEach(sale => {
      const date = sale.created_at.split('T')[0]
      const existing = dailyFlow.get(date) || { inflow: 0, outflow: 0, net_flow: 0 }
      existing.inflow += sale.total
      existing.net_flow = existing.inflow - existing.outflow
      dailyFlow.set(date, existing)
    })

    expensesData.forEach(expense => {
      const date = expense.paid_at.split('T')[0]
      const existing = dailyFlow.get(date) || { inflow: 0, outflow: 0, net_flow: 0 }
      existing.outflow += expense.amount
      existing.net_flow = existing.inflow - existing.outflow
      dailyFlow.set(date, existing)
    })

    return Array.from(dailyFlow.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private calculateCustomerGrowth(customersData: any[]) {
    const monthlyGrowth = new Map<string, { new_customers: number; total_customers: number }>()
    
    customersData.forEach(customer => {
      const month = customer.created_at.substring(0, 7)
      const existing = monthlyGrowth.get(month) || { new_customers: 0, total_customers: 0 }
      existing.new_customers += 1
      monthlyGrowth.set(month, existing)
    })

    let runningTotal = 0
    return Array.from(monthlyGrowth.entries())
      .map(([month, data]) => {
        runningTotal += data.new_customers
        return {
          month,
          new_customers: data.new_customers,
          total_customers: runningTotal
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  async exportReport(reportType: string, data: any, format: 'csv' | 'pdf' | 'excel' = 'csv'): Promise<Blob> {
    if (format === 'csv') {
      return this.exportToCSV(data, reportType)
    } else if (format === 'pdf') {
      return this.exportToPDF(data, reportType)
    } else {
      return this.exportToExcel(data, reportType)
    }
  }

  private exportToCSV(data: any, reportType: string): Blob {
    let csvContent = ''
    
    if (reportType === 'sales') {
      csvContent = 'Date,Product,Quantity,Revenue\n'
      // Add sales data to CSV
    } else if (reportType === 'inventory') {
      csvContent = 'Product,Category,Stock,Value\n'
      // Add inventory data to CSV
    } else if (reportType === 'financial') {
      csvContent = 'Month,Revenue,Expenses,Profit\n'
      // Add financial data to CSV
    }

    return new Blob([csvContent], { type: 'text/csv' })
  }

  private exportToPDF(data: any, reportType: string): Blob {
    // Simple PDF generation (in real app, use a library like jsPDF)
    const content = `Report: ${reportType}\nGenerated: ${new Date().toISOString()}\n\nData: ${JSON.stringify(data, null, 2)}`
    return new Blob([content], { type: 'text/plain' })
  }

  private exportToExcel(data: any, reportType: string): Blob {
    // Simple Excel generation (in real app, use a library like xlsx)
    const content = `Report: ${reportType}\nGenerated: ${new Date().toISOString()}\n\nData: ${JSON.stringify(data, null, 2)}`
    return new Blob([content], { type: 'text/plain' })
  }
}

export const reportService = new ReportService()
