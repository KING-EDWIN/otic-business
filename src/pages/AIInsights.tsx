import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
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

  useEffect(() => {
    if (appUser) {
      fetchAnalyticsData()
    }
  }, [appUser])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user?.id || '00000000-0000-0000-0000-000000000001')

      if (salesError) {
        console.error('Error fetching sales:', salesError)
      }

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id || '00000000-0000-0000-0000-000000000001')

      if (productsError) {
        console.error('Error fetching products:', productsError)
      }

      // Calculate analytics
      const totalSales = sales?.length || 0
      const totalRevenue = sales?.reduce((sum, sale) => sum + sale.total, 0) || 0
      const totalProducts = products?.length || 0
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
      const salesGrowth = 15.3 // Mock data
      const revenueGrowth = 12.7 // Mock data
      const lowStockItems = products?.filter(p => p.stock <= 5).length || 0

      // Generate mock chart data
      const salesByDay = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        sales: Math.floor(Math.random() * 10) + 1,
        revenue: Math.floor(Math.random() * 50000) + 10000
      }))

      const salesByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
        sales: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 200000) + 50000
      }))

      const topProducts = products?.slice(0, 5).map(product => ({
        name: product.name,
        sales: Math.floor(Math.random() * 20) + 1,
        revenue: product.price * (Math.floor(Math.random() * 20) + 1)
      })) || []

      setAnalyticsData({
        totalSales,
        totalRevenue,
        totalProducts,
        averageOrderValue,
        salesGrowth,
        revenueGrowth,
        topProducts,
        salesByDay,
        salesByMonth,
        lowStockItems
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#faa51a]"></div>
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
                {appUser?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan
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

        {/* AI Chat Bot - Full Width */}
        <div className="mb-8">
          <AIChatBot 
            businessData={{
              sales: analyticsData?.salesByDay || [],
              products: [], // This would be populated with actual product data
              revenue: analyticsData?.totalRevenue || 0,
              growth: analyticsData?.salesGrowth || 0,
              lowStockItems: [],
              user: appUser
            }}
          />
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

