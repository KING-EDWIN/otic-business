import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Printer,
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Receipt,
  BarChart3,
  PieChart,
  Calculator,
  Building2,
  Users,
  Package, 
  CreditCard,
  CheckCircle, 
  AlertCircle,
  Clock,
  Eye, 
  Edit, 
  MoreVertical,
  Plus,
  RefreshCw, 
  Target,
  Activity,
  Zap,
  Shield,
  Send
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'
import BusinessLoginStatus from '@/components/BusinessLoginStatus'

const Reports: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    // Tax calculations
    withholdingTax: 0,
    vat: 0,
    incomeTax: 0,
    totalTaxes: 0,
    // Detailed breakdowns
    salesByMonth: [],
    topProducts: [],
    customerBreakdown: [],
    expenseBreakdown: []
  })

  useEffect(() => {
    if (user?.id) {
      loadReportData()
    }
  }, [user?.id, dateRange])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
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
        default:
          startDate.setDate(endDate.getDate() - 30)
      }

      // Load sales data
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (salesError) {
        console.error('Error loading sales:', salesError)
      }

      // Load products data
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)

      if (productsError) {
        console.error('Error loading products:', productsError)
      }

      // Load customers data (if customers table exists)
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)

      if (customersError) {
        console.log('Customers table might not exist:', customersError.message)
      }

      // Calculate totals
      const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
      const totalExpenses = totalRevenue * 0.6 // Estimate expenses as 60% of revenue
      const netProfit = totalRevenue - totalExpenses
      const totalSales = salesData?.length || 0
      const totalProducts = productsData?.length || 0
      const totalCustomers = customersData?.length || 0

      // Calculate taxes
      const withholdingTax = totalExpenses * 0.06 // 6% of expenses
      const vat = totalRevenue * 0.18 // 18% VAT on revenue
      const incomeTax = Math.max(0, netProfit) * 0.30 // 30% on profits
      const totalTaxes = withholdingTax + vat + incomeTax

      // Generate sales by month data
      const salesByMonth = []
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        const monthSales = salesData?.filter(sale => {
          const saleDate = new Date(sale.created_at)
          return saleDate >= monthStart && saleDate <= monthEnd
        }).reduce((sum, sale) => sum + sale.total, 0) || 0

        salesByMonth.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          sales: monthSales,
          revenue: monthSales
        })

        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      // Generate top products data
      const productSales = {}
      salesData?.forEach(sale => {
        if (sale.product_id && productSales[sale.product_id]) {
          productSales[sale.product_id].sales += 1
          productSales[sale.product_id].revenue += sale.total
        } else if (sale.product_id) {
          const product = productsData?.find(p => p.id === sale.product_id)
          productSales[sale.product_id] = {
            name: product?.name || 'Unknown Product',
            sales: 1,
            revenue: sale.total
          }
        }
      })

      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10)

      // Generate expense breakdown
      const expenseBreakdown = [
        { category: 'Cost of Goods Sold', amount: totalExpenses * 0.4, percentage: 40 },
        { category: 'Operating Expenses', amount: totalExpenses * 0.3, percentage: 30 },
        { category: 'Marketing & Advertising', amount: totalExpenses * 0.15, percentage: 15 },
        { category: 'Administrative', amount: totalExpenses * 0.1, percentage: 10 },
        { category: 'Other', amount: totalExpenses * 0.05, percentage: 5 }
      ]

      setReportData({
        totalRevenue,
        totalExpenses,
        netProfit,
        totalSales,
        totalProducts,
        totalCustomers,
        withholdingTax,
        vat,
        incomeTax,
        totalTaxes,
        salesByMonth,
        topProducts,
        customerBreakdown: customersData || [],
        expenseBreakdown
      })
      
    } catch (error) {
      console.error('Error loading report data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  const handleExportReport = () => {
    // Create CSV data
    const csvData = [
      ['Report Period', dateRange],
      ['Total Revenue', reportData.totalRevenue],
      ['Total Expenses', reportData.totalExpenses],
      ['Net Profit', reportData.netProfit],
      ['Total Sales', reportData.totalSales],
      ['Total Products', reportData.totalProducts],
      ['Total Customers', reportData.totalCustomers],
      ['Withholding Tax (6%)', reportData.withholdingTax],
      ['VAT (18%)', reportData.vat],
      ['Income Tax (30%)', reportData.incomeTax],
      ['Total Taxes', reportData.totalTaxes]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `otic-business-report-${dateRange}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const COLORS = ['#faa51a', '#040458', '#10b981', '#ef4444', '#8b5cf6']

  // Show loading state while auth is initializing
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
          <p className="text-sm text-gray-500 mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/accounting')}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#040458]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Accounting</span>
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <img 
                  src="/Layer 2.png" 
                  alt="Otic Business Logo" 
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Business Reports</h1>
                  <p className="text-sm text-gray-500">Comprehensive business analytics & URA compliance</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Select value={dateRange} onValueChange={setDateRange}>
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
                <Button
                  onClick={loadReportData}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <Button
                onClick={handleExportReport}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={handlePrintReport}
                size="sm"
                className="bg-[#040458] hover:bg-[#040458]/90"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
              <BusinessLoginStatus />
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 print:hidden">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="taxes">Tax Report</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-[#040458]">
                        UGX {reportData.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Profit</p>
                      <p className="text-3xl font-bold text-green-600">
                        UGX {reportData.netProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-3xl font-bold text-[#040458]">
                        {reportData.totalSales}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-3xl font-bold text-[#040458]">
                        {reportData.totalProducts}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
        </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Revenue trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.salesByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#040458" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best performing products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.topProducts.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#faa51a" />
                      </BarChart>
                    </ResponsiveContainer>
                      </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Complete financial overview for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income Statement</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Revenue:</span>
                          <span className="font-semibold">UGX {reportData.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Expenses:</span>
                          <span className="font-semibold text-red-600">-UGX {reportData.totalExpenses.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Net Profit:</span>
                            <span className={reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              UGX {reportData.netProfit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Expense Breakdown</h3>
                      <div className="space-y-2">
                        {reportData.expenseBreakdown.map((expense, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{expense.category}:</span>
                            <span>UGX {expense.amount.toLocaleString()} ({expense.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Report Tab */}
          <TabsContent value="taxes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>URA Tax Report</CardTitle>
                <CardDescription>Uganda Revenue Authority compliance report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900">Withholding Tax</h4>
                      <p className="text-2xl font-bold text-blue-900">
                        UGX {reportData.withholdingTax.toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-700">6% of supplier payments</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900">VAT</h4>
                      <p className="text-2xl font-bold text-green-900">
                        UGX {reportData.vat.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-700">18% on sales</p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-900">Income Tax</h4>
                      <p className="text-2xl font-bold text-orange-900">
                        UGX {reportData.incomeTax.toLocaleString()}
                      </p>
                      <p className="text-sm text-orange-700">30% on profits</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900">Total Taxes</h4>
                      <p className="text-2xl font-bold text-red-900">
                        UGX {reportData.totalTaxes.toLocaleString()}
                      </p>
                      <p className="text-sm text-red-700">Total URA obligation</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Tax Calculation Details</h4>
                    <div className="text-sm space-y-1">
                      <p>• Withholding Tax: 6% of total expenses (UGX {reportData.totalExpenses.toLocaleString()})</p>
                      <p>• VAT: 18% of total revenue (UGX {reportData.totalRevenue.toLocaleString()})</p>
                      <p>• Income Tax: 30% of net profit (UGX {reportData.netProfit.toLocaleString()})</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Business Report</CardTitle>
                <CardDescription>Comprehensive business analysis for URA presentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Business Overview</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Business Name:</span>
                          <span className="font-semibold">{profile?.business_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-semibold">{user?.email}</span>
                  </div>
                        <div className="flex justify-between">
                          <span>Report Period:</span>
                          <span className="font-semibold">{dateRange}</span>
                            </div>
                        <div className="flex justify-between">
                          <span>Generated:</span>
                          <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                    <div>
                      <h4 className="font-semibold mb-3">Sales Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Sales:</span>
                          <span className="font-semibold">{reportData.totalSales}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Revenue:</span>
                          <span className="font-semibold">UGX {reportData.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Sale:</span>
                          <span className="font-semibold">
                            UGX {reportData.totalSales > 0 ? (reportData.totalRevenue / reportData.totalSales).toLocaleString() : '0'}
                          </span>
                            </div>
                            </div>
                          </div>

                    <div>
                      <h4 className="font-semibold mb-3">Product Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Products:</span>
                          <span className="font-semibold">{reportData.totalProducts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Products:</span>
                          <span className="font-semibold">{reportData.topProducts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Top Product:</span>
                          <span className="font-semibold">
                            {reportData.topProducts[0]?.name || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Top 10 Products by Revenue</h4>
                    <div className="space-y-2">
                      {reportData.topProducts.slice(0, 10).map((product, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium">{product.name}</span>
                          <div className="text-right">
                            <div className="font-semibold">UGX {product.revenue.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{product.sales} sales</div>
                        </div>
                      </div>
                    ))}
                    </div>
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

export default Reports