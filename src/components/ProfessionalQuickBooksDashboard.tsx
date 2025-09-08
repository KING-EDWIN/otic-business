import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Package, 
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Receipt,
  ShoppingCart,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { advancedQuickBooksService } from '@/services/advancedQuickBooksService'

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
  vatCollected: number
  vatPaid: number
  netVat: number
  efrisVat: number
  efrisIncome: number
  efrisWithholding: number
  totalCustomers: number
  totalInvoices: number
  totalItems: number
  overdueInvoices: number
  recentTransactions: any[]
  topCustomers: any[]
  topItems: any[]
  monthlyRevenue: any[]
  monthlyExpenses: any[]
  profitLossData: any
  balanceSheetData: any
  cashFlowData: any
}

const ProfessionalQuickBooksDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const isConnected = await advancedQuickBooksService.isConnected()
      if (!isConnected) {
        throw new Error('QuickBooks is not connected. Please connect to QuickBooks first.')
      }

      const data = await advancedQuickBooksService.getDashboardMetrics()
      setMetrics(data)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-[#040458] mx-auto mb-4" />
          <p className="text-gray-600">Loading QuickBooks dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} className="bg-[#040458] hover:bg-[#030345]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QuickBooks Dashboard</h1>
              <p className="text-gray-600">Real-time financial overview from QuickBooks</p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button onClick={loadDashboardData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="taxes">Taxes & EFRIS</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="h-4 w-4 text-green-300" />
                        <span className="text-green-300 text-sm ml-1">+12%</span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Net Income</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.netIncome)}</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="h-4 w-4 text-green-300" />
                        <span className="text-green-300 text-sm ml-1">+8%</span>
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Cash Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.cashBalance)}</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="h-4 w-4 text-orange-300" />
                        <span className="text-orange-300 text-sm ml-1">+5%</span>
                      </div>
                    </div>
                    <CreditCard className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Accounts Receivable</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.accountsReceivable)}</p>
                      <div className="flex items-center mt-1">
                        <ArrowDownRight className="h-4 w-4 text-red-300" />
                        <span className="text-red-300 text-sm ml-1">-3%</span>
                      </div>
                    </div>
                    <Receipt className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalCustomers}</p>
                    </div>
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalInvoices}</p>
                    </div>
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalItems}</p>
                    </div>
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overdue Invoices</p>
                      <p className="text-2xl font-bold text-red-600">{metrics.overdueInvoices}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Expenses Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Revenue vs Expenses
                  </CardTitle>
                  <CardDescription>Monthly comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.monthlyRevenue.slice(-6).map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{month.month} {month.year}</span>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(month.amount)}
                            </div>
                            <div className="text-xs text-gray-500">Revenue</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-600">
                              {formatCurrency(metrics.monthlyExpenses[index]?.amount || 0)}
                            </div>
                            <div className="text-xs text-gray-500">Expenses</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>Latest activity from QuickBooks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.recentTransactions.slice(0, 5).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'Invoice' ? 'bg-blue-100 text-blue-600' :
                            transaction.type === 'Payment' ? 'bg-green-100 text-green-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {transaction.type === 'Invoice' ? <FileText className="h-4 w-4" /> :
                             transaction.type === 'Payment' ? <CreditCard className="h-4 w-4" /> :
                             <Receipt className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                          <Badge variant={transaction.status === 'Paid' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Customers and Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Top Customers
                  </CardTitle>
                  <CardDescription>By revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.topCustomers.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.invoices} invoices</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.totalRevenue)}</p>
                          <p className="text-xs text-gray-500">Balance: {formatCurrency(customer.balance)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Top Items
                  </CardTitle>
                  <CardDescription>By price</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.topItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.sku} • {item.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(item.unitPrice)}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qtyOnHand}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Profit & Loss</h3>
                  <p className="text-gray-600 text-sm mb-4">Income statement with detailed breakdown</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <PieChart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Balance Sheet</h3>
                  <p className="text-gray-600 text-sm mb-4">Assets, liabilities, and equity</p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Activity className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash Flow</h3>
                  <p className="text-gray-600 text-sm mb-4">Cash flow statement</p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Manage your invoices from QuickBooks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Invoice management interface would go here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>Manage your customers from QuickBooks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Customer management interface would go here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
                <CardDescription>Manage your inventory and services from QuickBooks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Item management interface would go here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxes">
            <Card>
              <CardHeader>
                <CardTitle>Taxes & EFRIS</CardTitle>
                <CardDescription>Uganda tax calculations and EFRIS compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900">VAT Collected</h3>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.vatCollected)}</p>
                    <p className="text-sm text-blue-700">18% Rate</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-900">Income Tax</h3>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.efrisIncome)}</p>
                    <p className="text-sm text-orange-700">30% Rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900">Withholding Tax</h3>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.efrisWithholding)}</p>
                    <p className="text-sm text-purple-700">6% Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProfessionalQuickBooksDashboard

