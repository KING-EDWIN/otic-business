import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getOfflineStats, getOfflineProducts, getOfflineSales } from '@/services/offlineData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Menu,
  LogOut,
  Settings,
  ArrowLeft,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Activity,
  Zap
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const DashboardMain = () => {
  const { profile, signOut, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockItems: 0
  })
  const [loading, setLoading] = useState(true)

  // Load stats quickly
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }
      
      try {
        const offlineStats = getOfflineStats()
        setStats(offlineStats)
        console.log('Loaded offline stats:', offlineStats)
      } catch (error) {
        console.error('Error loading stats:', error)
        toast.error('Failed to load dashboard data. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user?.id])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#040458] border-t-[#faa51a] mx-auto mb-4"></div>
          <p className="text-[#040458] font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <img src="/Otic icon@2x.png" alt="Otic Business Logo" className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#040458] mb-4">Please sign in</h2>
          <Button 
            onClick={() => navigate('/signin')}
            className="bg-[#faa51a] hover:bg-[#040458] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Sample data for charts
  const salesData = [
    { name: 'Mon', sales: 4000, revenue: 24000 },
    { name: 'Tue', sales: 3000, revenue: 13980 },
    { name: 'Wed', sales: 2000, revenue: 9800 },
    { name: 'Thu', sales: 2780, revenue: 3908 },
    { name: 'Fri', sales: 1890, revenue: 4800 },
    { name: 'Sat', sales: 2390, revenue: 3800 },
    { name: 'Sun', sales: 3490, revenue: 4300 },
  ]

  const productData = [
    { name: 'Coca Cola', sales: 45, revenue: 112500 },
    { name: 'Bread Loaf', sales: 30, revenue: 90000 },
    { name: 'Rice 1kg', sales: 25, revenue: 125000 },
  ]

  const COLORS = ['#040458', '#faa51a', '#3b82f6', '#10b981', '#f59e0b']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-10 w-10"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#040458]">Otic</span>
                <span className="text-sm text-[#faa51a] -mt-1">Business</span>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/pos')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                POS
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/inventory')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <Package className="h-4 w-4 mr-2" />
                Inventory
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/analytics')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/customers')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#040458] mb-2">
            Welcome back, {profile?.business_name || 'Business'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-[#040458] to-[#1e1e6b] text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Sales</p>
                  <p className="text-3xl font-bold">{stats.totalSales}</p>
                  <p className="text-blue-200 text-xs mt-1">+12% from last month</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#faa51a] to-[#ff8c42] text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-orange-200 text-xs mt-1">+8% from last month</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                  <p className="text-emerald-200 text-xs mt-1">Active inventory</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-rose-500 to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium mb-1">Low Stock</p>
                  <p className="text-3xl font-bold">{stats.lowStockItems}</p>
                  <p className="text-rose-200 text-xs mt-1">Need restocking</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white">
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white">
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#040458] flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Sales Overview
                  </CardTitle>
                  <CardDescription>Daily sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#040458" 
                        strokeWidth={3}
                        dot={{ fill: '#faa51a', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#040458] flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Top Products
                  </CardTitle>
                  <CardDescription>Best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                      >
                        {productData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#040458] flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Frequently used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => navigate('/pos')}
                    className="h-20 bg-gradient-to-r from-[#040458] to-[#1e1e6b] hover:from-[#1e1e6b] hover:to-[#040458] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                      <span className="font-semibold">Point of Sale</span>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => navigate('/inventory')}
                    className="h-20 bg-gradient-to-r from-[#faa51a] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#faa51a] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <span className="font-semibold">Inventory</span>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => navigate('/analytics')}
                    className="h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <span className="font-semibold">Analytics</span>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => navigate('/customers')}
                    className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <span className="font-semibold">Customers</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#040458]">Revenue Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#faa51a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#040458]">Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productData.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#040458]">{product.sales} sales</p>
                          <p className="text-sm text-gray-600">UGX {product.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#040458] flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Sale completed</p>
                      <p className="text-sm text-gray-600">Coca Cola x2 - UGX 5,000</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <Package className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Inventory updated</p>
                      <p className="text-sm text-gray-600">Bread Loaf stock: 20 units</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Low stock alert</p>
                      <p className="text-sm text-gray-600">Rice 1kg needs restocking</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#040458] flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  AI Business Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-[#040458] to-[#1e1e6b] text-white rounded-lg">
                    <h4 className="font-semibold mb-2">💡 Sales Optimization</h4>
                    <p className="text-sm opacity-90">Your Coca Cola sales are 40% higher on weekends. Consider increasing stock on Fridays.</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-[#faa51a] to-[#ff8c42] text-white rounded-lg">
                    <h4 className="font-semibold mb-2">📈 Growth Opportunity</h4>
                    <p className="text-sm opacity-90">Adding 2 more product categories could increase revenue by 25%.</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg">
                    <h4 className="font-semibold mb-2">🎯 Customer Insights</h4>
                    <p className="text-sm opacity-90">Peak shopping hours are 2-4 PM. Consider promotional campaigns during this time.</p>
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

export default DashboardMain
