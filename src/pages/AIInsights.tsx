import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import AIChatBot from '@/components/AIChatBot'
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
          new Promise((_, reject) => setTimeout(() => reject(new Error('Sales fetch timeout')), 3000))
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
        
      } catch (networkError) {
        console.error('Network error, using demo data:', networkError)
        // Use demo data when network fails
        sales = [
          { id: '1', total: 150000, created_at: new Date().toISOString() },
          { id: '2', total: 200000, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: '3', total: 175000, created_at: new Date(Date.now() - 172800000).toISOString() }
        ]
        products = [
          { id: '1', name: 'Sample Product 1', price: 5000, stock: 50 },
          { id: '2', name: 'Sample Product 2', price: 3000, stock: 25 },
          { id: '3', name: 'Sample Product 3', price: 8000, stock: 10 }
        ]
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
      const lowStockItems = products?.filter(p => (p.stock || 0) <= 5).length || 0

      console.log('Analytics data calculated:', {
        totalSales,
        totalRevenue,
        totalProducts,
        averageOrderValue,
        salesGrowth,
        revenueGrowth,
        lowStockItems
      })

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
        lowStockItems
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

        {/* AI Chat Bot - Full Width with More Space */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-[#040458] to-[#faa51a] p-1 rounded-xl shadow-2xl">
            <div className="bg-white rounded-lg p-2">
              <AIChatBot 
                businessData={{
                  sales: analyticsData?.salesByDay || [],
                  products: [], // This would be populated with actual product data
                  revenue: analyticsData?.totalRevenue || 0,
                  growth: analyticsData?.salesGrowth || 0,
                  lowStockItems: [],
                  user: user
                }}
              />
            </div>
          </div>
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
              products: [] // This would be populated with actual product data
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default AIInsightsPage


