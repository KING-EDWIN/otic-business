import { supabase } from '@/lib/supabase'

// =====================================================
// OTIC BUSINESS API SERVICE
// Real backend integration with Supabase functions
// =====================================================

export interface DashboardStats {
  total_sales: number
  total_revenue: number
  total_products: number
  low_stock_items: number
  recent_sales: Array<{
    id: string
    receipt_number: string
    total_amount: number
    created_at: string
    payment_method: string
  }>
  top_products: Array<{
    product_id: string
    name: string
    total_sold: number
    revenue: number
  }>
  monthly_trend: Array<{
    month: string
    sales_count: number
    revenue: number
  }>
}

export interface AIInsights {
  insights: {
    forecast: {
      sales_prediction: string
      confidence: number
      based_on: string
    }
    alerts: {
      low_stock: number
      urgent_restock: number
    }
    recommendations: {
      pricing?: string
      inventory?: string
      marketing?: string
      upgrade?: string
    }
    tier: string
    generated_at: string
  }
  data_points: {
    sales_records: number
    products_tracked: number
  }
}

export interface ProductSearchResult {
  products: Array<{
    id: string
    name: string
    description: string
    barcode: string
    selling_price: number
    stock_quantity: number
    min_stock_level: number
    category_name: string
    supplier_name: string
    created_at: string
  }>
  total_found: number
  search_term: string
}

export interface SaleResult {
  success: boolean
  sale_id: string
  receipt_number: string
  total_amount: number
  items_processed: number
}

export interface InventoryAlert {
  low_stock: Array<{
    product_id: string
    name: string
    current_stock: number
    min_stock: number
    days_remaining: number
  }>
  out_of_stock: Array<{
    product_id: string
    name: string
    last_sale: string | null
  }>
  total_alerts: number
  generated_at: string
}

export interface SalesAnalytics {
  period: string
  start_date: string
  end_date: string
  daily_sales: Array<{
    date: string
    sales_count: number
    total_revenue: number
    avg_order_value: number
  }>
  category_breakdown: Array<{
    category_name: string
    total_sales: number
    total_revenue: number
    total_quantity: number
  }>
  payment_methods: Array<{
    payment_method: string
    count: number
    total_amount: number
    percentage: number
  }>
  summary: {
    total_sales: number
    total_revenue: number
    avg_daily_revenue: number
  }
}

// =====================================================
// API FUNCTIONS
// =====================================================

export class OticAPI {
  // Get dashboard statistics
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error fetching dashboard stats:', error)
        throw new Error(`Failed to fetch dashboard stats: ${error.message}`)
      }

      return data as DashboardStats
    } catch (error) {
      console.error('Dashboard stats API error:', error)
      throw error
    }
  }

  // Get AI insights
  static async getAIInsights(userId: string, tier: string): Promise<AIInsights> {
    try {
      const { data, error } = await supabase.rpc('get_ai_insights', {
        p_user_id: userId,
        p_tier: tier
      })

      if (error) {
        console.error('Error fetching AI insights:', error)
        throw new Error(`Failed to fetch AI insights: ${error.message}`)
      }

      return data as AIInsights
    } catch (error) {
      console.error('AI insights API error:', error)
      throw error
    }
  }

  // Search products
  static async searchProducts(
    userId: string, 
    searchTerm: string = '', 
    categoryId?: string, 
    limit: number = 50
  ): Promise<ProductSearchResult> {
    try {
      const { data, error } = await supabase.rpc('search_products', {
        p_user_id: userId,
        p_search_term: searchTerm,
        p_category_id: categoryId || null,
        p_limit: limit
      })

      if (error) {
        console.error('Error searching products:', error)
        throw new Error(`Failed to search products: ${error.message}`)
      }

      return data as ProductSearchResult
    } catch (error) {
      console.error('Product search API error:', error)
      throw error
    }
  }

  // Process a sale
  static async processSale(
    userId: string,
    cartItems: Array<{
      product_id: string
      quantity: number
      unit_price: number
    }>,
    paymentMethod: string,
    customerName?: string,
    customerPhone?: string
  ): Promise<SaleResult> {
    try {
      const { data, error } = await supabase.rpc('process_sale', {
        p_user_id: userId,
        p_cart_items: cartItems,
        p_payment_method: paymentMethod,
        p_customer_name: customerName || null,
        p_customer_phone: customerPhone || null
      })

      if (error) {
        console.error('Error processing sale:', error)
        throw new Error(`Failed to process sale: ${error.message}`)
      }

      return data as SaleResult
    } catch (error) {
      console.error('Process sale API error:', error)
      throw error
    }
  }

  // Get inventory alerts
  static async getInventoryAlerts(userId: string): Promise<InventoryAlert> {
    try {
      const { data, error } = await supabase.rpc('get_inventory_alerts', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error fetching inventory alerts:', error)
        throw new Error(`Failed to fetch inventory alerts: ${error.message}`)
      }

      return data as InventoryAlert
    } catch (error) {
      console.error('Inventory alerts API error:', error)
      throw error
    }
  }

  // Get sales analytics
  static async getSalesAnalytics(
    userId: string, 
    period: '7_days' | '30_days' | '90_days' | '1_year' = '30_days'
  ): Promise<SalesAnalytics> {
    try {
      const { data, error } = await supabase.rpc('get_sales_analytics', {
        p_user_id: userId,
        p_period: period
      })

      if (error) {
        console.error('Error fetching sales analytics:', error)
        throw new Error(`Failed to fetch sales analytics: ${error.message}`)
      }

      return data as SalesAnalytics
    } catch (error) {
      console.error('Sales analytics API error:', error)
      throw error
    }
  }

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  // Products
  static async createProduct(userId: string, productData: any) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          user_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  static async updateProduct(userId: string, productId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  static async deleteProduct(userId: string, productId: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  // Categories
  static async getCategories(userId: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  static async createCategory(userId: string, categoryData: any) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          user_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  // Suppliers
  static async getSuppliers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      throw error
    }
  }

  static async createSupplier(userId: string, supplierData: any) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplierData,
          user_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating supplier:', error)
      throw error
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  // Generate barcode
  static generateBarcode(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `OTIC${timestamp.slice(-8)}${random}`
  }

  // Format currency
  static formatCurrency(amount: number, currency: string = 'UGX'): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Validate email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone number (Uganda format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+256|0)[0-9]{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
}

export default OticAPI
