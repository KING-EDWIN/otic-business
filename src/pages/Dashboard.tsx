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
import { DataService } from '@/services/dataService'
import { supabase } from '@/lib/supabaseClient'

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
  
  // Simple state for stats
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockItems: 0
  })
  const [statsLoading, setStatsLoading] = useState(false)

  // Load stats using DataService
  useEffect(() => {
  const loadStats = async () => {
    if (!user?.id) return
    
    try {
      setStatsLoading(true)
      const statsData = await DataService.getStats(user.id)
      setStats(statsData)
      console.log('Loaded stats:', statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
      // Set fallback stats to prevent infinite loading
      setStats({
        totalSales: 0,
        totalProducts: 0,
        totalRevenue: 0,
        lowStockItems: 0
      })
    } finally {
      setStatsLoading(false)
    }
  }

    loadStats()
  }, [user?.id])

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
    }, 5000) // Reduced to 5 second timeout

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 text-sm">
          <strong>Debug Info:</strong> User: {user?.email || 'None'} | Profile: {profile?.business_name || 'None'} | Tier: {profile?.tier || 'None'}
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
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

            {/* Centered Navigation Menu */}
            <div className="hidden md:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/pos')}
                className="text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-4 py-2 font-medium"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                POS
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/inventory')}
                className="text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-4 py-2 font-medium"
              >
                <Package className="h-4 w-4 mr-2" />
                Inventory
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/analytics')}
                className="text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-4 py-2 font-medium"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/payments')}
                className="text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-4 py-2 font-medium"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Payments
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/customers')}
                className="text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-4 py-2 font-medium"
              >
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-4 py-2 font-medium"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>

            {/* Right side - Mobile menu and Login Status */}
            <div className="flex items-center space-x-2">
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
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
                  className="justify-start text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  POS
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/inventory'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/analytics'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/payments'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payments
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/customers'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Customers
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/ai-chat'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Chat
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }} 
                  className="justify-start text-[#040458] hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <div className="pt-2 border-t border-gray-200">
                  <Badge className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white">
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
        
        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-lg opacity-90">Here's what's happening with your business today.</p>
          </div>
          <div className="absolute right-4 top-4 opacity-20">
            <TrendingUp className="h-16 w-16" />
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-green-500 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any).totalSales || 0}</div>
              <p className="text-xs opacity-90">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {((stats as any).totalRevenue || 0).toLocaleString()}</div>
              <p className="text-xs opacity-90">
                +15.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any).totalProducts || 0}</div>
              <p className="text-xs opacity-90">
                +2 new this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-500 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any).lowStockItems || 0}</div>
              <p className="text-xs opacity-90">
                items need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <p className="text-sm text-gray-600 ml-4">Common tasks to get you started.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/pos')}
              className="h-20 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white hover:opacity-90 transition-all duration-200 shadow-lg"
            >
              <div className="flex flex-col items-center space-y-2">
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm font-medium">Start New Sale</span>
              </div>
            </Button>
            <Button 
              onClick={() => navigate('/inventory')}
              className="h-20 bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-lg"
            >
              <div className="flex flex-col items-center space-y-2">
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">Add New Product</span>
              </div>
            </Button>
            <Button 
              onClick={() => navigate('/analytics')}
              className="h-20 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-lg"
            >
              <div className="flex flex-col items-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm font-medium">View Reports</span>
              </div>
            </Button>
            <Button 
              onClick={() => navigate('/payments')}
              className="h-20 bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200 shadow-lg"
            >
              <div className="flex flex-col items-center space-y-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm font-medium">Accounting</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Sales Performance */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-[#040458]" />
              <h2 className="text-xl font-semibold text-gray-800">Sales Performance</h2>
            </div>
            <p className="text-sm text-gray-600 ml-4">Weekly sales and revenue trends.</p>
          </div>
          <Card className="p-6 bg-white shadow-lg">
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Sales chart will be displayed here</p>
                <p className="text-sm text-gray-400">Data visualization coming soon</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Business Assistant */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">AI Business Assistant</h2>
                <p className="text-sm opacity-90">Get insights and recommendations for your business</p>
              </div>
              <Button 
                onClick={() => navigate('/ai-chat')}
                className="bg-white text-[#040458] hover:bg-gray-100"
              >
                <Brain className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
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
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
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
            <Card className="w-full bg-white/80 backdrop-blur-sm border-0 shadow-xl">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
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
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
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
