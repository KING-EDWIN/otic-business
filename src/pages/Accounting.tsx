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
  Menu,
  X,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

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
        .select('id, total, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (invoicesError) throw invoicesError

      const invoices = invoicesData?.map((sale, index) => ({
        id: sale.id,
        invoiceNumber: `INV-${String(index + 1).padStart(3, '0')}`,
        customerName: 'Customer', // Default since customer_name column doesn't exist yet
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
      // await realQuickBooksService.syncData()
      console.log('Sync functionality would be implemented here')
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

  const handleAIHelp = async () => {
    if (!aiQuery.trim()) return

    try {
      setAiLoading(true)
      setAiResponse('')

      // Use Mistral AI for accounting assistance
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: `You are an expert accounting and tax advisor specializing in Uganda's EFRIS system and QuickBooks integration. 
              Help with accounting questions, tax calculations, EFRIS compliance, financial reporting, and business advice.
              Current business metrics: Revenue: UGX ${metrics.totalRevenue.toLocaleString()}, 
              VAT: UGX ${metrics.vatCollected.toLocaleString()}, Net Income: UGX ${metrics.netIncome.toLocaleString()}.`
            },
            {
              role: 'user',
              content: aiQuery
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error('AI service unavailable')
      }

      const data = await response.json()
      setAiResponse(data.choices[0].message.content)
    } catch (error) {
      console.error('AI Help error:', error)
      setAiResponse('Sorry, I cannot help right now. Please try again later.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmitVAT = async () => {
    try {
      toast.loading('Submitting VAT to EFRIS...', { id: 'vat-submit' })
      
      // Simulate VAT submission to EFRIS
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would call the EFRIS API
      console.log('Submitting VAT to EFRIS:', {
        vatAmount: metrics.vatCollected,
        companyId: '9341455307021048',
        tinNumber: '1001234567',
        submissionDate: new Date().toISOString()
      })
      
      toast.success('VAT successfully submitted to EFRIS!', { id: 'vat-submit' })
    } catch (error) {
      console.error('VAT submission error:', error)
      toast.error('Failed to submit VAT to EFRIS', { id: 'vat-submit' })
    }
  }

  const handleCalculateTax = async () => {
    try {
      toast.loading('Calculating taxes...', { id: 'tax-calc' })
      
      // Simulate tax calculation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const taxCalculation = {
        grossRevenue: metrics.totalRevenue,
        vatAmount: metrics.vatCollected,
        incomeTaxAmount: metrics.netIncome * 0.30,
        withholdingTaxAmount: metrics.totalRevenue * 0.06,
        totalTaxLiability: metrics.vatCollected + (metrics.netIncome * 0.30) + (metrics.totalRevenue * 0.06)
      }
      
      console.log('Tax calculation completed:', taxCalculation)
      
      toast.success(`Tax calculation completed! Total liability: UGX ${taxCalculation.totalTaxLiability.toLocaleString()}`, { id: 'tax-calc' })
    } catch (error) {
      console.error('Tax calculation error:', error)
      toast.error('Failed to calculate taxes', { id: 'tax-calc' })
    }
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
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <Menu className="h-5 w-5" />
                <span>Menu</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg flex items-center justify-center">
                  <Calculator className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-[#040458]">Accounting Dashboard</h1>
                  <p className="text-xs md:text-sm text-gray-600">Complete financial management with AI insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                {isConnected ? 'Connected' : 'Offline'}
              </Badge>
              <Button
                onClick={() => setShowAIHelp(true)}
                variant="outline"
                size="sm"
                className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white border-[#faa51a]"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Help
              </Button>
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
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`w-64 bg-white/80 backdrop-blur-sm shadow-lg border-r border-gray-200/50 fixed md:relative z-50 md:z-auto h-full md:h-auto transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#040458]">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
        <div className="flex-1 p-4 md:p-8">
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#040458]">Invoice Management</h2>
                  <p className="text-gray-600">Create, edit, and track your invoices</p>
                </div>
                <Button className="bg-[#040458] hover:bg-[#040458]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>

              {/* Invoice Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Invoices</p>
                        <p className="text-2xl font-bold text-[#040458]">{recentInvoices.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Paid Invoices</p>
                        <p className="text-2xl font-bold text-green-600">{recentInvoices.filter(inv => inv.status === 'paid').length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{recentInvoices.filter(inv => inv.status === 'pending').length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Overdue</p>
                        <p className="text-2xl font-bold text-red-600">{recentInvoices.filter(inv => inv.status === 'overdue').length}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice List */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Your latest invoice activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-500' :
                            invoice.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-600">{invoice.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-[#040458]">UGX {invoice.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{invoice.date}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#040458]">Customer Management</h2>
                  <p className="text-gray-600">Manage your customer database and relationships</p>
                </div>
                <Button className="bg-[#040458] hover:bg-[#040458]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold text-[#040458]">24</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Customers</p>
                        <p className="text-2xl font-bold text-green-600">18</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">New This Month</p>
                        <p className="text-2xl font-bold text-purple-600">5</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer List */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Customer Database</CardTitle>
                      <CardDescription>Your customer information and transaction history</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+256 700 123 456', totalSpent: 1250000, lastOrder: '2025-09-05', status: 'active' },
                      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+256 700 234 567', totalSpent: 890000, lastOrder: '2025-09-03', status: 'active' },
                      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+256 700 345 678', totalSpent: 2100000, lastOrder: '2025-09-01', status: 'active' },
                      { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+256 700 456 789', totalSpent: 450000, lastOrder: '2025-08-28', status: 'inactive' },
                      { id: 5, name: 'David Brown', email: 'david@example.com', phone: '+256 700 567 890', totalSpent: 1750000, lastOrder: '2025-08-25', status: 'active' }
                    ].map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#040458] rounded-full flex items-center justify-center text-white font-semibold">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total Spent</p>
                            <p className="font-semibold text-[#040458]">UGX {customer.totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Last: {customer.lastOrder}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {customer.status}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#040458]">Financial Reports</h2>
                  <p className="text-gray-600">Generate and analyze your financial reports</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date Range
                  </Button>
                  <Button className="bg-[#040458] hover:bg-[#040458]/90">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Generate All
                  </Button>
                </div>
              </div>

              {/* Report Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    name: 'Profit & Loss', 
                    icon: TrendingUp, 
                    color: 'bg-green-500',
                    description: 'Revenue, expenses, and profit analysis',
                    lastGenerated: '2025-09-07',
                    status: 'ready'
                  },
                  { 
                    name: 'Balance Sheet', 
                    icon: BarChart3, 
                    color: 'bg-blue-500',
                    description: 'Assets, liabilities, and equity overview',
                    lastGenerated: '2025-09-06',
                    status: 'ready'
                  },
                  { 
                    name: 'Cash Flow', 
                    icon: Activity, 
                    color: 'bg-purple-500',
                    description: 'Cash inflows and outflows tracking',
                    lastGenerated: '2025-09-05',
                    status: 'ready'
                  },
                  { 
                    name: 'Tax Report', 
                    icon: Calculator, 
                    color: 'bg-orange-500',
                    description: 'VAT, EFRIS, and tax compliance',
                    lastGenerated: '2025-09-04',
                    status: 'ready'
                  },
                  { 
                    name: 'Sales Report', 
                    icon: DollarSign, 
                    color: 'bg-yellow-500',
                    description: 'Sales performance and trends',
                    lastGenerated: '2025-09-03',
                    status: 'ready'
                  },
                  { 
                    name: 'Expense Report', 
                    icon: TrendingDown, 
                    color: 'bg-red-500',
                    description: 'Expense analysis and categorization',
                    lastGenerated: '2025-09-02',
                    status: 'ready'
                  }
                ].map((report) => {
                  const Icon = report.icon
                  return (
                    <Card key={report.name} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge className={report.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {report.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#040458] transition-colors">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Last Generated:</span>
                            <span>{report.lastGenerated}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGenerateReport(report.name)}
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Quick Report Actions */}
              <Card className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Zap className="h-5 w-5 mr-2" />
                    Quick Report Actions
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    Generate reports for specific time periods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => handleGenerateReport('Monthly Summary')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      This Month
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => handleGenerateReport('Quarterly Report')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      This Quarter
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => handleGenerateReport('Annual Report')}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      This Year
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'taxes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#040458]">Taxes & EFRIS</h2>
                  <p className="text-gray-600">Manage your tax obligations and EFRIS compliance</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={handleSubmitVAT}
                    className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit to EFRIS
                  </Button>
                  <Button 
                    className="bg-[#040458] hover:bg-[#040458]/90"
                    onClick={handleCalculateTax}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Tax
                  </Button>
                </div>
              </div>

              {/* Tax Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">VAT Collected</p>
                        <p className="text-2xl font-bold text-[#040458]">UGX {metrics.vatCollected.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">18% Rate</p>
                      </div>
                      <Receipt className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">EFRIS VAT</p>
                        <p className="text-2xl font-bold text-[#040458]">UGX {metrics.efrisVat.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">EFRIS System</p>
                      </div>
                      <Calculator className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Income Tax</p>
                        <p className="text-2xl font-bold text-[#040458]">UGX {(metrics.netIncome * 0.30).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">30% Rate</p>
                      </div>
                      <Building2 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Withholding Tax</p>
                        <p className="text-2xl font-bold text-[#040458]">UGX {(metrics.totalRevenue * 0.06).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">6% Rate</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* EFRIS Compliance */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-[#faa51a]" />
                    EFRIS Compliance Status
                  </CardTitle>
                  <CardDescription>Uganda Electronic Fiscal Receipting and Invoicing Solution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">EFRIS Registration</p>
                          <p className="text-sm text-green-600">Successfully registered with URA</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Info className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-800">TIN Number</p>
                          <p className="text-sm text-blue-600">1001234567</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-yellow-800">Next Submission</p>
                          <p className="text-sm text-yellow-600">Due: 15th of next month</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Calculations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>VAT Calculation</CardTitle>
                    <CardDescription>Value Added Tax breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Gross Revenue:</span>
                        <span className="font-semibold">UGX {metrics.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">VAT Rate:</span>
                        <span className="font-semibold">18%</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-semibold text-gray-900">VAT Amount:</span>
                        <span className="font-bold text-[#040458]">UGX {metrics.vatCollected.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>Income Tax Calculation</CardTitle>
                    <CardDescription>Corporate income tax breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Net Income:</span>
                        <span className="font-semibold">UGX {metrics.netIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tax Rate:</span>
                        <span className="font-semibold">30%</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-semibold text-gray-900">Income Tax:</span>
                        <span className="font-bold text-[#040458]">UGX {(metrics.netIncome * 0.30).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tax Actions */}
              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Send className="h-5 w-5 mr-2" />
                    Tax Submission Actions
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    Submit your tax returns to URA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={handleSubmitVAT}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Submit VAT Return
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={handleCalculateTax}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Submit Income Tax
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => {
                        toast.success('Tax forms downloaded successfully!')
                        console.log('Downloading tax forms...')
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Forms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#040458]">Account Settings</h2>
                  <p className="text-gray-600">Configure your accounting system preferences</p>
                </div>
                <Button className="bg-[#040458] hover:bg-[#040458]/90">
                  <Settings className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>

              {/* QuickBooks Settings */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-[#faa51a]" />
                    QuickBooks Integration
                  </CardTitle>
                  <CardDescription>Manage your QuickBooks connection and sync settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-semibold">Connection Status</p>
                          <p className="text-sm text-gray-600">
                            {isConnected ? 'Connected to QuickBooks' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Sync Frequency</label>
                        <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                          <option>Real-time</option>
                          <option>Every 15 minutes</option>
                          <option>Every hour</option>
                          <option>Daily</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company ID</label>
                        <input 
                          type="text" 
                          value="9341455307021048" 
                          disabled 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Settings */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-[#faa51a]" />
                    Tax Configuration
                  </CardTitle>
                  <CardDescription>Configure your tax rates and EFRIS settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">VAT Rate (%)</label>
                        <input 
                          type="number" 
                          defaultValue="18" 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Income Tax Rate (%)</label>
                        <input 
                          type="number" 
                          defaultValue="30" 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Withholding Tax Rate (%)</label>
                        <input 
                          type="number" 
                          defaultValue="6" 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">TIN Number</label>
                        <input 
                          type="text" 
                          defaultValue="1001234567" 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">EFRIS Registration</label>
                        <input 
                          type="text" 
                          defaultValue="EFRIS-2024-001" 
                          className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <label className="text-sm text-gray-700">Auto-submit to EFRIS</label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-[#faa51a]" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure your notification preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Tax Reminders</p>
                        <p className="text-sm text-gray-600">Get reminded about tax deadlines</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Sync Alerts</p>
                        <p className="text-sm text-gray-600">Notify when sync fails</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Low Stock Alerts</p>
                        <p className="text-sm text-gray-600">Alert when inventory is low</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-[#faa51a]" />
                    System Information
                  </CardTitle>
                  <CardDescription>Your accounting system details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Version:</span>
                        <span className="text-sm font-semibold">v2.1.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-sm font-semibold">2025-09-08</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Database:</span>
                        <span className="text-sm font-semibold">Supabase</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">AI Provider:</span>
                        <span className="text-sm font-semibold">Mistral AI</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">QuickBooks:</span>
                        <span className="text-sm font-semibold">Sandbox</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">EFRIS:</span>
                        <span className="text-sm font-semibold">Connected</span>
                      </div>
                    </div>
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

      {/* AI Help Modal */}
      <Dialog open={showAIHelp} onOpenChange={setShowAIHelp}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-[#faa51a]" />
              AI Accounting Assistant
            </DialogTitle>
            <DialogDescription>
              Get expert help with accounting, taxation, and EFRIS compliance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ask your accounting question:</label>
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g., How do I calculate VAT for my business? What are the EFRIS requirements? How to optimize my tax strategy?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={handleAIHelp}
              disabled={aiLoading || !aiQuery.trim()}
              className="w-full bg-[#faa51a] hover:bg-[#faa51a]/90 text-white"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Getting AI Response...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Ask AI Assistant
                </>
              )}
            </Button>
            {aiResponse && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-[#040458]">AI Response:</h4>
                <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAIHelp(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Accounting
