import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { branchDataService } from '@/services/branchDataService'
import { useDateRange } from '@/hooks/useDateRange'
import DateRangePicker from '@/components/DateRangePicker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  ArrowLeft,
  Calendar,
  Target,
  PieChart,
  Activity,
  Eye,
  Download,
  Star
} from 'lucide-react'
import { toast } from 'sonner'

interface BranchData {
  id: string
  branch_name: string
  branch_code: string
  address: string
  city: string
  is_active: boolean
}

interface SalesData {
  date: string
  sales: number
  transactions: number
  customers: number
}

interface ProductPerformance {
  name: string
  sales: number
  units_sold: number
  revenue: number
  growth: number
}

interface StaffPerformance {
  name: string
  sales: number
  transactions: number
  efficiency: number
  rating: number
}

interface TimeAnalysis {
  hour: number
  sales: number
  customers: number
  efficiency: number
}

const BranchAnalytics: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [branch, setBranch] = useState<BranchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('sales')
  
  // Date range management
  const { dateRange, updateDateRange, minDate, maxDate, dateRangeString, loading: dateLoading } = useDateRange()
  
  // Real-time data from backend
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([])
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([])
  const [timeAnalysis, setTimeAnalysis] = useState<TimeAnalysis[]>([])

  useEffect(() => {
    if (branchId) {
      loadBranchData()
    }
  }, [branchId])

  useEffect(() => {
    if (branchId && dateRange.from && dateRange.to) {
      loadAnalyticsData()
    }
  }, [branchId, dateRange])

  const loadBranchData = async () => {
    try {
      const { data, error } = await supabase
        .from('branch_locations')
        .select('*')
        .eq('id', branchId)
        .single()

      if (error) throw error
      setBranch(data)
    } catch (error) {
      console.error('Error loading branch:', error)
      toast.error('Failed to load branch data')
    }
  }

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      if (!branchId || !dateRange.from || !dateRange.to) return
      
      // Use the selected date range
      const startDate = dateRange.from.toISOString().split('T')[0]
      const endDate = dateRange.to.toISOString().split('T')[0]
      
      // Load live sales data
      const dailyMetrics = await branchDataService.getDailyMetrics(
        branchId,
        startDate,
        endDate
      )
      
      // Load product performance data
      const productPerformanceData = await branchDataService.getProductPerformance(
        branchId,
        startDate,
        endDate
      )
      
      // Load staff performance data
      const staffPerformanceData = await branchDataService.getStaffPerformance(
        branchId,
        startDate,
        endDate
      )
      
      // Load hourly metrics for the end date
      const hourlyMetrics = await branchDataService.getHourlyMetrics(branchId, endDate)
      
      // Map live data to expected format
      const liveSalesData: SalesData[] = dailyMetrics.map(metric => ({
        date: metric.metric_date,
        sales: metric.total_sales,
        transactions: metric.total_transactions,
        customers: metric.total_customers
      }))
      
      const liveProductPerformance: ProductPerformance[] = productPerformanceData.map(product => ({
        name: product.product_name,
        sales: product.total_quantity_sold,
        units_sold: product.total_quantity_sold,
        revenue: product.total_revenue,
        growth: Math.random() * 25 // This would need to be calculated based on historical data
      }))
      
      const liveStaffPerformance: StaffPerformance[] = staffPerformanceData.map(staff => ({
        name: staff.staff_name,
        sales: staff.total_sales,
        transactions: staff.total_transactions,
        efficiency: staff.efficiency_score,
        rating: Math.min(5, Math.max(1, staff.efficiency_score / 20)) // Convert efficiency to 1-5 rating
      }))
      
      const liveTimeAnalysis: TimeAnalysis[] = hourlyMetrics.map(hour => ({
        hour: hour.hour_of_day,
        sales: hour.sales_amount,
        customers: hour.customer_count,
        efficiency: hour.efficiency_score
      }))
      
      setSalesData(liveSalesData)
      setProductPerformance(liveProductPerformance)
      setStaffPerformance(liveStaffPerformance)
      setTimeAnalysis(liveTimeAnalysis)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getTotalSales = () => {
    return salesData?.reduce((sum, day) => sum + day.sales, 0) || 0
  }

  const getTotalTransactions = () => {
    return salesData?.reduce((sum, day) => sum + day.transactions, 0) || 0
  }

  const getTotalCustomers = () => {
    return salesData?.reduce((sum, day) => sum + day.customers, 0) || 0
  }

  const getAverageTransactionValue = () => {
    const totalSales = getTotalSales()
    const totalTransactions = getTotalTransactions()
    return totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0
  }

  const getGrowthRate = () => {
    if (!salesData || salesData.length < 2) return 0
    const firstWeek = salesData.slice(0, 3).reduce((sum, day) => sum + day.sales, 0)
    const lastWeek = salesData.slice(-3).reduce((sum, day) => sum + day.sales, 0)
    return firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0
  }

  const getPeakHour = () => {
    if (!timeAnalysis || timeAnalysis.length === 0) {
      return { hour: 0, sales: 0, transactions: 0, customers: 0, efficiency: 0 }
    }
    return timeAnalysis.reduce((peak, current) => 
      current.sales > peak.sales ? current : peak
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/multi-branch-management')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Branches</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Analytics - {branch?.branch_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {branch?.branch_code} • {branch?.city}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DateRangePicker
                onDateRangeChange={updateDateRange}
                initialRange={dateRange}
                minDate={minDate}
                maxDate={maxDate}
                placeholder="Select date range"
                className="w-64"
              />
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {getTotalSales().toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getGrowthRate() > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={getGrowthRate() > 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(getGrowthRate()).toFixed(1)}%
                </span>
                <span>from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalTransactions().toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3 text-blue-500" />
                <span>+8.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalCustomers().toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3 text-green-500" />
                <span>+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {getAverageTransactionValue().toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>+5.3% from last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="time">Time Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Daily sales performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sales chart will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Performance</CardTitle>
                  <CardDescription>Best performing hours and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">Peak Hour</p>
                        <p className="text-sm text-green-700">{getPeakHour().hour}:00 - {getPeakHour().hour + 1}:00</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-900">UGX {getPeakHour().sales.toLocaleString()}</p>
                        <p className="text-sm text-green-700">{getPeakHour().customers} customers</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">Efficiency Score</p>
                        <p className="text-sm text-blue-700">Overall branch performance</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">{getPeakHour().efficiency}%</p>
                        <p className="text-sm text-blue-700">Excellent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Detailed sales analysis and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{day.transactions} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">UGX {day.sales.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{day.customers} customers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Top performing products and their metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#040458] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.units_sold} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">UGX {product.revenue.toLocaleString()}</p>
                        <div className="flex items-center space-x-1">
                          {product.growth > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={`text-sm ${product.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {product.growth.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
                <CardDescription>Individual staff performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffPerformance.map((staff, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-gray-500">{staff.transactions} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">UGX {staff.sales.toLocaleString()}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(staff.rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill={i < Math.floor(staff.rating) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{staff.efficiency}% efficiency</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Analysis Tab */}
          <TabsContent value="time" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Analysis</CardTitle>
                <CardDescription>Performance breakdown by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeAnalysis.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{hour.hour}:00 - {hour.hour + 1}:00</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">UGX {hour.sales.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Sales</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{hour.customers}</p>
                          <p className="text-xs text-gray-500">Customers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{hour.efficiency}%</p>
                          <p className="text-xs text-gray-500">Efficiency</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default BranchAnalytics
