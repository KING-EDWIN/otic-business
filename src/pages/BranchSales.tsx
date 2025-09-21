import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContextOptimized'
import { branchDataService, BranchSale } from '@/services/branchDataService'
import { useDateRange } from '@/hooks/useDateRange'
import DateRangePicker from '@/components/DateRangePicker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Plus, 
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3,
  PieChart,
  Clock,
  CreditCard,
  Banknote,
  Receipt
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

interface Sale {
  id: string
  sale_number: string
  customer_name: string
  customer_phone: string
  total_amount: number
  discount: number
  tax: number
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer'
  payment_status: 'completed' | 'pending' | 'refunded'
  items_count: number
  created_at: string
  created_by: string
  items: SaleItem[]
}

interface SaleItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  category: string
}

interface SalesSummary {
  total_sales: number
  total_transactions: number
  average_transaction: number
  total_customers: number
  top_products: Array<{name: string, sales: number, quantity: number}>
  payment_methods: Array<{method: string, amount: number, percentage: number}>
}

const BranchSales: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [branch, setBranch] = useState<BranchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  
  // Date range management
  const { dateRange, updateDateRange, minDate, maxDate, dateRangeString, loading: dateLoading } = useDateRange()
  
  // Real-time data from backend
  const [sales, setSales] = useState<Sale[]>([])
  const [summary, setSummary] = useState<SalesSummary | null>(null)

  useEffect(() => {
    if (branchId) {
      loadBranchData()
    }
  }, [branchId])

  useEffect(() => {
    if (branchId && dateRange.from && dateRange.to) {
      loadSalesData()
      loadSalesSummary()
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

  const loadSalesData = async () => {
    try {
      setLoading(true)
      
      // Load live sales data from database
      if (!branchId) {
        console.error('No branch ID available')
        setSales([])
        setLoading(false)
        return
      }

      // Load live sales data
      const liveSales = await branchDataService.getBranchSales(branchId)
      
      // Map live sales to expected format
      const mappedSales: Sale[] = await Promise.all(liveSales.map(async (sale) => {
        // Get sale items for each sale
        const saleItems = await branchDataService.getSaleItems(sale.id)
        
        return {
          id: sale.id,
          sale_number: sale.sale_number,
          customer_name: sale.customer_name || 'Walk-in Customer',
          customer_phone: sale.customer_phone || 'N/A',
          total_amount: sale.total_amount,
          discount: sale.discount_amount,
          tax: sale.tax_amount,
          payment_method: sale.payment_method === 'credit' ? 'card' : sale.payment_method as 'cash' | 'card' | 'mobile_money' | 'bank_transfer',
          payment_status: sale.payment_status === 'failed' ? 'pending' : sale.payment_status as 'completed' | 'pending' | 'refunded',
          items_count: sale.items_count,
          created_at: sale.created_at,
          created_by: 'System', // This would need to be joined with user data
          items: saleItems.map(item => ({
            id: item.id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            category: item.category || 'Uncategorized'
          }))
        }
      }))

      setSales(mappedSales)
    } catch (error) {
      console.error('Error loading sales data:', error)
      toast.error('Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  const loadSalesSummary = async () => {
    try {
      if (!branchId || !dateRange.from || !dateRange.to) return
      
      // Use the selected date range
      const startDate = dateRange.from.toISOString().split('T')[0]
      const endDate = dateRange.to.toISOString().split('T')[0]

      // Load live sales summary from daily metrics
      const dailyMetrics = await branchDataService.getDailyMetrics(branchId, startDate, endDate)
      const productPerformance = await branchDataService.getProductPerformance(branchId, startDate, endDate)
      
      // Calculate summary from live data
      const totalSales = dailyMetrics?.reduce((sum, metric) => sum + metric.total_sales, 0) || 0
      const totalTransactions = dailyMetrics?.reduce((sum, metric) => sum + metric.total_transactions, 0) || 0
      const totalCustomers = dailyMetrics?.reduce((sum, metric) => sum + metric.total_customers, 0) || 0
      const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0
      
      // Get top products
      const topProducts = productPerformance.slice(0, 5).map(product => ({
        name: product.product_name,
        sales: product.total_revenue,
        quantity: product.total_quantity_sold
      }))
      
      // Calculate payment methods from daily metrics
      const paymentMethods = [
        { method: 'Cash', amount: dailyMetrics?.reduce((sum, metric) => sum + (metric.cash_sales || 0), 0) || 0, percentage: 0 },
        { method: 'Card', amount: dailyMetrics?.reduce((sum, metric) => sum + (metric.card_sales || 0), 0) || 0, percentage: 0 },
        { method: 'Mobile Money', amount: dailyMetrics?.reduce((sum, metric) => sum + (metric.mobile_money_sales || 0), 0) || 0, percentage: 0 },
        { method: 'Bank Transfer', amount: dailyMetrics?.reduce((sum, metric) => sum + (metric.bank_transfer_sales || 0), 0) || 0, percentage: 0 }
      ]
      
      // Calculate percentages
      paymentMethods.forEach(pm => {
        pm.percentage = totalSales > 0 ? (pm.amount / totalSales) * 100 : 0
      })
      
      const liveSummary: SalesSummary = {
        total_sales: totalSales,
        total_transactions: totalTransactions,
        average_transaction: averageTransaction,
        total_customers: totalCustomers,
        top_products: topProducts,
        payment_methods: paymentMethods
      }

      setSummary(liveSummary)
    } catch (error) {
      console.error('Error loading sales summary:', error)
      toast.error('Failed to load sales summary')
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'mobile_money': return <Receipt className="h-4 w-4" />
      case 'bank_transfer': return <DollarSign className="h-4 w-4" />
      default: return <ShoppingCart className="h-4 w-4" />
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800'
      case 'card': return 'bg-blue-100 text-blue-800'
      case 'mobile_money': return 'bg-purple-100 text-purple-800'
      case 'bank_transfer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'refunded': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer_phone.includes(searchTerm)
    
    const matchesStatus = filterStatus === 'all' || sale.payment_status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales data...</p>
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
                  Sales - {branch?.branch_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {branch?.branch_code} • {branch?.city}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Sale</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">UGX {summary.total_sales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_transactions}</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">UGX {summary.average_transaction.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +5.3% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_customers}</div>
                <p className="text-xs text-muted-foreground">
                  +15.2% from last period
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search sales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Sales List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>All sales transactions for this branch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSales.map((sale) => (
                    <div 
                      key={sale.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedSale(sale)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#040458] text-white rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{sale.sale_number}</h4>
                          <p className="text-sm text-gray-500">{sale.customer_name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getPaymentMethodColor(sale.payment_method)}>
                              {sale.payment_method.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(sale.payment_status)}>
                              {sale.payment_status}
                            </Badge>
                            <span className="text-xs text-gray-500">{sale.items_count} items</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">UGX {sale.total_amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">{sale.created_by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products by sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary?.top_products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#040458] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">UGX {product.sales.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {((product.sales / (summary?.total_sales || 1)) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Sales breakdown by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary?.payment_methods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getPaymentMethodIcon(method.method.toLowerCase().replace(' ', '_'))}
                        <div>
                          <h4 className="font-semibold">{method.method}</h4>
                          <p className="text-sm text-gray-500">{method.percentage.toFixed(1)}% of total sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">UGX {method.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{method.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Sales Report</span>
                  </CardTitle>
                  <CardDescription>Daily, weekly, and monthly sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Product Analysis</span>
                  </CardTitle>
                  <CardDescription>Product performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Trend Analysis</span>
                  </CardTitle>
                  <CardDescription>Sales trends and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sale Details - {selectedSale.sale_number}
                </h3>
                <Button
                  onClick={() => setSelectedSale(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Sale Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer:</span>
                    <div className="text-lg font-semibold">{selectedSale.customer_name}</div>
                    <div className="text-sm text-gray-500">{selectedSale.customer_phone}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date:</span>
                    <div className="text-lg font-semibold">
                      {new Date(selectedSale.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedSale.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPaymentMethodIcon(selectedSale.payment_method)}
                      <span className="font-semibold">{selectedSale.payment_method.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <Badge className={getStatusColor(selectedSale.payment_status)}>
                      {selectedSale.payment_status}
                    </Badge>
                  </div>
                </div>
                
                {/* Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Items Sold</h4>
                  <div className="space-y-2">
                    {selectedSale.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h5 className="font-medium">{item.product_name}</h5>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">UGX {item.total_price.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × UGX {item.unit_price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">UGX {(selectedSale.total_amount - selectedSale.tax).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-green-600">-UGX {selectedSale.discount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-semibold">UGX {selectedSale.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>UGX {selectedSale.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-6">
                  <Button className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Sale
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchSales
