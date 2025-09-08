import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getOfflineStats } from '@/services/offlineData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Menu,
  LogOut,
  Settings,
  ArrowLeft
} from 'lucide-react'

const DashboardSimple = () => {
  const { profile, signOut, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        // Use offline data for now
        const offlineStats = getOfflineStats()
        setStats(offlineStats)
        console.log('Loaded offline stats:', offlineStats)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user?.id])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <Button onClick={() => navigate('/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-8 md:h-10 w-8 md:w-10"
              />
              <div className="flex flex-col">
                <span className="text-lg md:text-2xl font-bold text-[#040458]">Otic</span>
                <span className="text-xs md:text-sm text-[#faa51a] -mt-1">Business</span>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
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
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                POS
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/inventory')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <Package className="h-4 w-4 mr-2" />
                Inventory
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/analytics')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/customers')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#040458] mb-2">
            Welcome back, {profile?.business_name || 'Business'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Sales</p>
                  <p className="text-3xl font-bold">{stats.totalSales}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Low Stock</p>
                  <p className="text-3xl font-bold">{stats.lowStockItems}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pos')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#faa51a] rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#040458]">Point of Sale</h3>
                  <p className="text-sm text-gray-600">Process sales and payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/inventory')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#040458] rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#040458]">Inventory</h3>
                  <p className="text-sm text-gray-600">Manage your products</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analytics')}>
            <CardContent className="p6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#040458]">Analytics</h3>
                  <p className="text-sm text-gray-600">View business insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardSimple
