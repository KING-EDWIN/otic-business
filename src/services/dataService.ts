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

      if (error) {
        console.error('DataService: Supabase error:', error)
        throw error
      }
      
      // Map database columns to expected interface
      const mappedData = (data || []).map(product => ({
        ...product,
        price: product.retail_price || product.price || 0,
        cost: product.cost_price || product.cost || 0,
        stock: product.current_stock || product.stock || 0,
        min_stock: product.min_stock || 0,
        wholesale_barcode: product.barcode || '',
        category: product.category || '',
        supplier: product.brand || '',
        unit_type: product.unit_type || 'piece',
        selling_type: 'retail' as const,
        category_id: product.category_id || null,
        supplier_id: product.supplier_id || null
      }))
      
      return mappedData
    }
  }

  static async createProduct(productData: any) {
    if (this.isOffline) {
      console.log('Product created offline:', productData)
      return { data: productData, error: null }
    } else {
      // Map interface fields to database columns
      const mappedData = {
        name: productData.name,
        description: productData.description,
        barcode: productData.barcode,
        cost_price: productData.cost,
        retail_price: productData.price,
        current_stock: productData.stock,
        min_stock: productData.min_stock,
        category: productData.category,
        brand: productData.supplier,
        unit_type: productData.unit_type,
        user_id: productData.user_id,
        business_id: productData.business_id || '78283c40-74eb-4821-adb1-d8c11d8693e8', // Use existing business ID
        created_at: productData.created_at,
        updated_at: productData.updated_at,
        status: 'active'
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert([mappedData])
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
      // Map interface fields to database columns
      const mappedUpdates = {
        name: updates.name,
        description: updates.description,
        barcode: updates.barcode,
        cost_price: updates.cost,
        retail_price: updates.price,
        current_stock: updates.stock,
        min_stock: updates.min_stock,
        category: updates.category,
        brand: updates.supplier,
        unit_type: updates.unit_type,
        updated_at: updates.updated_at || new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('products')
        .update(mappedUpdates)
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

        // Get products count and low stock count efficiently
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId || '')

        const { count: lowStockItems } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId || '')
          .lte('current_stock', 5)

        // Calculate stats
        const totalSales = salesData?.length || 0
        const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total, 0) || 0

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

        // Calculate analytics from real data
        const totalSales = salesData?.length || 0
        const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
        const totalProducts = productsData?.length || 0
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
        
        // Calculate real growth by comparing with previous period
        const previousPeriodStart = new Date(startDate)
        const previousPeriodEnd = new Date(startDate)
        const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - periodDays)
        
        // Get previous period sales for growth calculation
        const { data: previousSalesData } = await supabase
          .from('sales')
          .select('total')
          .eq('user_id', userId || '')
          .gte('created_at', previousPeriodStart.toISOString())
          .lte('created_at', previousPeriodEnd.toISOString())
        
        const previousRevenue = previousSalesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
        const previousSales = previousSalesData?.length || 0
        
        const salesGrowth = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0
        const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
        
        const lowStockItems = productsData?.filter(p => (p.current_stock || p.stock || 0) <= 5).length || 0

        // Generate real chart data from actual sales
        const salesByDay = []
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          
          const daySales = salesData?.filter(sale => 
            sale.created_at.startsWith(dateStr)
          ) || []
          
          salesByDay.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sales: daySales.length,
            revenue: daySales.reduce((sum, sale) => sum + sale.total, 0)
          })
        }

        // Generate real monthly data
        const salesByMonth = []
        const months = timeRange === '1y' ? 12 : Math.ceil(days / 30)
        
        for (let i = months - 1; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthStr = date.toISOString().substring(0, 7)
          
          const monthSales = salesData?.filter(sale => 
            sale.created_at.startsWith(monthStr)
          ) || []
          
          salesByMonth.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            sales: monthSales.length,
            revenue: monthSales.reduce((sum, sale) => sum + sale.total, 0)
          })
        }

        // Calculate top products from real data
        const productSales = new Map()
        salesData?.forEach(sale => {
          sale.sale_items?.forEach((item: any) => {
            const productName = item.product?.name || 'Unknown Product'
            const existing = productSales.get(productName) || { sales: 0, revenue: 0 }
            existing.sales += item.quantity || 0
            existing.revenue += (item.price || 0) * (item.quantity || 0)
            productSales.set(productName, existing)
          })
        })
        
        const topProducts = Array.from(productSales.entries())
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        return {
          totalSales,
          totalRevenue,
          totalProducts,
          averageOrderValue,
          salesGrowth: Math.round(salesGrowth * 10) / 10,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          topProducts,
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
