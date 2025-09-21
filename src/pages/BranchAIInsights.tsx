import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContextOptimized'
import { branchDataService, BranchAIInsight } from '@/services/branchDataService'
import { useDateRange } from '@/hooks/useDateRange'
import DateRangePicker from '@/components/DateRangePicker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Zap
} from 'lucide-react'

interface BranchData {
  id: string
  branch_name: string
  branch_code: string
  address: string
  city: string
  is_active: boolean
}

interface AIInsight {
  id: string
  insight_type: 'sales_prediction' | 'inventory_optimization' | 'customer_behavior' | 'staff_performance' | 'revenue_forecast' | 'demand_forecast' | 'price_optimization'
  title: string
  description: string
  confidence_score: number
  impact_level: 'high' | 'medium' | 'low'
  actionable: boolean
  created_at: string
  data: any
}

interface BranchMetrics {
  total_sales: number
  total_customers: number
  avg_transaction_value: number
  top_products: Array<{name: string, sales: number}>
  peak_hours: Array<{hour: number, sales: number}>
  staff_performance: Array<{name: string, sales: number, efficiency: number}>
}

const BranchAIInsights: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [branch, setBranch] = useState<BranchData | null>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [metrics, setMetrics] = useState<BranchMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  
  // Date range management
  const { dateRange, updateDateRange, minDate, maxDate, dateRangeString, loading: dateLoading } = useDateRange()

  useEffect(() => {
    if (branchId) {
      loadBranchData()
    }
  }, [branchId])

  useEffect(() => {
    if (branchId && dateRange.from && dateRange.to) {
      loadInsights()
      loadMetrics()
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

  const loadInsights = async () => {
    try {
      setLoading(true)
      
      if (!branchId) return
      
      // Generate new AI insights
      await branchDataService.generateAIInsights(branchId)
      
      // Load existing insights
      const liveInsights = await branchDataService.getAIInsights(branchId)
      
      // Map live insights to the expected format
      const mappedInsights: AIInsight[] = liveInsights.map(insight => ({
        id: insight.id,
        insight_type: insight.insight_type,
        title: insight.title,
        description: insight.description,
        confidence_score: insight.confidence_score,
        impact_level: insight.impact_level,
        actionable: insight.actionable,
        created_at: insight.created_at,
        data: insight.insight_data
      }))
      
      setInsights(mappedInsights)
      
      // If no insights exist, show empty state with proper message
      if (mappedInsights.length === 0) {
        console.log('No AI insights available for this branch')
        setInsights([])
        toast.info('No AI insights available yet. Generate some sales and inventory data to get started.')
      }
    } catch (error) {
      console.error('Error loading insights:', error)
      toast.error('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  const loadMetrics = async () => {
    try {
      if (!branchId || !dateRange.from || !dateRange.to) return
      
      // Use the selected date range
      const startDate = dateRange.from.toISOString().split('T')[0]
      const endDate = dateRange.to.toISOString().split('T')[0]
      
      // Load real-time metrics
      const realTimeMetrics = await branchDataService.collectRealTimeMetrics(branchId)
      
      // Get product performance data
      const productPerformance = await branchDataService.getProductPerformance(branchId, startDate, endDate)
      
      // Get staff performance data
      const staffPerformance = await branchDataService.getStaffPerformance(branchId, startDate, endDate)
      
      // Map live data to the expected format
      const liveMetrics: BranchMetrics = {
        total_sales: realTimeMetrics.daily.total_sales,
        total_customers: realTimeMetrics.daily.total_customers,
        avg_transaction_value: realTimeMetrics.daily.average_transaction_value,
        top_products: productPerformance.slice(0, 5).map(product => ({
          name: product.product_name,
          sales: product.total_quantity_sold
        })),
        peak_hours: realTimeMetrics.hourly.map(hour => ({
          hour: hour.hour_of_day,
          sales: hour.sales_amount
        })),
        staff_performance: staffPerformance.map(staff => ({
          name: staff.staff_name,
          sales: staff.total_sales,
          efficiency: staff.efficiency_score
        }))
      }

      setMetrics(liveMetrics)
    } catch (error) {
      console.error('Error loading metrics:', error)
      toast.error('Failed to load branch metrics')
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'sales_prediction': return <TrendingUp className="h-5 w-5" />
      case 'inventory_optimization': return <ShoppingCart className="h-5 w-5" />
      case 'customer_behavior': return <Users className="h-5 w-5" />
      case 'staff_performance': return <Target className="h-5 w-5" />
      case 'revenue_forecast': return <DollarSign className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI insights...</p>
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
                  AI Insights - {branch?.branch_name}
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
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.map((insight) => (
                <Card 
                  key={insight.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedInsight(insight)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.insight_type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <Badge className={getImpactColor(insight.impact_level)}>
                        {insight.impact_level}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {insight.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Confidence:</span>
                        <span className={`font-semibold ${getConfidenceColor(insight.confidence_score)}`}>
                          {insight.confidence_score}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {insight.actionable ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {insight.actionable ? 'Actionable' : 'Info'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Key Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {metrics.total_sales.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.total_customers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +8% from last period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {metrics.avg_transaction_value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +5% from last period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94%</div>
                    <p className="text-xs text-muted-foreground">
                      +3% from last period
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Products */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Best performing products this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.top_products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#040458] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{product.sales} units</div>
                          <div className="text-sm text-gray-500">UGX {(product.sales * 1000).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>AI Predictions</span>
                </CardTitle>
                <CardDescription>
                  Machine learning predictions for this branch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-lg mb-2">Sales Forecast</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Next 7 days predicted sales
                      </p>
                      <div className="text-2xl font-bold text-green-600">
                        UGX 28,500
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        +15% from current average
                      </p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-lg mb-2">Customer Traffic</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Expected daily customers
                      </p>
                      <div className="text-2xl font-bold text-blue-600">
                        180
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        +8% from current average
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>AI Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Actionable recommendations to improve branch performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Staff Optimization</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Increase staff during peak hours (2-4 PM) to improve customer service and reduce wait times.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      View Staff Schedule
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Inventory Management</h4>
                    <p className="text-sm text-green-800 mb-3">
                      Restock Coca Cola 500ml immediately to prevent stockouts during peak demand.
                    </p>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Manage Inventory
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Product Placement</h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      Move high-margin products to eye-level shelves to increase sales by 12%.
                    </p>
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                      Update Layout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedInsight.title}
                </h3>
                <Button
                  onClick={() => setSelectedInsight(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">{selectedInsight.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Confidence Score:</span>
                    <div className={`text-lg font-semibold ${getConfidenceColor(selectedInsight.confidence_score)}`}>
                      {selectedInsight.confidence_score}%
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Impact Level:</span>
                    <Badge className={getImpactColor(selectedInsight.impact_level)}>
                      {selectedInsight.impact_level}
                    </Badge>
                  </div>
                </div>
                
                {selectedInsight.data && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Data:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedInsight.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchAIInsights
