import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
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
import BusinessSwitcher from '@/components/BusinessSwitcher'
import BusinessDropdown from '@/components/BusinessDropdown'
import AnalyticsReportsDropdown from '@/components/AnalyticsReportsDropdown'
import MyExtrasDropdown from '@/components/MyExtrasDropdown'
import { useDateRange } from '@/hooks/useDateRange'
import DateRangePicker from '@/components/DateRangePicker'
import { 
  Building2, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings,
  Plus,
  MessageSquareText,
  Camera,
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
  Calculator,
  Calendar,
  TrendingDown,
  Activity,
  Layers
} from 'lucide-react'
import { DataService } from '@/services/dataService'
import { supabase } from '@/lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'
import { DashboardSkeleton, CardSkeleton } from '@/components/ui/skeletons'
import { useIsMobile, ResponsiveContainer as MobileResponsiveContainer, MobileCard } from '@/components/MobileOptimizations'


const Dashboard = () => {
  const { profile, signOut, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  // Safely get business management context
  let currentBusiness = null
  try {
    const businessContext = useBusinessManagement()
    currentBusiness = businessContext.currentBusiness
  } catch (error) {
    console.log('BusinessManagementProvider not available, using fallback')
  }
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

  // Chart controls state
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [chartMetric, setChartMetric] = useState<'revenue' | 'profit' | 'sales' | 'stock'>('revenue')
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')
  
  // Date range management
  const { dateRange, updateDateRange, minDate, maxDate, dateRangeString } = useDateRange()

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

  // Generate chart data based on period and metric
  const generateChartData = () => {
    const baseData = {
      day: [
        { name: '6AM', value: 1200, sales: 8, profit: 400, stock: 45 },
        { name: '9AM', value: 2400, sales: 12, profit: 800, stock: 42 },
        { name: '12PM', value: 1800, sales: 9, profit: 600, stock: 38 },
        { name: '3PM', value: 3200, sales: 16, profit: 1000, stock: 35 },
        { name: '6PM', value: 2800, sales: 14, profit: 900, stock: 32 },
        { name: '9PM', value: 1600, sales: 8, profit: 500, stock: 30 }
      ],
      week: [
        { name: 'Mon', value: 12000, sales: 60, profit: 4000, stock: 280 },
        { name: 'Tue', value: 15000, sales: 75, profit: 5000, stock: 275 },
        { name: 'Wed', value: 18000, sales: 90, profit: 6000, stock: 270 },
        { name: 'Thu', value: 14000, sales: 70, profit: 4600, stock: 265 },
        { name: 'Fri', value: 22000, sales: 110, profit: 7200, stock: 260 },
        { name: 'Sat', value: 16000, sales: 80, profit: 5200, stock: 255 },
        { name: 'Sun', value: 10000, sales: 50, profit: 3200, stock: 250 }
      ],
      month: [
        { name: 'Week 1', value: 65000, sales: 325, profit: 21000, stock: 1200 },
        { name: 'Week 2', value: 72000, sales: 360, profit: 23000, stock: 1150 },
        { name: 'Week 3', value: 68000, sales: 340, profit: 22000, stock: 1100 },
        { name: 'Week 4', value: 75000, sales: 375, profit: 24000, stock: 1050 }
      ],
      year: [
        { name: 'Jan', value: 280000, sales: 1400, profit: 90000, stock: 4800 },
        { name: 'Feb', value: 320000, sales: 1600, profit: 102000, stock: 4600 },
        { name: 'Mar', value: 350000, sales: 1750, profit: 112000, stock: 4400 },
        { name: 'Apr', value: 300000, sales: 1500, profit: 96000, stock: 4200 },
        { name: 'May', value: 380000, sales: 1900, profit: 121000, stock: 4000 },
        { name: 'Jun', value: 420000, sales: 2100, profit: 134000, stock: 3800 }
      ]
    }

    return baseData[chartPeriod] || baseData.week
  }

  // Get chart configuration based on selected metric
  const getChartConfig = () => {
    const data = generateChartData()
    const metricKey = chartMetric === 'revenue' ? 'value' : chartMetric === 'profit' ? 'profit' : chartMetric === 'sales' ? 'sales' : 'stock'
    
    const configs = {
      revenue: {
        dataKey: 'value',
        color: '#040458',
        label: 'Revenue (UGX)',
        formatter: (value: number) => `UGX ${value.toLocaleString()}`,
        yAxisLabel: 'Revenue (UGX)'
      },
      profit: {
        dataKey: 'profit',
        color: '#10b981',
        label: 'Profit (UGX)',
        formatter: (value: number) => `UGX ${value.toLocaleString()}`,
        yAxisLabel: 'Profit (UGX)'
      },
      sales: {
        dataKey: 'sales',
        color: '#faa51a',
        label: 'Sales Count',
        formatter: (value: number) => `${value} sales`,
        yAxisLabel: 'Number of Sales'
      },
      stock: {
        dataKey: 'stock',
        color: '#ef4444',
        label: 'Stock Level',
        formatter: (value: number) => `${value} units`,
        yAxisLabel: 'Stock Units'
      }
    }

    return { ...configs[chartMetric], data }
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src="/Layer 2.png" 
                alt="Otic Business Logo" 
                className="h-8 lg:h-10 w-auto object-contain"
              />
            </Link>

            {/* Centered Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              <MyExtrasDropdown />
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
              <AnalyticsReportsDropdown />
              <BusinessDropdown />
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
                <div className="px-3 py-2">
                  <MyExtrasDropdown />
                </div>
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
                <div className="px-3 py-2">
                  <AnalyticsReportsDropdown />
                </div>
                <div className="px-3 py-2">
                  <BusinessDropdown />
                </div>
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
      <main className="container mx-auto px-3 lg:px-4 py-4 lg:py-8">
        {!profile && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Loading your business profile...</strong> This may take a moment.
            </p>
          </div>
        )}
        
        
        {/* Welcome Banner */}
        <div className="mb-6 lg:mb-8 bg-gradient-to-r from-[#040458] via-purple-600 to-[#faa51a] rounded-2xl p-4 lg:p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold mb-2">
                  Welcome back to {currentBusiness?.name || profile?.business_name || 'your business'}!
                </h1>
            <p className="text-base lg:text-xl opacity-90">Here's what's happening with your business today.</p>
              </div>
              <div className="flex flex-col items-center lg:items-end space-y-3">
                <div
                  className="bg-white/20 text-white border border-white/30 backdrop-blur-sm text-sm lg:text-base px-4 py-2 rounded-lg shadow-lg opacity-75 cursor-not-allowed"
                >
                  <Camera className="h-4 w-4 lg:h-5 lg:w-5 mr-2 inline" />
                  OTIC Vision
                  <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-0.5 rounded-full">
                    NEW
                  </Badge>
                </div>
                <p className="text-xs lg:text-sm opacity-75 text-center lg:text-right max-w-xs">
                  AI-powered product recognition<br />
                  <span className="text-xs">Premium feature</span>
                </p>
              </div>
            </div>
          </div>
          <div className="absolute right-6 top-6 opacity-30">
            <svg className="h-20 w-20 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14l5-5 5 5z"/>
            </svg>
          </div>
        </div>

        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          {statsLoading ? (
            <>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-3 lg:p-6 animate-pulse">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="h-3 lg:h-4 w-16 lg:w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 lg:h-6 lg:w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 lg:h-8 w-12 lg:w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 lg:h-3 w-16 lg:w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-3 lg:p-6 animate-pulse">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="h-3 lg:h-4 w-16 lg:w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 lg:h-6 lg:w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 lg:h-8 w-12 lg:w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 lg:h-3 w-16 lg:w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-3 lg:p-6 animate-pulse">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="h-3 lg:h-4 w-16 lg:w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 lg:h-6 lg:w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 lg:h-8 w-12 lg:w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 lg:h-3 w-16 lg:w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-3 lg:p-6 animate-pulse">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="h-3 lg:h-4 w-16 lg:w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 lg:h-6 lg:w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 lg:h-8 w-12 lg:w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 lg:h-3 w-16 lg:w-20 bg-gray-200 rounded"></div>
              </div>
            </>
          ) : (
            <>
              {/* Total Sales - Green */}
              <Card className="bg-green-500 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-xs lg:text-sm font-medium opacity-90">Total Sales</h3>
                    <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="text-xl lg:text-3xl font-bold mb-1">{(stats as any).totalSales || 0}</div>
                  <p className="text-xs lg:text-sm opacity-90">+20.1% from last month</p>
            </CardContent>
          </Card>

              {/* Total Revenue - Blue */}
              <Card className="bg-blue-500 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-xs lg:text-sm font-medium opacity-90">Total Revenue</h3>
                    <DollarSign className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="text-lg lg:text-3xl font-bold mb-1">UGX {((stats as any).totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs lg:text-sm opacity-90">+15.3% from last month</p>
            </CardContent>
          </Card>

              {/* Products - Orange */}
              <Card className="bg-orange-500 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-xs lg:text-sm font-medium opacity-90">Products</h3>
                    <Package className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="text-xl lg:text-3xl font-bold mb-1">{(stats as any).totalProducts || 0}</div>
                  <p className="text-xs lg:text-sm opacity-90">+2 new this week</p>
            </CardContent>
          </Card>

              {/* Low Stock - Red */}
              <Card className="bg-red-500 text-white border-0 shadow-lg rounded-xl">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-xs lg:text-sm font-medium opacity-90">Low Stock</h3>
                    <Package className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="text-xl lg:text-3xl font-bold mb-1">{(stats as any).lowStockItems || 0}</div>
                  <p className="text-xs lg:text-sm opacity-90">items need restocking</p>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Main Content Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-8">
          {/* Left Column - Quick Actions */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center mb-4 lg:mb-6">
              <div className="flex items-center space-x-2 mb-2 lg:mb-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Quick Actions</h2>
              </div>
              <p className="text-xs lg:text-sm text-gray-600 lg:ml-4">Common tasks to get you started.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
                  <Button 
                    onClick={() => navigate('/pos')}
                className="h-16 lg:h-20 md:h-24 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white hover:opacity-90 transition-all duration-200 shadow-lg rounded-xl"
              >
                <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                  <ShoppingCart className="h-5 w-5 lg:h-8 lg:w-8" />
                  <span className="text-xs lg:text-sm font-medium">Start New Sale</span>
                </div>
                  </Button>
                  <Button 
                    onClick={() => navigate('/inventory')}
                className="h-16 lg:h-20 md:h-24 bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-lg rounded-xl"
              >
                <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                  <Plus className="h-5 w-5 lg:h-8 lg:w-8" />
                  <span className="text-xs lg:text-sm font-medium">Add New Product</span>
                </div>
                  </Button>
                  <Button 
                    onClick={() => navigate('/analytics')}
                className="h-16 lg:h-20 md:h-24 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-lg rounded-xl"
              >
                <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                  <BarChart3 className="h-5 w-5 lg:h-8 lg:w-8" />
                  <span className="text-xs lg:text-sm font-medium">View Reports</span>
                </div>
                  </Button>
                    <Button
                onClick={() => navigate('/accounting')}
                className="h-16 lg:h-20 md:h-24 bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200 shadow-lg rounded-xl"
              >
                <div className="flex flex-col items-center space-y-1 lg:space-y-2">
                  <FileText className="h-5 w-5 lg:h-8 lg:w-8" />
                  <span className="text-xs lg:text-sm font-medium">Accounting</span>
                </div>
                    </Button>
                  </div>
                    </div>

          {/* Right Column - Enhanced Sales Performance */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
              <div className="flex items-center space-x-2 mb-2 lg:mb-0">
                <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-[#040458]" />
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Performance Analytics</h2>
                    </div>
              <p className="text-xs lg:text-sm text-gray-600">Interactive charts with multiple metrics</p>
                    </div>
            
            <Card className="p-3 lg:p-6 bg-white shadow-lg rounded-xl">
              {/* Chart Controls */}
              <div className="flex flex-wrap gap-2 lg:gap-3 mb-4 lg:mb-6">
                {/* Date Range Picker */}
                <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                    <span className="text-xs lg:text-sm font-medium text-gray-700">Date Range:</span>
                  </div>
                  <DateRangePicker
                    onDateRangeChange={updateDateRange}
                    initialRange={dateRange}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholder="Select date range"
                    className="w-full lg:w-56 min-w-48"
                  />
                </div>
                
                {/* Time Period Selector */}
                <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                    <span className="text-xs lg:text-sm font-medium text-gray-700">Period:</span>
                  </div>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {(['day', 'week', 'month', 'year'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        className={`px-2 lg:px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          chartPeriod === period
                            ? 'bg-[#040458] text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metric Selector */}
                <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                    <span className="text-xs lg:text-sm font-medium text-gray-700">Metric:</span>
                  </div>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {(['revenue', 'profit', 'sales', 'stock'] as const).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => setChartMetric(metric)}
                        className={`px-2 lg:px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          chartMetric === metric
                            ? 'bg-[#faa51a] text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart Type Selector */}
                <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                    <span className="text-xs lg:text-sm font-medium text-gray-700">Type:</span>
                  </div>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {(['line', 'bar', 'area'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`px-2 lg:px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          chartType === type
                            ? 'bg-green-500 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Display */}
              <div className="h-64 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {(() => {
                    const config = getChartConfig()
                    
                    if (chartType === 'line') {
                      return (
                        <LineChart data={config.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={window.innerWidth < 768 ? 9 : 11}
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      label={{ value: 'Time Period', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } }}
                      angle={window.innerWidth < 768 ? -45 : 0}
                      textAnchor={window.innerWidth < 768 ? 'end' : 'middle'}
                      height={window.innerWidth < 768 ? 60 : 40}
                    />
                    <YAxis 
                      fontSize={window.innerWidth < 768 ? 9 : 11}
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      label={{ value: getChartConfig().label, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } }}
                      tickFormatter={(value) => {
                        if (chartMetric === 'revenue' || chartMetric === 'profit') {
                          return `${(value / 1000).toFixed(0)}k`
                        }
                        return value.toString()
                      }}
                      width={window.innerWidth < 768 ? 50 : 60}
                    />
                    <Tooltip 
                            formatter={(value: number) => [config.formatter(value), config.label]}
                            labelStyle={{ color: '#374151' }}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                    />
                    <Line 
                      type="monotone" 
                            dataKey={config.dataKey} 
                            stroke={config.color} 
                      strokeWidth={3}
                            dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
                    />
                  </LineChart>
                      )
                    } else if (chartType === 'bar') {
                      return (
                        <BarChart data={config.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="name" 
                            fontSize={window.innerWidth < 768 ? 9 : 11}
                            tick={{ fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Time Period', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } }}
                            angle={window.innerWidth < 768 ? -45 : 0}
                            textAnchor={window.innerWidth < 768 ? 'end' : 'middle'}
                            height={window.innerWidth < 768 ? 60 : 40}
                          />
                          <YAxis 
                            fontSize={window.innerWidth < 768 ? 9 : 11}
                            tick={{ fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: getChartConfig().label, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } }}
                            tickFormatter={(value) => {
                              if (chartMetric === 'revenue' || chartMetric === 'profit') {
                                return `${(value / 1000).toFixed(0)}k`
                              }
                              return value.toString()
                            }}
                            width={window.innerWidth < 768 ? 50 : 60}
                          />
                          <Tooltip 
                            formatter={(value: number) => [config.formatter(value), config.label]}
                            labelStyle={{ color: '#374151' }}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar 
                            dataKey={config.dataKey} 
                            fill={config.color}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )
                    } else {
                      return (
                        <AreaChart data={config.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="name" 
                            fontSize={window.innerWidth < 768 ? 9 : 11}
                            tick={{ fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Time Period', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } }}
                            angle={window.innerWidth < 768 ? -45 : 0}
                            textAnchor={window.innerWidth < 768 ? 'end' : 'middle'}
                            height={window.innerWidth < 768 ? 60 : 40}
                          />
                          <YAxis 
                            fontSize={window.innerWidth < 768 ? 9 : 11}
                            tick={{ fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: getChartConfig().label, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' } }}
                            tickFormatter={(value) => {
                              if (chartMetric === 'revenue' || chartMetric === 'profit') {
                                return `${(value / 1000).toFixed(0)}k`
                              }
                              return value.toString()
                            }}
                            width={window.innerWidth < 768 ? 50 : 60}
                          />
                          <Tooltip 
                            formatter={(value: number) => [config.formatter(value), config.label]}
                            labelStyle={{ color: '#374151' }}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey={config.dataKey} 
                            stroke={config.color} 
                            fill={`${config.color}20`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      )
                    }
                  })()}
                </ResponsiveContainer>
                </div>

              {/* Chart Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getChartConfig().color }}
                      ></div>
                      <span className="text-gray-600">{getChartConfig().label}</span>
                    </div>
                    <span className="text-gray-500">
                      {chartPeriod.charAt(0).toUpperCase() + chartPeriod.slice(1)} view
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart
                  </div>
                </div>
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
