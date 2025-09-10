import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { OticAPI } from '@/services/api'
import { AIAnalytics } from '@/services/aiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AIInsights from '@/components/AIInsights'
import AIChatBot from '@/components/AIChatBot'
import { SubscriptionManager } from '@/components/SubscriptionManager'
import { AdvancedReports } from '@/components/AdvancedReports'
import PaymentVerification from '@/components/PaymentVerification'
import { EmailNotificationSettings } from '@/components/EmailNotificationSettings'
import BusinessLoginStatus from '@/components/BusinessLoginStatus'
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
  Clock,
  Calculator
} from 'lucide-react'
import { DataService } from '@/services/dataService'
import { supabase } from '@/lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardSkeleton, CardSkeleton } from '@/components/ui/skeletons'
import { useIsMobile, ResponsiveContainer as MobileResponsiveContainer, MobileCard } from '@/components/MobileOptimizations'


const Dashboard = () => {
  const { profile, signOut, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()
  
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
      // Don't set fallback data - let error state handle this
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Skeleton */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-white/40 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6 space-y-6">
          {/* Welcome Banner Skeleton */}
          <div className="h-32 bg-white/70 backdrop-blur-sm rounded-xl animate-pulse"></div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-64 bg-white/70 backdrop-blur-sm rounded-xl animate-pulse"></div>
              <div className="h-48 bg-white/70 backdrop-blur-sm rounded-xl animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-white/70 backdrop-blur-sm rounded-xl animate-pulse"></div>
              <div className="h-48 bg-white/70 backdrop-blur-sm rounded-xl animate-pulse"></div>
            </div>
          </div>
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
    <div className="min-h-screen bg-white">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 text-sm">
          <strong>Debug Info:</strong> User: {user?.email || 'None'} | Profile: {profile?.business_name || 'None'} | Tier: {profile?.tier || 'None'}
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-8 w-8"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#040458]">Otic</span>
                <span className="text-xs text-[#faa51a] -mt-1">Business</span>
              </div>
            </Link>

            {/* Centered Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
              >
                Overview
              </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/pos')}
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
                >
                  POS
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/inventory')}
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
                >
                  Inventory
                </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/accounting')}
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
              >
                Accounting
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/analytics')}
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
                >
                  Analytics
                </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/reports')}
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
              >
                Reports
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/customers')}
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
              >
                Customers
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/payments')}
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
                >
                  Payments
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/settings')}
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
                >
                  Settings
                </Button>
              </div>

            {/* Right side - Profile */}
            <div className="flex items-center space-x-2">

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <BusinessLoginStatus />
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
        <div className="mb-8 bg-gradient-to-r from-[#040458] via-purple-600 to-[#faa51a] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
            <p className="text-xl opacity-90">Here's what's happening with your business today.</p>
          </div>
          <div className="absolute right-6 top-6 opacity-30">
            <svg className="h-20 w-20 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14l5-5 5 5z"/>
            </svg>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statsLoading ? (
            <>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
            </>
          ) : (
            <>
              {/* Total Sales - Green */}
              <Card className="bg-green-500 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium opacity-90">Total Sales</h3>
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{(stats as any).totalSales || 0}</div>
                  <p className="text-sm opacity-90">+20.1% from last month</p>
            </CardContent>
          </Card>

              {/* Total Revenue - Blue */}
              <Card className="bg-blue-500 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">UGX {((stats as any).totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-sm opacity-90">+15.3% from last month</p>
            </CardContent>
          </Card>

              {/* Products - Orange */}
              <Card className="bg-orange-500 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium opacity-90">Products</h3>
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{(stats as any).totalProducts || 0}</div>
                  <p className="text-sm opacity-90">+2 new this week</p>
            </CardContent>
          </Card>

              {/* Low Stock - Red */}
              <Card className="bg-red-500 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium opacity-90">Low Stock</h3>
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{(stats as any).lowStockItems || 0}</div>
                  <p className="text-sm opacity-90">items need restocking</p>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Main Content Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8">
          {/* Left Column - Quick Actions */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
              </div>
              <p className="text-sm text-gray-600 ml-4">Common tasks to get you started.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Button 
                    onClick={() => navigate('/pos')}
                className="h-20 md:h-24 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white hover:opacity-90 transition-all duration-200 shadow-lg rounded-xl"
              >
                <div className="flex flex-col items-center space-y-2">
                  <ShoppingCart className="h-8 w-8" />
                  <span className="text-sm font-medium">Start New Sale</span>
                </div>
                  </Button>
                  <Button 
                    onClick={() => navigate('/inventory')}
                className="h-20 md:h-24 bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-lg rounded-xl"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Plus className="h-8 w-8" />
                  <span className="text-sm font-medium">Add New Product</span>
                </div>
                  </Button>
                  <Button 
                    onClick={() => navigate('/analytics')}
                className="h-20 md:h-24 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-lg rounded-xl"
              >
                <div className="flex flex-col items-center space-y-2">
                  <BarChart3 className="h-8 w-8" />
                  <span className="text-sm font-medium">View Reports</span>
                </div>
                  </Button>
                    <Button
                onClick={() => navigate('/accounting')}
                className="h-20 md:h-24 bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200 shadow-lg rounded-xl"
              >
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="h-8 w-8" />
                  <span className="text-sm font-medium">Accounting</span>
                </div>
                    </Button>
                  </div>
                    </div>

          {/* Right Column - Sales Performance */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-[#040458]" />
                <h2 className="text-xl font-semibold text-gray-800">Sales Performance</h2>
                    </div>
              <p className="text-sm text-gray-600 ml-4">Weekly sales and revenue trends.</p>
                    </div>
            <Card className="p-6 bg-white shadow-lg rounded-xl">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { name: 'Mon', sales: 120, revenue: 2400 },
                    { name: 'Tue', sales: 90, revenue: 1800 },
                    { name: 'Wed', sales: 150, revenue: 3000 },
                    { name: 'Thu', sales: 110, revenue: 2200 },
                    { name: 'Fri', sales: 80, revenue: 1600 },
                    { name: 'Sat', sales: 60, revenue: 1200 },
                    { name: 'Sun', sales: 40, revenue: 800 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      label={{ value: 'Day', position: 'insideBottom', offset: -10 }}
                      fontSize={12}
                    />
                    <YAxis 
                      label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'sales' ? `${value} sales` : `UGX ${value.toLocaleString()}`,
                        name === 'sales' ? 'Sales' : 'Revenue'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#faa51a" 
                      strokeWidth={3}
                      name="Sales"
                      dot={{ fill: '#faa51a', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#040458" 
                      strokeWidth={3}
                      name="Revenue"
                      dot={{ fill: '#040458', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                </div>
            </Card>
          </div>
        </div>

        {/* Bottom Row - AI Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Insights - Left */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
                <p className="text-sm opacity-90">Discover patterns and trends in your data</p>
              </div>
              <Button 
                onClick={() => navigate('/ai-insights')}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Brain className="h-4 w-4 mr-2" />
                View Insights
                  </Button>
                </div>
          </div>

          {/* AI Business Assistant - Right */}
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

              
      </main>
    </div>
  )
}

export default Dashboard
