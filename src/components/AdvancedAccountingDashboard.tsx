import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart,
  FileText,
  Calculator,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Users,
  Package,
  CreditCard,
  Building2,
  Zap
} from 'lucide-react'
import { advancedQuickBooksService } from '@/services/advancedQuickBooksService'
import { aiAccountingService } from '@/services/aiAccountingService'
import { getCurrentUserInfo } from '@/utils/userUtils'
import { toast } from 'sonner'

interface DashboardMetrics {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  grossProfit: number
  operatingExpenses: number
  accountsReceivable: number
  accountsPayable: number
  cashBalance: number
  totalAssets: number
  totalLiabilities: number
  equity: number
}

interface AIInsight {
  type: 'warning' | 'opportunity' | 'trend' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: string
}

interface AIPrediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
}

const AdvancedAccountingDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [predictions, setPredictions] = useState<AIPrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [metricsData, insightsData, predictionsData] = await Promise.all([
        advancedQuickBooksService.getFinancialMetrics(),
        aiAccountingService.generateAIInsights(),
        aiAccountingService.generatePredictions()
      ])

      setMetrics(metricsData)
      setInsights(insightsData)
      setPredictions(predictionsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-500" />
      case 'recommendation': return <Brain className="h-5 w-5 text-purple-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Loading Advanced Dashboard</h2>
          <p className="text-gray-600">Analyzing your financial data with AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Accounting Dashboard</h1>
                <p className="text-gray-600">AI-Powered Financial Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadDashboardData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Total Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(metrics?.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900">Net Income</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${(metrics?.netIncome || 0) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatCurrency(metrics?.netIncome || 0)}
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    {(metrics?.netIncome || 0) >= 0 ? 'Profitable' : 'Loss'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900">Cash Balance</CardTitle>
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatCurrency(metrics?.cashBalance || 0)}
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    Available liquidity
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900">Total Assets</CardTitle>
                  <Building2 className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(metrics?.totalAssets || 0)}
                  </div>
                  <p className="text-xs text-orange-700 mt-1">
                    Business value
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Financial Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-2xl font-bold text-green-600">85/100</span>
                  </div>
                  <Progress value={85} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">Excellent</div>
                      <div className="text-gray-600">Cash Flow</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">Good</div>
                      <div className="text-gray-600">Profitability</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">Excellent</div>
                      <div className="text-gray-600">Growth</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <FileText className="h-6 w-6 mb-2" />
                Generate P&L
              </Button>
              <Button className="h-20 flex flex-col bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <BarChart3 className="h-6 w-6 mb-2" />
                Balance Sheet
              </Button>
              <Button className="h-20 flex flex-col bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                <PieChart className="h-6 w-6 mb-2" />
                Cash Flow
              </Button>
              <Button className="h-20 flex flex-col bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Download className="h-6 w-6 mb-2" />
                Export Data
              </Button>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
                <p className="text-gray-600">Intelligent analysis of your financial data</p>
              </div>
              <Button onClick={() => aiAccountingService.autoCategorizeTransactions()}>
                <Brain className="h-4 w-4 mr-2" />
                Auto-Categorize
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <Card key={index} className={`border-l-4 ${getInsightColor(insight.impact)}`}>
                  <CardHeader>
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : 
                                       insight.impact === 'medium' ? 'default' : 'secondary'}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{insight.description}</p>
                    {insight.action && (
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm font-medium text-gray-900">Recommended Action:</p>
                        <p className="text-sm text-gray-600">{insight.action}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">AI Predictions</h2>
              <p className="text-gray-600">Forecasted financial performance based on current trends</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {predictions.map((prediction, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {prediction.metric}
                      <Badge variant="outline">{prediction.timeframe}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current</span>
                        <span className="font-semibold">{formatCurrency(prediction.currentValue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Predicted</span>
                        <span className="font-semibold text-green-600">{formatCurrency(prediction.predictedValue)}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence</span>
                          <span>{(prediction.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={prediction.confidence * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Financial Reports</h2>
              <p className="text-gray-600">Comprehensive financial analysis and reporting</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Profit & Loss
                  </CardTitle>
                  <CardDescription>Income statement with detailed breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate P&L
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-green-600" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>Assets, liabilities, and equity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Balance Sheet
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    Cash Flow
                  </CardTitle>
                  <CardDescription>Cash flow analysis and projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Cash Flow
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">AI Settings</h2>
              <p className="text-gray-600">Configure AI-powered features and automation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Categorization</CardTitle>
                  <CardDescription>Automatically categorize transactions using AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Enable Auto-Categorization</span>
                      <Button size="sm" variant="outline">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidence Threshold</span>
                      <Select defaultValue="80">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="70">70%</SelectItem>
                          <SelectItem value="80">80%</SelectItem>
                          <SelectItem value="90">90%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>Configure AI-powered financial insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Daily Insights</span>
                      <Button size="sm" variant="outline">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Predictive Analytics</span>
                      <Button size="sm" variant="outline">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Anomaly Detection</span>
                      <Button size="sm" variant="outline">Enable</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdvancedAccountingDashboard

