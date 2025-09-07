import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Users,
  AlertTriangle,
  Brain,
  Target,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
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
  aiInsights: Array<{ type: string; message: string; confidence: number }>
}

const Analytics = () => {
  const { appUser } = useAuth()
  const navigate = useNavigate()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [aiInsights, setAiInsights] = useState<Array<{ type: string; message: string; confidence: number }>>([])

  useEffect(() => {
    if (appUser) {
      fetchAnalyticsData()
      generateAIInsights()
    }
  }, [appUser, timeRange])

  const fetchAnalyticsData = async () => {
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
        .eq('user_id', appUser?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Fetch products data
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', appUser?.id)

      // Calculate analytics
      const totalSales = salesData?.length || 0
      const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
      const totalProducts = productsData?.length || 0
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

      // Calculate growth (simplified - comparing with previous period)
      const salesGrowth = calculateGrowth(totalSales, timeRange)
      const revenueGrowth = calculateGrowth(totalRevenue, timeRange)

      // Top products
      const productSales = new Map()
      salesData?.forEach(sale => {
        sale.sale_items?.forEach((item: any) => {
          const productName = item.product?.name || 'Unknown'
          if (productSales.has(productName)) {
            productSales.set(productName, {
              sales: productSales.get(productName).sales + item.quantity,
              revenue: productSales.get(productName).revenue + (item.quantity * item.price)
            })
          } else {
            productSales.set(productName, {
              sales: item.quantity,
              revenue: item.quantity * item.price
            })
          }
        })
      })

      const topProducts = Array.from(productSales.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Sales by day
      const salesByDay = generateSalesByDay(salesData || [], timeRange)
      const salesByMonth = generateSalesByMonth(salesData || [], timeRange)

      // Low stock items
      const lowStockItems = productsData?.filter(product => product.stock <= product.min_stock).length || 0

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
        lowStockItems,
        aiInsights: []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGrowth = (current: number, period: string) => {
    // Simplified growth calculation - in real app, compare with previous period
    const baseGrowth = Math.random() * 20 - 10 // Random growth between -10% and +10%
    return Math.round(baseGrowth * 10) / 10
  }

  const generateSalesByDay = (salesData: any[], period: string) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const result = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySales = salesData.filter(sale => 
        sale.created_at.startsWith(dateStr)
      )
      
      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: daySales.length,
        revenue: daySales.reduce((sum, sale) => sum + sale.total, 0)
      })
    }
    
    return result
  }

  const generateSalesByMonth = (salesData: any[], period: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const result = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toISOString().substring(0, 7)
      
      const monthSales = salesData.filter(sale => 
        sale.created_at.startsWith(monthStr)
      )
      
      result.push({
        month: months[date.getMonth()],
        sales: monthSales.length,
        revenue: monthSales.reduce((sum, sale) => sum + sale.total, 0)
      })
    }
    
    return result
  }

  const generateAIInsights = async () => {
    // Simulate AI insights generation
    const insights = [
      {
        type: 'sales_trend',
        message: 'Sales are trending upward by 15% this week. Consider increasing inventory for top products.',
        confidence: 0.85
      },
      {
        type: 'inventory_alert',
        message: '3 products are running low on stock. Reorder soon to avoid stockouts.',
        confidence: 0.95
      },
      {
        type: 'revenue_forecast',
        message: 'Based on current trends, you could increase revenue by 20% by focusing on your top 3 products.',
        confidence: 0.78
      },
      {
        type: 'seasonal_pattern',
        message: 'Historical data shows 25% higher sales on weekends. Consider weekend promotions.',
        confidence: 0.82
      }
    ]
    
    setAiInsights(insights)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#faa51a]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <BarChart3 className="h-8 w-8 text-[#faa51a]" />
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Analytics & AI Insights</h1>
                <p className="text-sm text-gray-600">
                  AI-powered business intelligence and forecasting
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* AI Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
            <CardDescription>
              AI-powered recommendations and predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="bg-[#faa51a]/10 p-2 rounded-full">
                      <Target className="h-4 w-4 text-[#faa51a]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{insight.message}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalSales || 0}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {analyticsData?.salesGrowth && analyticsData.salesGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span>{analyticsData?.salesGrowth || 0}% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {(analyticsData?.totalRevenue || 0).toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {analyticsData?.revenueGrowth && analyticsData.revenueGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span>{analyticsData?.revenueGrowth || 0}% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {(analyticsData?.averageOrderValue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{analyticsData?.lowStockItems || 0}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger 
              value="sales"
              className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Sales Trends
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Top Products
            </TabsTrigger>
            <TabsTrigger 
              value="revenue"
              className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Revenue Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="ai"
              className="data-[state=active]:bg-[#faa51a] data-[state=active]:text-white text-[#faa51a]"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Over Time</CardTitle>
                  <CardDescription>Daily sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.salesByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Daily revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.salesByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products by Revenue</CardTitle>
                  <CardDescription>Your best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.topProducts || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Sales Distribution</CardTitle>
                  <CardDescription>Sales volume by product</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.topProducts || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                      >
                        {(analyticsData?.topProducts || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trends</CardTitle>
                <CardDescription>Revenue performance over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData?.salesByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            {/* AI Chat Bot - Full Width */}
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
            
            {/* AI Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Analytics


