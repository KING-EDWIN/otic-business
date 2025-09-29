import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AIDataService } from '@/services/aiDataService'
import { toast } from 'sonner'
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  BarChart3, 
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react'
import AIInsights from '@/components/AIInsights'
import AIPredictions from '@/components/AIPredictions'
import BusinessLoginStatus from '@/components/BusinessLoginStatus'

interface AnalyticsData {
  totalSales: number
  totalRevenue: number
  totalProducts: number
  averageOrderValue: number
  salesGrowth: number
  revenueGrowth: number
  topProducts: any[]
  salesByDay: any[]
  salesByMonth: any[]
  lowStockItems: number
  products: any[]
  sales: any[]
}

const AIInsightsPage = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('30d')

  // Redirect to business signin if no user
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/business-signin')
    }
  }, [authLoading, user, navigate])

  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) {
      throw new Error('No user ID available')
    }
    
    console.log('🤖 AI Insights: Fetching comprehensive business data for user:', user.id)
    return await AIDataService.getBusinessDataForAI(user.id)
  }, [user?.id])

  const {
    data: analyticsData,
    loading,
    error,
    progress,
    hasInitialData,
    retry
  } = useProgressiveLoading(fetchAnalyticsData, {
    initialTimeout: 3000,
    fallbackTimeout: 8000,
    retryAttempts: 2,
    retryDelay: 2000,
    enabled: !!user?.id // Only enable when user is available
  })

  // Generate chart data when analytics data is available
  const salesByDay = analyticsData ? Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
    const daySales = analyticsData.sales.filter(sale => {
          const saleDate = new Date(sale.created_at)
          return saleDate.toDateString() === date.toDateString()
        })
        
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: daySales.length,
          revenue: daySales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        }
  }) : []

  const salesByMonth = analyticsData ? Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (11 - i))
    const monthSales = analyticsData.sales.filter(sale => {
          const saleDate = new Date(sale.created_at)
          return saleDate.getMonth() === date.getMonth() && 
                 saleDate.getFullYear() === date.getFullYear()
        })
        
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          sales: monthSales.length,
          revenue: monthSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        }
  }) : []

  // Show loading state while auth is loading or when no user
  if (authLoading || (!user && !hasInitialData)) {
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

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading AI Insights</span>
                </CardTitle>
                <CardDescription>
                  Analyzing your business data to generate intelligent insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#040458] to-[#faa51a] h-2 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {progress < 30 ? '🔍 Fetching business data...' : 
                     progress < 60 ? '📊 Processing analytics...' : 
                     progress < 90 ? '🤖 Generating AI insights...' : '✨ Finalizing...'}
                  </p>
          </div>
              </CardContent>
            </Card>

            {/* Loading Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-32 bg-gray-200 rounded"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      </div>
                <div className="space-y-3">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
          </div>
                  </CardContent>
                </Card>
            ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 w-fit"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 lg:p-3 bg-gradient-to-r from-[#040458] to-[#1e1e6b] rounded-xl shadow-lg">
                    <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-[#040458] to-[#1e40af] bg-clip-text text-transparent">
                      AI Business Insights
                    </h1>
                    <p className="text-xs lg:text-sm text-gray-600 font-medium">
                      AI-powered business intelligence and forecasting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Error State */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load AI Insights</h2>
              <p className="text-gray-600 mb-6">
                We encountered an issue while loading your AI insights data. This could be due to a temporary connection issue or a problem with our servers.
              </p>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                  <p className="text-sm text-red-700 font-mono">{error}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={retry} 
                    className="bg-[#040458] hover:bg-[#030345] text-white flex items-center space-x-2"
                  >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
                </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="border-[#faa51a] text-[#faa51a] hover:bg-[#faa51a] hover:text-white"
                  >
                    Go to Dashboard
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.open('mailto:support@oticbusiness.com?subject=AI Insights Loading Error', '_blank')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Report Issue
                  </Button>
                </div>
                
                <div className="text-sm text-gray-500 mt-6">
                  <p>If this problem persists, please contact our support team.</p>
                  <p>Error ID: {Date.now().toString(36)}</p>
                </div>
              </div>
            </div>
        </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 lg:p-3 bg-gradient-to-r from-[#040458] to-[#1e1e6b] rounded-xl shadow-lg">
                  <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-[#040458] to-[#1e40af] bg-clip-text text-transparent">
                    AI Business Insights
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">
                    AI-powered business intelligence and forecasting
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white w-full sm:w-auto"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-3xl font-bold text-[#040458] mb-2">AI Business Insights</h1>
          <p className="text-sm lg:text-base text-gray-600">
            Get AI-powered insights, predictions, and recommendations for your business
          </p>
        </div>

        {/* Business Status */}
        <div className="mb-6 lg:mb-8">
          <BusinessLoginStatus />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">UGX {analyticsData?.totalRevenue.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData?.revenueGrowth > 0 ? '+' : ''}{analyticsData?.revenueGrowth.toFixed(1) || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">{analyticsData?.totalSales || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData?.salesGrowth > 0 ? '+' : ''}{analyticsData?.salesGrowth.toFixed(1) || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Total Products</CardTitle>
              <Package className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">{analyticsData?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData?.lowStockItems || 0} low stock items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Avg Order Value</CardTitle>
              <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">UGX {analyticsData?.averageOrderValue.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* AI Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <AIInsights 
            type="sales" 
            data={{
              sales: salesByDay,
              revenue: analyticsData?.totalRevenue || 0,
              growth: analyticsData?.salesGrowth || 0
            }}
          />
          <AIInsights 
            type="inventory" 
            data={{
              products: analyticsData?.products || [],
              lowStockItems: analyticsData?.products?.filter(p => (p.current_stock || 0) <= (p.min_stock || 5)) || []
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
        
        {/* AI Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <AIPredictions 
            type="sales_forecast" 
            data={{
              sales: salesByDay,
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
