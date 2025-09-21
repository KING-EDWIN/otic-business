import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { AIDataService } from '@/services/aiDataService'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Brain, 
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3
} from 'lucide-react'
import AIInsights from '@/components/AIInsights'
import AIPredictions from '@/components/AIPredictions'
import { CardSkeleton, ChartSkeleton } from '@/components/ui/skeletons'

interface AnalyticsData {
  totalSales: number
  totalRevenue: number
  totalProducts: number
  averageOrderValue: number
  salesGrowth: number
  revenueGrowth: number
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  salesByDay: Array<{ date: string; sales: number; revenue: number }>
  salesByMonth: Array<{ month: string; sales: number; revenue: number }>
  lowStockItems: number
}

const AIInsightsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')

  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching analytics data for user:', user.id)
      
      // Use demo data if network fails
      let sales: any[] = []
      let products: any[] = []
      
      try {
      // First, let's test the connection and user authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error(`Authentication error: ${sessionError.message}`)
      }
      
      if (!session) {
        throw new Error('No active session found')
      }
      
      console.log('Current session:', session)
      console.log('Session user ID:', session.user.id)
      console.log('Context user ID:', user.id)
      
        // Fetch sales data with timeout
      console.log('Fetching sales data...')
        const salesPromise = supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)

        const salesResult = await Promise.race([
          salesPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Sales fetch timeout')), 10000))
        ]) as any

        if (salesResult.error) {
          console.error('Error fetching sales:', salesResult.error)
          throw new Error(`Failed to fetch sales data: ${salesResult.error.message}`)
        }
        sales = salesResult.data || []

        // Fetch products data with timeout
      console.log('Fetching products data...')
        const productsPromise = supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)

        const productsResult = await Promise.race([
          productsPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Products fetch timeout')), 10000))
        ]) as any

        if (productsResult.error) {
          console.error('Error fetching products:', productsResult.error)
          throw new Error(`Failed to fetch products data: ${productsResult.error.message}`)
        }
        products = productsResult.data || []
        console.log('Fetched products:', products.length, 'products')
        console.log('Sample product:', products[0])
        console.log('Products with stock:', products.filter(p => (p.current_stock || 0) > 0).length)
        
      } catch (networkError) {
        console.error('Network error, retrying with longer timeout:', networkError)
        // Retry with longer timeout instead of using demo data
        try {
          const retrySalesPromise = supabase
            .from('sales')
            .select('*')
            .eq('user_id', user.id)

          const retryProductsPromise = supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)

          const [retrySalesResult, retryProductsResult] = await Promise.all([
            Promise.race([
              retrySalesPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Sales fetch timeout')), 30000))
            ]) as any,
            Promise.race([
              retryProductsPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Products fetch timeout')), 30000))
            ]) as any
          ])

          if (retrySalesResult.error) throw retrySalesResult.error
          if (retryProductsResult.error) throw retryProductsResult.error

          sales = retrySalesResult.data || []
          products = retryProductsResult.data || []
          console.log('Retry - Fetched products:', products.length, 'products')
          console.log('Retry - Sample product:', products[0])
          console.log('Retry - Products with stock:', products.filter(p => (p.current_stock || 0) > 0).length)
        } catch (retryError) {
          console.error('Retry failed, showing empty state:', retryError)
          sales = []
          products = []
          // Show user-friendly error message instead of demo data
          toast.error('Unable to load live data. Please check your connection and try again.')
        }
      }

      // Calculate analytics
      const totalSales = sales?.length || 0
      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
      const totalProducts = products?.length || 0
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
      // Calculate real growth data
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const recentSales = sales?.filter(sale => 
        new Date(sale.created_at) >= thirtyDaysAgo
      ) || []
      const previousSales = sales?.filter(sale => 
        new Date(sale.created_at) >= sixtyDaysAgo && 
        new Date(sale.created_at) < thirtyDaysAgo
      ) || []

      const recentRevenue = recentSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
      const previousRevenue = previousSales.reduce((sum, sale) => sum + (sale.total || 0), 0)

      const salesGrowth = previousSales.length > 0 
        ? ((recentSales.length - previousSales.length) / previousSales.length) * 100 
        : 0
      const revenueGrowth = previousRevenue > 0 
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0
      const lowStockItems = products?.filter(p => (p.current_stock || 0) <= (p.min_stock || 5)).length || 0

      console.log('Analytics data calculated:', {
        totalSales,
        totalRevenue,
        totalProducts,
        averageOrderValue,
        salesGrowth,
        revenueGrowth,
        lowStockItems
      })
      
      // Debug: Check what products are being analyzed
      const lowStockProducts = products?.filter(p => (p.current_stock || 0) <= (p.min_stock || 5)) || []
      console.log('Low stock products:', lowStockProducts.length)
      console.log('Low stock products details:', lowStockProducts.map(p => ({
        name: p.name,
        current_stock: p.current_stock,
        min_stock: p.min_stock
      })))

      // Generate real chart data from actual sales
      const salesByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const daySales = sales?.filter(sale => {
          const saleDate = new Date(sale.created_at)
          return saleDate.toDateString() === date.toDateString()
        }) || []
        
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: daySales.length,
          revenue: daySales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        }
      })

      const salesByMonth = Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (11 - i))
        const monthSales = sales?.filter(sale => {
          const saleDate = new Date(sale.created_at)
          return saleDate.getMonth() === date.getMonth() && 
                 saleDate.getFullYear() === date.getFullYear()
        }) || []
        
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          sales: monthSales.length,
          revenue: monthSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        }
      })

      // Calculate real top products based on sales
      const productSales = products?.map(product => {
        const productSales = sales?.filter(sale => 
          sale.sale_items?.some(item => item.product?.name === product.name)
        ) || []
        const totalRevenue = productSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        
        return {
        name: product.name,
          sales: productSales.length,
          revenue: totalRevenue
        }
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 5) || []

      const analyticsData = {
        totalSales,
        totalRevenue,
        totalProducts,
        averageOrderValue,
        salesGrowth,
        revenueGrowth,
        topProducts: productSales,
        salesByDay,
        salesByMonth,
        lowStockItems,
        products: products || [],
        sales: sales || []
      }

      console.log('Setting analytics data:', analyticsData)
      setAnalyticsData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData()
  }
  }, [user?.id]) // Only depend on user.id, not the entire fetchAnalyticsData function

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* AI Chat Bot Skeleton */}
          <div className="mb-8">
            <ChartSkeleton />
          </div>

          {/* AI Insights Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CardSkeleton />
            <CardSkeleton />
          </div>

          {/* AI Predictions Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  if (!analyticsData || error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Data</h2>
              <p className="text-gray-600 mb-4">
                {error || 'There was an error connecting to the database. Please check your internet connection and try again.'}
              </p>
              <div className="space-x-4">
                <Button 
                  onClick={() => {
                    setError(null)
                    fetchAnalyticsData()
                  }}
                  className="bg-[#faa51a] hover:bg-[#faa51a]/90"
                >
                  Retry
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <img
                  src="/Otic icon@2x.png"
                  alt="Otic Business Logo"
                  className="h-8 w-8"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#040458]">Otic</span>
                  <span className="text-sm text-[#faa51a] -mt-1">Business</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1 shadow-md">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40 border-0 bg-transparent focus:ring-2 focus:ring-[#faa51a]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border-white/20">
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge className="bg-[#faa51a] text-white">
                {user?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#040458] mb-2">AI Business Insights</h1>
          <p className="text-gray-600">
            Get AI-powered insights, predictions, and recommendations for your business
          </p>
        </div>

        
        {/* AI Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AIInsights 
            type="sales" 
            data={{
              sales: analyticsData?.salesByDay || [],
              revenue: analyticsData?.totalRevenue || 0,
              growth: analyticsData?.salesGrowth || 0
            }}
          />
          <AIInsights 
            type="financial" 
            data={{
              revenue: analyticsData?.totalRevenue || 0,
              expenses: (analyticsData?.totalRevenue || 0) * 0.7, // Estimated expenses
              profit: (analyticsData?.totalRevenue || 0) * 0.3 // Estimated profit
            }}
          />
        </div>
        
        {/* AI Predictions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIPredictions 
            type="sales_forecast" 
            data={{
              sales: analyticsData?.salesByDay || [],
              timeframe: '30 days'
            }}
          />
          <AIPredictions 
            type="inventory_needs" 
            data={{
              products: analyticsData?.products || [],
              lowStockItems: analyticsData?.lowStockItems || 0
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default AIInsightsPage


