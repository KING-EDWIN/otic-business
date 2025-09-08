import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Settings,
  RefreshCw,
  Download,
  BarChart3,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Brain,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Send,
  MessageSquare,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  Printer,
  Share2,
  Calculator,
  PieChart,
  Lightbulb,
  AlertTriangle,
  Eye,
  Package,
  Building2,
  Target,
  Zap,
  Activity,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserInfo } from '@/utils/userUtils'
import { realQuickBooksService } from '@/services/realQuickBooksService'
import { AIAnalytics } from '@/services/aiService'
import { toast } from 'sonner'

interface FinancialMetrics {
  totalRevenue: number
  netIncome: number
  vatCollected: number
  efrisVat: number
  totalExpenses: number
  profitMargin: number
  growthRate: number
}

interface RecentInvoice {
  id: string
  invoiceNumber: string
  customerName: string
  amount: number
  date: string
  status: 'paid' | 'pending' | 'overdue'
}

interface AIInsight {
  title: string
  description: string
  type: 'revenue' | 'expense' | 'tax' | 'growth' | 'warning'
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
}

const Accounting = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [isConnected, setIsConnected] = useState(false)
  const [lastSync, setLastSync] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    netIncome: 0,
    vatCollected: 0,
    efrisVat: 0,
    totalExpenses: 0,
    profitMargin: 0,
    growthRate: 0
  })
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [showReportViewer, setShowReportViewer] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Financial summary' },
    { id: 'invoices', label: 'Invoices', icon: FileText, description: 'Manage invoices' },
    { id: 'customers', label: 'Customers', icon: Users, description: 'Customer management' },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet, description: 'Financial reports' },
    { id: 'taxes', label: 'Taxes & EFRIS', icon: Calculator, description: 'Tax management' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Account settings' }
  ]

  useEffect(() => {
    checkConnection()
    fetchFinancialData()
    generateAIInsights()
  }, [])

  const checkConnection = async () => {
    try {
      const isQBConnected = await realQuickBooksService.isConnected()
      setIsConnected(isQBConnected)
      if (isQBConnected) {
        setLastSync(new Date().toLocaleString())
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      
      // Fetch from Supabase first
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (salesError) throw salesError

      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
      const vatCollected = totalRevenue * 0.18 // 18% VAT
      const totalExpenses = totalRevenue * 0.1 // Assume 10% expenses
      const netIncome = totalRevenue - totalExpenses
      const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0

      setMetrics({
        totalRevenue,
        netIncome,
        vatCollected,
        efrisVat: vatCollected, // Same as VAT for EFRIS
        totalExpenses,
        profitMargin,
        growthRate: 12 // Mock growth rate
      })

      // Fetch recent invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('sales')
        .select('id, total, created_at, customer_name')
        .order('created_at', { ascending: false })
        .limit(5)

      if (invoicesError) throw invoicesError

      const invoices = invoicesData?.map((sale, index) => ({
        id: sale.id,
        invoiceNumber: `INV-${String(index + 1).padStart(3, '0')}`,
        customerName: sale.customer_name || 'Customer',
        amount: sale.total || 0,
        date: new Date(sale.created_at).toLocaleDateString(),
        status: 'paid' as const
      })) || []

      setRecentInvoices(invoices)

    } catch (error) {
      console.error('Error fetching financial data:', error)
      toast.error('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }

  const generateAIInsights = async () => {
    try {
      const insights: AIInsight[] = [
        {
          title: "Revenue Growth Opportunity",
          description: "Your revenue has grown by 12% this month. Consider expanding your product range to capitalize on this momentum.",
          type: "revenue",
          priority: "high",
          actionable: true
        },
        {
          title: "Tax Optimization",
          description: "Your VAT collection is properly aligned with EFRIS requirements. Consider implementing automated tax reporting.",
          type: "tax",
          priority: "medium",
          actionable: true
        },
        {
          title: "Expense Management",
          description: "Your expense ratio is healthy at 10%. Monitor for any unusual spikes in operational costs.",
          type: "expense",
          priority: "low",
          actionable: false
        },
        {
          title: "Cash Flow Alert",
          description: "Consider implementing payment terms to improve cash flow and reduce outstanding receivables.",
          type: "warning",
          priority: "medium",
          actionable: true
        }
      ]
      setAiInsights(insights)
    } catch (error) {
      console.error('Error generating AI insights:', error)
    }
  }

  const handleSync = async () => {
    try {
      setLoading(true)
      await realQuickBooksService.syncData()
      setLastSync(new Date().toLocaleString())
      toast.success('Data synchronized successfully!')
    } catch (error) {
      console.error('Error syncing data:', error)
      toast.error('Failed to sync data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = (reportType: string) => {
    setSelectedReport({ type: reportType, data: metrics })
    setShowReportViewer(true)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue': return TrendingUp
      case 'expense': return TrendingDown
      case 'tax': return Calculator
      case 'growth': return Target
      case 'warning': return AlertTriangle
      default: return Lightbulb
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'revenue': return 'text-green-600 bg-green-50 border-green-200'
      case 'expense': return 'text-red-600 bg-red-50 border-red-200'
      case 'tax': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'growth': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#faa51a] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Accounting Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#040458]">Accounting Dashboard</h1>
                  <p className="text-sm text-gray-600">Complete financial management with AI insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                {isConnected ? 'Connected' : 'Offline'}
              </Badge>
              <Button
                onClick={handleSync}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-sm shadow-lg border-r border-gray-200/50">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#040458] mb-6">Navigation</h2>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-[#040458] text-white shadow-md'
                        : 'text-gray-600 hover:bg-[#040458]/10 hover:text-[#040458]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Connection Status */}
              {isConnected && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    System connected successfully. Last sync: {lastSync}
                  </AlertDescription>
                </Alert>
              )}

              {/* Financial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-3xl font-bold text-[#040458]">UGX {metrics.totalRevenue.toLocaleString()}</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <TrendingUpIcon className="h-4 w-4 mr-1" />
                          +{metrics.growthRate}% from last month
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Net Income</p>
                        <p className="text-3xl font-bold text-[#040458]">UGX {metrics.netIncome.toLocaleString()}</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Profitable
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">VAT Collected</p>
                        <p className="text-3xl font-bold text-[#040458]">UGX {metrics.vatCollected.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">18% VAT Rate</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">EFRIS VAT</p>
                        <p className="text-3xl font-bold text-[#040458]">UGX {metrics.efrisVat.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">EFRIS System</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Brain className="h-6 w-6 mr-3" />
                    AI Financial Insights
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    Intelligent analysis of your financial performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiInsights.map((insight, index) => {
                      const Icon = getInsightIcon(insight.type)
                      return (
                        <div key={index} className="bg-white/10 p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-5 w-5 text-white" />
                              <h4 className="font-semibold text-white">{insight.title}</h4>
                            </div>
                            <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-white/90 text-sm">{insight.description}</p>
                          {insight.actionable && (
                            <Button size="sm" className="mt-3 bg-white text-[#040458] hover:bg-white/90">
                              Take Action
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#040458] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Create Invoice</h3>
                    <p className="text-sm text-gray-600">Generate new invoices</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#faa51a] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Add Customer</h3>
                    <p className="text-sm text-gray-600">Manage customers</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FileSpreadsheet className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Generate Report</h3>
                    <p className="text-sm text-gray-600">Financial reports</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Sync Data</h3>
                    <p className="text-sm text-gray-600">Sync with systems</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Invoices */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-[#faa51a]" />
                    Recent Invoices
                  </CardTitle>
                  <CardDescription>Latest invoice activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-600">{invoice.customerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#040458]">UGX {invoice.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{invoice.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Invoice Management</CardTitle>
                  <CardDescription>Create and manage your invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Management</h3>
                    <p className="text-gray-600 mb-4">Create, edit, and track your invoices</p>
                    <Button className="bg-[#040458] hover:bg-[#040458]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Customer Management</CardTitle>
                  <CardDescription>Manage your customer database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Management</h3>
                    <p className="text-gray-600 mb-4">Add, edit, and manage customer information</p>
                    <Button className="bg-[#040458] hover:bg-[#040458]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>Generate and view financial reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Profit & Loss', icon: TrendingUp, color: 'bg-green-500' },
                      { name: 'Balance Sheet', icon: BarChart3, color: 'bg-blue-500' },
                      { name: 'Cash Flow', icon: Activity, color: 'bg-purple-500' },
                      { name: 'Tax Report', icon: Calculator, color: 'bg-orange-500' },
                      { name: 'Sales Report', icon: DollarSign, color: 'bg-yellow-500' },
                      { name: 'Expense Report', icon: TrendingDown, color: 'bg-red-500' }
                    ].map((report) => {
                      const Icon = report.icon
                      return (
                        <Card key={report.name} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6 text-center">
                            <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGenerateReport(report.name)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Report
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'taxes' && (
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Taxes & EFRIS</CardTitle>
                  <CardDescription>Manage your tax obligations and EFRIS compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Management</h3>
                    <p className="text-gray-600 mb-4">Manage VAT, EFRIS, and other tax obligations</p>
                    <Button className="bg-[#040458] hover:bg-[#040458]/90">
                      <Calculator className="h-4 w-4 mr-2" />
                      Manage Taxes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Configure your accounting preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
                    <p className="text-gray-600 mb-4">Configure your accounting system preferences</p>
                    <Button className="bg-[#040458] hover:bg-[#040458]/90">
                      <Settings className="h-4 w-4 mr-2" />
                      Open Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Report Viewer Modal */}
      <Dialog open={showReportViewer} onOpenChange={setShowReportViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Viewer</DialogTitle>
            <DialogDescription>
              Preview your report before downloading
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{selectedReport.type} Report</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-semibold">UGX {selectedReport.data.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Income:</span>
                    <span className="font-semibold">UGX {selectedReport.data.netIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT Collected:</span>
                    <span className="font-semibold">UGX {selectedReport.data.vatCollected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Margin:</span>
                    <span className="font-semibold">{selectedReport.data.profitMargin.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReportViewer(false)}>
                  Close
                </Button>
                <Button className="bg-[#040458] hover:bg-[#040458]/90">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Accounting
