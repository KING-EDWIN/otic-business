import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { OticAPI } from '@/services/api'
import { AIAnalytics } from '@/services/aiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIInsights } from '@/components/AIInsights'
import { 
  Building2, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Menu,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Helper function for fallback stats fetching
const fetchStatsIndividually = async (userId: string) => {
  try {
    // Parallel queries for better performance
    const [salesResult, productsResult, lowStockResult] = await Promise.all([
      supabase
        .from('sales')
        .select('total')
        .eq('user_id', userId),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .lte('stock', 5)
    ])

    const totalRevenue = salesResult.data?.reduce((sum, sale) => sum + sale.total, 0) || 0
    const totalSales = salesResult.data?.length || 0

    return {
      totalSales,
      totalProducts: productsResult.count || 0,
      totalRevenue,
      lowStockItems: lowStockResult.data?.length || 0
    }
  } catch (error) {
    console.error('Error in fallback stats fetch:', error)
    return {
      totalSales: 0,
      totalProducts: 0,
      totalRevenue: 0,
      lowStockItems: 0
    }
  }
}

const Dashboard = () => {
  const { appUser, signOut, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Use React Query for caching and better performance
  const { data: stats = {
    totalSales: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockItems: 0
  }, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats', appUser?.id],
    queryFn: async () => {
      if (!appUser?.id) {
        return {
          totalSales: 0,
          totalProducts: 0,
          totalRevenue: 0,
          lowStockItems: 0
        }
      }

      console.log('Fetching dashboard stats for user:', appUser.id)
      
      try {
        // Use the fallback method that we know works
        const result = await fetchStatsIndividually(appUser.id)
        console.log('Dashboard stats result:', result)
        return result
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return {
          totalSales: 0,
          totalProducts: 0,
          totalRevenue: 0,
          lowStockItems: 0
        }
      }
    },
    enabled: !!appUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1
  })

  const loading = statsLoading || authLoading

  // Debug logging
  console.log('Dashboard Debug:', {
    appUser,
    user,
    authLoading,
    statsLoading,
    stats
  })
  
  // Debug the stats object
  useEffect(() => {
    console.log('Stats object details:', {
      totalSales: stats.totalSales,
      totalProducts: stats.totalProducts,
      totalRevenue: stats.totalRevenue,
      lowStockItems: stats.lowStockItems,
      statsObject: stats
    })
  }, [stats])

  useEffect(() => {
    if (!authLoading && !user) {
      // No user and not loading, redirect to signin
      navigate('/signin')
    }
  }, [authLoading, user, navigate])


  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'standard': return 'bg-green-100 text-green-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
          <p className="text-muted-foreground/70 text-sm mt-2">
            {authLoading ? 'Authenticating...' : 'Loading data...'}
          </p>
        </div>
      </div>
    )
  }

  // If no user, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please sign in to access your dashboard.</p>
          <Button onClick={() => navigate('/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 text-sm">
          <strong>Debug Info:</strong> User: {user?.email || 'None'} | AppUser: {appUser?.business_name || 'None'} | Tier: {appUser?.tier || 'None'}
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="bg-gradient-hero p-2 rounded-lg">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-primary">Otic Business</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Welcome back, {appUser?.business_name || user?.email || 'Business Owner'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
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
                <Button variant="ghost" size="sm" onClick={() => navigate('/pos')}>
                  POS
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
                  Inventory
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
                  Analytics
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
                  Payments
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                  Settings
                </Button>
              </div>
              
              <Badge className={`${getTierColor(appUser?.tier || 'basic')} text-xs md:text-sm hidden sm:block`}>
                {appUser?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan
              </Badge>
              <Button variant="outline" size="sm" onClick={signOut} className="text-xs md:text-sm">
                <span className="hidden sm:inline">Sign Out</span>
                <LogOut className="h-4 w-4 sm:hidden" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" size="sm" onClick={() => { navigate('/pos'); setMobileMenuOpen(false); }} className="justify-start">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  POS
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { navigate('/inventory'); setMobileMenuOpen(false); }} className="justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { navigate('/analytics'); setMobileMenuOpen(false); }} className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { navigate('/payments'); setMobileMenuOpen(false); }} className="justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payments
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }} className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <div className="pt-2 border-t border-gray-200">
                  <Badge className={getTierColor(appUser?.tier || 'basic')}>
                    {appUser?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!appUser && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Loading your business profile...</strong> This may take a moment.
            </p>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="p-3 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs md:text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg md:text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs md:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-sm md:text-2xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +15.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs md:text-sm font-medium">Products</CardTitle>
              <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg md:text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                +2 new this week
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs md:text-sm font-medium">Low Stock</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg md:text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="pos" className="text-xs md:text-sm">POS</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs md:text-sm">Inventory</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm hidden md:block">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm hidden md:block">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <Button 
                    className="w-full justify-start text-sm" 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/pos')}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Start New Sale
                  </Button>
                  <Button 
                    className="w-full justify-start text-sm" 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/inventory')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                  <Button 
                    className="w-full justify-start text-sm" 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/analytics')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
              
              <AIInsights 
                tier={appUser?.tier || 'free_trial'} 
                salesData={stats}
                inventoryData={stats}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest business activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    No recent activity yet. Start by adding your first product!
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pos">
            <Card>
              <CardHeader>
                <CardTitle>Point of Sale</CardTitle>
                <CardDescription>
                  Process sales and manage transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Access the full POS system with barcode scanning and receipt generation
                  </p>
                  <Button onClick={() => navigate('/pos')}>
                    Open POS System
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Manage your products and stock levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Access the full inventory management system
                  </p>
                  <Button onClick={() => navigate('/inventory')}>
                    Open Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  AI-powered insights and business intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Access the full analytics dashboard with AI insights and forecasting
                  </p>
                  <Button onClick={() => navigate('/analytics')}>
                    Open Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your account and business settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Access the full settings panel
                  </p>
                  <Button onClick={() => navigate('/settings')}>
                    Open Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard
