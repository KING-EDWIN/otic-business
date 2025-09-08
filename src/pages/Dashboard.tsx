import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContextClean'
import { OticAPI } from '@/services/api'
import { AIAnalytics } from '@/services/aiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AIInsights from '@/components/AIInsights'
import AIChatBot from '@/components/AIChatBot'
import AccountingDashboard from '@/components/AccountingDashboard'
import { SubscriptionManager } from '@/components/SubscriptionManager'
import { AdvancedReports } from '@/components/AdvancedReports'
import PaymentVerification from '@/components/PaymentVerification'
import { EmailNotificationSettings } from '@/components/EmailNotificationSettings'
import LoginStatus from '@/components/LoginStatus'
import { 
  Building2, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings,
  Plus,
  MessageSquareText,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Menu,
  LogOut,
  Brain,
  RefreshCw,
  FileText,
  Crown,
  Clock
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
  const { profile, signOut, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Use React Query for caching and better performance
  const { data: stats = {
    totalSales: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockItems: 0
  }, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        return {
          totalSales: 0,
          totalProducts: 0,
          totalRevenue: 0,
          lowStockItems: 0
        }
      }

      console.log('Fetching dashboard stats for user:', profile.id)
      
      try {
        // Use the fallback method that we know works
        const result = await fetchStatsIndividually(profile.id)
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
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1
  })

  const loading = statsLoading || authLoading

  // Debug logging
  console.log('Dashboard Debug:', {
    profile,
    user,
    authLoading,
    statsLoading,
    stats
  })
  
  // Debug the stats object
  useEffect(() => {
    console.log('Stats object details:', {
      totalSales: (stats as any).totalSales,
      totalProducts: (stats as any).totalProducts,
      totalRevenue: (stats as any).totalRevenue,
      lowStockItems: (stats as any).lowStockItems,
      statsObject: stats
    })
  }, [stats])

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.warn('Auth loading timeout - forcing redirect to signin')
        navigate('/signin')
      }
    }, 10000) // 10 second timeout

    if (!authLoading && !user) {
      // No user and not loading, redirect to signin
      navigate('/signin')
    }

    return () => clearTimeout(timeout)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#faa51a] mx-auto mb-4"></div>
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
          <strong>Debug Info:</strong> User: {user?.email || 'None'} | Profile: {profile?.business_name || 'None'} | Tier: {profile?.tier || 'None'}
        </div>
      )}
      
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/pos')}
                  className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  POS
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/inventory')}
                  className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  Inventory
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/analytics')}
                  className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/payments')}
                  className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  Payments
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/settings')}
                  className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  Settings
                </Button>
              </div>
              
              <LoginStatus />
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/pos'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  POS
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/inventory'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/analytics'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setActiveTab('subscription'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Subscription
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/ai-insights'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#faa51a] hover:text-[#040458] hover:bg-[#040458]/10 font-semibold"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/payments'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payments
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <div className="pt-2 border-t border-gray-200">
                  <Badge className="bg-[#faa51a] text-white">
                    {profile?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Debug: Check verification status */}
      {profile && (() => {
        console.log('Dashboard - profile.email_verified:', profile.email_verified, 'type:', typeof profile.email_verified, '=== false:', profile.email_verified === false, 'Boolean conversion:', Boolean(profile.email_verified))
        return null
      })()}

      {/* Email Verification Notice - Show if not verified */}
      {profile && !profile.email_verified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Email Verification Required:</strong> Please check your email and click the confirmation link to verify your account. 
                If you didn't receive the email, check your spam folder or contact support for manual verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!profile && (
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
              <div className="text-lg md:text-2xl font-bold">{(stats as any).totalSales}</div>
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
              <div className="text-sm md:text-2xl font-bold">UGX {(stats as any).totalRevenue.toLocaleString()}</div>
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
              <div className="text-lg md:text-2xl font-bold">{(stats as any).totalProducts}</div>
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
              <div className="text-lg md:text-2xl font-bold text-destructive">{(stats as any).lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 bg-gray-100">
            <TabsTrigger 
              value="overview" 
              className="text-xs md:text-sm data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="pos" 
              className="text-xs md:text-sm data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              POS
            </TabsTrigger>
            <TabsTrigger 
              value="inventory" 
              className="text-xs md:text-sm data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger 
              value="accounting" 
              className="text-xs md:text-sm data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Accounting
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="text-xs md:text-sm data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="text-xs md:text-sm data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Subscription
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="text-xs md:text-sm data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-xs md:text-sm data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Top Row - Quick Actions and AI Insights */}
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
                    className="w-full justify-start text-sm border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white" 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/pos')}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Start New Sale
                  </Button>
                  <Button 
                    className="w-full justify-start text-sm border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white" 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/inventory')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                  <Button 
                    className="w-full justify-start text-sm border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white" 
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
                type="sales"
                data={{
                  sales: Array.from({ length: (stats as any)?.totalSales || 0 }, (_, i) => ({
                    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
                    total: Math.floor(((stats as any)?.totalRevenue || 0) / ((stats as any)?.totalSales || 1)),
                    payment_method: 'cash'
                  })),
                  revenue: (stats as any)?.totalRevenue || 0,
                  growth: (stats as any)?.salesGrowth || 15.3
                }}
              />
            </div>

            {/* Bottom Row - AI Assistant (Full Width) */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center text-[#040458] text-xl">
                  <Brain className="h-6 w-6 mr-3 text-[#faa51a]" />
                  AI Business Assistant
                </CardTitle>
                <CardDescription className="text-base">
                  Get personalized insights, predictions, and recommendations for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Left Side - Main CTA */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="mb-6">
                      <Brain className="h-20 w-20 mx-auto lg:mx-0 text-[#faa51a] mb-4" />
                      <h3 className="text-2xl font-bold text-[#040458] mb-3">
                        Chat with Your AI Assistant
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Ask questions about your sales, inventory, finances, and get instant AI-powered insights tailored to your business.
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/ai-chat')}
                      className="bg-[#faa51a] hover:bg-[#040458] text-white px-8 py-4 text-lg font-semibold"
                    >
                      <MessageSquareText className="h-6 w-6 mr-3" />
                      Start AI Chat
                    </Button>
                  </div>

                  {/* Right Side - Feature Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
                    <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-[#faa51a]/5 transition-colors">
                      <TrendingUp className="h-8 w-8 mx-auto text-[#faa51a] mb-3" />
                      <h4 className="font-semibold text-[#040458] mb-1">Sales Insights</h4>
                      <p className="text-sm text-gray-600">Analyze performance</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-[#faa51a]/5 transition-colors">
                      <Package className="h-8 w-8 mx-auto text-[#faa51a] mb-3" />
                      <h4 className="font-semibold text-[#040458] mb-1">Inventory Help</h4>
                      <p className="text-sm text-gray-600">Manage stock levels</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-[#faa51a]/5 transition-colors">
                      <DollarSign className="h-8 w-8 mx-auto text-[#faa51a] mb-3" />
                      <h4 className="font-semibold text-[#040458] mb-1">Financial Advice</h4>
                      <p className="text-sm text-gray-600">Optimize revenue</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-[#faa51a]/5 transition-colors">
                      <BarChart3 className="h-8 w-8 mx-auto text-[#faa51a] mb-3" />
                      <h4 className="font-semibold text-[#040458] mb-1">Predictions</h4>
                      <p className="text-sm text-gray-600">Forecast trends</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

          <TabsContent value="accounting">
            <AccountingDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <AdvancedReports userId={profile?.id || user?.id || ''} />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionManager userId={profile?.id || user?.id || ''} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentVerification />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
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
              
              <EmailNotificationSettings userId={profile?.id || user?.id || ''} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard
