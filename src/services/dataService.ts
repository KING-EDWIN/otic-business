import { supabase } from '@/lib/supabaseClient'
import { isOfflineMode } from '@/config/storageConfig'
import { getOfflineProducts, getOfflineStats, getOfflineSales } from './offlineData'

// Generic data service that works both online and offline
export class DataService {
  private static isOffline = isOfflineMode()

  // Products
  static async getProducts(userId?: string) {
    if (this.isOffline) {
      return getOfflineProducts()
    } else {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId || '')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  }

  static async createProduct(productData: any) {
    if (this.isOffline) {
      console.log('Product created offline:', productData)
      return { data: productData, error: null }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()

      if (error) throw error
      return { data, error: null }
    }
  }

  static async updateProduct(productId: string, updates: any) {
    if (this.isOffline) {
      console.log('Product updated offline:', productId, updates)
      return { data: { id: productId, ...updates }, error: null }
    } else {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()

      if (error) throw error
      return { data, error: null }
    }
  }

  static async deleteProduct(productId: string) {
    if (this.isOffline) {
      console.log('Product deleted offline:', productId)
      return { data: null, error: null }
    } else {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      return { data, error: null }
    }
  }

  // Sales
  static async getSales(userId?: string) {
    if (this.isOffline) {
      return getOfflineSales()
    } else {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            quantity,
            price,
            product:products (name)
          )
        `)
        .eq('user_id', userId || '')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  }

  static async createSale(saleData: any) {
    if (this.isOffline) {
      console.log('Sale created offline:', saleData)
      return { data: saleData, error: null }
    } else {
      const { data, error } = await supabase
        .from('sales')
        .insert([saleData])
        .select()

      if (error) throw error
      return { data, error: null }
    }
  }

  // Statistics
  static async getStats(userId?: string) {
    if (this.isOffline) {
      return getOfflineStats()
    } else {
      try {
        // Get sales data
        const { data: salesData } = await supabase
          .from('sales')
          .select('total')
          .eq('user_id', userId || '')

        // Get products data
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId || '')

        // Calculate stats
        const totalSales = salesData?.length || 0
        const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
        const totalProducts = productsData?.length || 0
        const lowStockItems = productsData?.filter(p => p.stock <= 5).length || 0

        return {
          totalSales,
          totalProducts,
          totalRevenue,
          lowStockItems
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        return {
          totalSales: 0,
          totalProducts: 0,
          totalRevenue: 0,
          lowStockItems: 0
        }
      }
    }
  }

  // Analytics
  static async getAnalyticsData(userId?: string, timeRange: string = '7d') {
    if (this.isOffline) {
      // Return mock analytics data for offline mode
      return {
        totalSales: 45,
        totalRevenue: 125000,
        totalProducts: 12,
        averageOrderValue: 2777,
        salesGrowth: 15.3,
        revenueGrowth: 12.7,
        topProducts: [
          { name: 'Coca Cola', sales: 15, revenue: 37500 },
          { name: 'Bread Loaf', sales: 12, revenue: 36000 },
          { name: 'Rice 1kg', sales: 8, revenue: 40000 }
        ],
        salesByDay: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          sales: Math.floor(Math.random() * 10) + 1,
          revenue: Math.floor(Math.random() * 20000) + 5000
        })),
        salesByMonth: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
          sales: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 100000) + 20000
        })),
        lowStockItems: 3,
        aiInsights: [
          { type: 'sales', message: 'Sales are up 15% this week', confidence: 0.85 },
          { type: 'inventory', message: 'Consider restocking bread loaves', confidence: 0.92 }
        ]
      }
    } else {
      try {
        const endDate = new Date()
        const startDate = new Date()
        
        switch (timeRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(endDate.getDate() - 30)
            break
          case '90d':
            startDate.setDate(endDate.getDate() - 90)
            break
          case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1)
            break
        }

        // Fetch sales data
        const { data: salesData } = await supabase
          .from('sales')
          .select(`
            *,
            sale_items (
              quantity,
              price,
              product:products (name)
            )
          `)
          .eq('user_id', userId || '')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        // Fetch products data
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId || '')

        // Calculate analytics
        const totalSales = salesData?.length || 0
        const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
        const totalProducts = productsData?.length || 0
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
        const salesGrowth = 15.3 // Mock data
        const revenueGrowth = 12.7 // Mock data
        const lowStockItems = productsData?.filter(p => p.stock <= 5).length || 0

        // Generate mock chart data
        const salesByDay = Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          sales: Math.floor(Math.random() * 10) + 1,
          revenue: Math.floor(Math.random() * 20000) + 5000
        }))

        const salesByMonth = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
          sales: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 100000) + 20000
        }))

        return {
          totalSales,
          totalRevenue,
          totalProducts,
          averageOrderValue,
          salesGrowth,
          revenueGrowth,
          topProducts: [], // This would be calculated from actual data
          salesByDay,
          salesByMonth,
          lowStockItems,
          aiInsights: []
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        throw error
      }
    }
  }

  // Payment Requests
  static async getPaymentRequests() {
    if (this.isOffline) {
      return []
    } else {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          user_profiles!inner(email, business_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  }

  static async createPaymentRequest(requestData: any) {
    if (this.isOffline) {
      console.log('Payment request created offline:', requestData)
      return { data: requestData, error: null }
    } else {
      const { data, error } = await supabase
        .from('payment_requests')
        .insert([requestData])
        .select()

      if (error) throw error
      return { data, error: null }
    }
  }

  static async updatePaymentRequest(requestId: string, updates: any) {
    if (this.isOffline) {
      console.log('Payment request updated offline:', requestId, updates)
      return { data: { id: requestId, ...updates }, error: null }
    } else {
      const { data, error } = await supabase
        .from('payment_requests')
        .update(updates)
        .eq('id', requestId)
        .select()

      if (error) throw error
      return { data, error: null }
    }
  }
}

export default DataService
