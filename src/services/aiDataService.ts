import { supabase } from '@/lib/supabaseClient'

export interface AIBusinessData {
  products: any[]
  sales: any[]
  categories: any[]
  customers: any[]
  lowStockItems: any[]
  topProducts: any[]
  recentSales: any[]
  totalRevenue: number
  totalProducts: number
  totalSales: number
  averageOrderValue: number
  salesGrowth: number
  revenueGrowth: number
}

export class AIDataService {
  /**
   * Fetch comprehensive business data for AI analysis
   */
  static async getBusinessDataForAI(userId: string): Promise<AIBusinessData> {
    try {
      console.log('🤖 AIDataService: Fetching comprehensive business data for user:', userId)
      
      // Fetch all data in parallel for better performance
      const [
        productsResult,
        salesResult,
        categoriesResult,
        customersResult
      ] = await Promise.all([
        this.fetchProducts(userId),
        this.fetchSales(userId),
        this.fetchCategories(userId),
        this.fetchCustomers(userId)
      ])

      const products = productsResult.data || []
      const sales = salesResult.data || []
      const categories = categoriesResult.data || []
      const customers = customersResult.data || []

      console.log('📊 AIDataService: Data fetched:', {
        products: products.length,
        sales: sales.length,
        categories: categories.length,
        customers: customers.length
      })

      // Calculate derived metrics
      const lowStockItems = products.filter(p => (p.current_stock || 0) <= (p.min_stock || 5))
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0)
      const totalSales = sales.length
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

      // Calculate growth metrics
      const { salesGrowth, revenueGrowth } = this.calculateGrowthMetrics(sales)

      // Get top products by revenue
      const topProducts = this.calculateTopProducts(products, sales)

      // Get recent sales (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentSales = sales.filter(sale => 
        new Date(sale.created_at) >= sevenDaysAgo
      )

      const businessData: AIBusinessData = {
        products,
        sales,
        categories,
        customers,
        lowStockItems,
        topProducts,
        recentSales,
        totalRevenue,
        totalProducts: products.length,
        totalSales,
        averageOrderValue,
        salesGrowth,
        revenueGrowth
      }

      console.log('✅ AIDataService: Business data prepared:', {
        totalProducts: businessData.totalProducts,
        totalSales: businessData.totalSales,
        totalRevenue: businessData.totalRevenue,
        lowStockItems: businessData.lowStockItems.length,
        topProducts: businessData.topProducts.length
      })

      return businessData
    } catch (error) {
      console.error('❌ AIDataService: Error fetching business data:', error)
      throw new Error(`Failed to fetch business data: ${error.message}`)
    }
  }

  /**
   * Fetch products with proper error handling
   */
  private static async fetchProducts(userId: string) {
    return await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  }

  /**
   * Fetch sales with proper error handling
   */
  private static async fetchSales(userId: string) {
    return await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  }

  /**
   * Fetch categories with fallback
   */
  private static async fetchCategories(userId: string) {
    try {
      return await supabase
        .from('categories')
        .select('*')
        .order('name')
    } catch (error) {
      console.warn('Categories not available, using fallback')
      return { data: [
        { id: '1', name: 'Beverages' },
        { id: '2', name: 'Snacks' },
        { id: '3', name: 'Detergents' },
        { id: '4', name: 'Toiletries' },
        { id: '5', name: 'Food Items' }
      ] }
    }
  }

  /**
   * Fetch customers with proper error handling
   */
  private static async fetchCustomers(userId: string) {
    try {
      return await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    } catch (error) {
      console.warn('Customers table not available')
      return { data: [] }
    }
  }

  /**
   * Calculate growth metrics
   */
  private static calculateGrowthMetrics(sales: any[]) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const recentSales = sales.filter(sale => 
      new Date(sale.created_at) >= thirtyDaysAgo
    )
    const previousSales = sales.filter(sale => 
      new Date(sale.created_at) >= sixtyDaysAgo && 
      new Date(sale.created_at) < thirtyDaysAgo
    )

    const recentRevenue = recentSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
    const previousRevenue = previousSales.reduce((sum, sale) => sum + (sale.total || 0), 0)

    const salesGrowth = previousSales.length > 0 
      ? ((recentSales.length - previousSales.length) / previousSales.length) * 100 
      : 0
    const revenueGrowth = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    return { salesGrowth, revenueGrowth }
  }

  /**
   * Calculate top products by revenue
   */
  private static calculateTopProducts(products: any[], sales: any[]) {
    const productRevenue = products.map(product => {
      const productSales = sales.filter(sale => 
        sale.sale_items?.some(item => item.product?.name === product.name)
      )
      const totalRevenue = productSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
      
      return {
        name: product.name,
        sales: productSales.length,
        revenue: totalRevenue,
        current_stock: product.current_stock || 0,
        min_stock: product.min_stock || 5
      }
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    return productRevenue
  }

  /**
   * Get inventory insights data
   */
  static async getInventoryInsightsData(userId: string) {
    const businessData = await this.getBusinessDataForAI(userId)
    
    return {
      products: businessData.products,
      lowStockItems: businessData.lowStockItems,
      totalProducts: businessData.totalProducts,
      categories: businessData.categories
    }
  }

  /**
   * Get sales insights data
   */
  static async getSalesInsightsData(userId: string) {
    const businessData = await this.getBusinessDataForAI(userId)
    
    return {
      sales: businessData.sales,
      recentSales: businessData.recentSales,
      topProducts: businessData.topProducts,
      totalRevenue: businessData.totalRevenue,
      totalSales: businessData.totalSales,
      averageOrderValue: businessData.averageOrderValue,
      salesGrowth: businessData.salesGrowth,
      revenueGrowth: businessData.revenueGrowth
    }
  }

  /**
   * Get financial insights data
   */
  static async getFinancialInsightsData(userId: string) {
    const businessData = await this.getBusinessDataForAI(userId)
    
    // Estimate expenses (70% of revenue is a common business ratio)
    const estimatedExpenses = businessData.totalRevenue * 0.7
    const estimatedProfit = businessData.totalRevenue * 0.3
    
    return {
      revenue: businessData.totalRevenue,
      expenses: estimatedExpenses,
      profit: estimatedProfit,
      sales: businessData.sales,
      customers: businessData.customers
    }
  }
}

