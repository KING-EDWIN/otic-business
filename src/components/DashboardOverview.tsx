import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  FileText, 
  BarChart3, 
  Calculator, 
  Building2, 
  CreditCard, 
  Receipt, 
  Activity, 
  Target, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserInfo } from '@/utils/userUtils'

interface DashboardMetrics {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  totalCustomers: number
  totalProducts: number
  totalSales: number
  pendingInvoices: number
  lowStockItems: number
  recentSales: any[]
  topProducts: any[]
  recentInvoices: any[]
}

const DashboardOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return

      // Fetch all data in parallel
      const [
        salesResult,
        productsResult,
        customersResult,
        invoicesResult
      ] = await Promise.all([
        supabase.from('sales').select('*').eq('user_id', userInfo.id),
        supabase.from('products').select('*').eq('user_id', userInfo.id),
        supabase.from('customers').select('*').eq('user_id', userInfo.id),
        supabase.from('invoices').select('*').eq('user_id', userInfo.id)
      ])

      const sales = salesResult.data || []
      const products = productsResult.data || []
      const customers = customersResult.data || []
      const invoices = invoicesResult.data || []

      // Calculate metrics
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      const totalExpenses = products.reduce((sum, product) => sum + ((product.cost || 0) * (product.stock || 0)), 0)
      const netIncome = totalRevenue - totalExpenses
      const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length
      const lowStockItems = products.filter(product => (product.stock || 0) <= (product.min_stock || 5)).length

      // Get recent sales (last 5)
      const recentSales = sales
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      // Get top products by sales
      const productSales = sales.reduce((acc, sale) => {
        const saleItems = sale.sale_items || []
        saleItems.forEach((item: any) => {
          const productId = item.product_id
          if (!acc[productId]) {
            acc[productId] = { product: products.find(p => p.id === productId), quantity: 0, revenue: 0 }
          }
          acc[productId].quantity += item.quantity || 0
          acc[productId].revenue += (item.quantity || 0) * (item.price || 0)
        })
        return acc
      }, {})

      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5)

      // Get recent invoices (last 5)
      const recentInvoices = invoices
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setMetrics({
        totalRevenue,
        totalExpenses,
        netIncome,
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalSales: sales.length,
        pendingInvoices,
        lowStockItems,
        recentSales,
        topProducts,
        recentInvoices
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-4">Start by adding some products and making sales.</p>
        <Button onClick={loadDashboardData} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Overview</h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Quick Sale
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-200" />
                  <span className="text-green-200 text-sm ml-1">+12% from last month</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Net Income</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.netIncome)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-200" />
                  <span className="text-blue-200 text-sm ml-1">Profitable</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold">{metrics.totalSales}</p>
                <div className="flex items-center mt-2">
                  <ShoppingCart className="h-4 w-4 text-orange-200" />
                  <span className="text-orange-200 text-sm ml-1">Transactions</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Customers</p>
                <p className="text-3xl font-bold">{metrics.totalCustomers}</p>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-purple-200" />
                  <span className="text-purple-200 text-sm ml-1">Active</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
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
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
                <p className="text-xs text-gray-500">In inventory</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.pendingInvoices}</p>
                <p className="text-xs text-gray-500">Awaiting payment</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.lowStockItems}</p>
                <p className="text-xs text-gray-500">Items need restocking</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalExpenses)}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <Receipt className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Recent Sales
            </CardTitle>
            <CardDescription>Latest sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentSales.length > 0 ? (
                metrics.recentSales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Sale #{sale.id}</p>
                        <p className="text-sm text-gray-500">{formatDate(sale.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(sale.total_amount || 0)}</p>
                      <p className="text-sm text-gray-500">{sale.payment_method}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent sales</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Top Products
            </CardTitle>
            <CardDescription>Best selling products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topProducts.length > 0 ? (
                metrics.topProducts.map((item: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(item.revenue)}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No product sales data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm font-medium">New Sale</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
              <Package className="h-6 w-6" />
              <span className="text-sm font-medium">Add Product</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-600 hover:bg-orange-700">
              <FileText className="h-6 w-6" />
              <span className="text-sm font-medium">Create Invoice</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardOverview
