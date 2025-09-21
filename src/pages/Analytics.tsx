import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DataService } from '@/services/dataService'
import { AnalyticsSkeleton } from '@/components/ui/skeletons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDateRange } from '@/hooks/useDateRange'
import DateRangePicker from '@/components/DateRangePicker'
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
import BusinessLoginStatus from '@/components/BusinessLoginStatus'

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
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [aiInsights, setAiInsights] = useState<Array<{ type: string; message: string; confidence: number }>>([])
  
  // Date range management
  const { dateRange, updateDateRange, minDate, maxDate, dateRangeString } = useDateRange()

  useEffect(() => {
    // Always fetch analytics data and generate insights
    fetchAnalyticsData()
    generateAIInsights()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    // Quick timeout to prevent long loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 3000) // 3 second max
    
    try {
      console.log('Fetching analytics data for user:', user?.id)
      setLoading(true)
      
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

      // Use DataService for analytics data
      const analyticsData = await DataService.getAnalyticsData(user?.id, timeRange)
      setAnalyticsData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      clearTimeout(timeoutId)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <AnalyticsSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#040458] to-[#1e1e6b] rounded-xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#040458] to-[#1e40af] bg-clip-text text-transparent">
                    Analytics & AI Insights
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    AI-powered business intelligence and forecasting
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Date Range Picker */}
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1 shadow-md">
                <DateRangePicker
                  onDateRangeChange={updateDateRange}
                  initialRange={dateRange}
                  minDate={minDate}
                  maxDate={maxDate}
                  placeholder="Select date range"
                  className="w-48 border-0 bg-transparent focus:ring-2 focus:ring-[#faa51a]/20"
                />
              </div>
              
              {/* Time Range Selector */}
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
              <BusinessLoginStatus />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* AI Insights */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#040458] to-[#1e40af] text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">AI Insights</span>
            </CardTitle>
            <CardDescription className="text-white/90">
              AI-powered recommendations and predictions powered by Mistral AI
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.map((insight, index) => (
                <div key={index} className="group p-6 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-[#faa51a] to-[#ff6b35] rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">{insight.message}</p>
                      <div className="flex items-center space-x-3 mt-4">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                        <Badge variant="outline" className="border-[#faa51a] text-[#faa51a] bg-[#faa51a]/5">
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
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Sales</CardTitle>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#040458]">{analyticsData?.totalSales || 0}</div>
              <div className="flex items-center space-x-2 text-sm mt-2">
                {analyticsData?.salesGrowth && analyticsData.salesGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-medium ${analyticsData?.salesGrowth && analyticsData.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.salesGrowth || 0}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#040458]">UGX {(analyticsData?.totalRevenue || 0).toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-sm mt-2">
                {analyticsData?.revenueGrowth && analyticsData.revenueGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-medium ${analyticsData?.revenueGrowth && analyticsData.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.revenueGrowth || 0}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Average Order</CardTitle>
              <div className="p-2 bg-gradient-to-r from-[#faa51a] to-[#ff6b35] rounded-lg shadow-md">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#040458]">UGX {(analyticsData?.averageOrderValue || 0).toLocaleString()}</div>
              <p className="text-sm text-gray-600 font-medium mt-2">Per transaction</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Low Stock Items</CardTitle>
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-md">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{analyticsData?.lowStockItems || 0}</div>
              <p className="text-sm text-gray-600 font-medium mt-2">Need restocking</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="sales" className="space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            <TabsList className="bg-transparent border-0">
              <TabsTrigger 
                value="sales"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Sales Trends
              </TabsTrigger>
              <TabsTrigger 
                value="products"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Top Products
              </TabsTrigger>
              <TabsTrigger 
                value="revenue"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Revenue Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="ai"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#faa51a] data-[state=active]:to-[#ff6b35] data-[state=active]:text-white text-[#faa51a] font-semibold rounded-lg transition-all duration-200"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Sales Over Time</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">Daily sales performance</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.salesByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Revenue Over Time</span>
                  </CardTitle>
                  <CardDescription className="text-green-100">Daily revenue performance</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.salesByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Top Products by Revenue</span>
                  </CardTitle>
                  <CardDescription className="text-purple-100">Your best performing products</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.topProducts || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="url(#purpleGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Product Sales Distribution</span>
                  </CardTitle>
                  <CardDescription className="text-pink-100">Sales volume by product</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.topProducts || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#ec4899"
                        dataKey="sales"
                      >
                        {(analyticsData?.topProducts || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Monthly Revenue Trends</span>
                </CardTitle>
                <CardDescription className="text-emerald-100">Revenue performance over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData?.salesByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="url(#emeraldGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            {/* AI Chat Bot - Full Width */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[#faa51a] to-[#ff6b35] text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Brain className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold">AI Business Assistant</span>
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Powered by Mistral AI - Get intelligent insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
            
            {/* AI Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Sales AI Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AIInsights 
                    type="sales" 
                    data={{
                      sales: analyticsData?.salesByDay || [],
                      revenue: analyticsData?.totalRevenue || 0,
                      growth: analyticsData?.salesGrowth || 0
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Financial AI Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AIInsights 
                    type="financial" 
                    data={{
                      revenue: analyticsData?.totalRevenue || 0,
                      expenses: (analyticsData?.totalRevenue || 0) * 0.7, // Estimated expenses
                      profit: (analyticsData?.totalRevenue || 0) * 0.3 // Estimated profit
                    }}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* AI Predictions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Sales Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AIPredictions 
                    type="sales_forecast" 
                    data={{
                      sales: analyticsData?.salesByDay || [],
                      timeframe: '30 days'
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Inventory Predictions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AIPredictions 
                    type="inventory_needs" 
                    data={{
                      products: [] // This would be populated with actual product data
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Analytics


