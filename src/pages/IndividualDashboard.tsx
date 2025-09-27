import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { IndividualBusinessAccessService, BusinessAccess } from '@/services/individualBusinessAccessService'
import { IndividualUserService, TimeEntry as ServiceTimeEntry } from '@/services/individualUserService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Clock, 
  TrendingUp, 
  Calendar,
  Target,
  BarChart3,
  Building2,
  LogOut,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Timer,
  Activity,
  DollarSign,
  Users,
  Briefcase,
  Package,
  CreditCard
} from 'lucide-react'
import IndividualLoginStatus from '@/components/IndividualLoginStatus'
import IndividualBusinessSwitcher from '@/components/IndividualBusinessSwitcher'
import IndividualInvitationHandler from '@/components/IndividualInvitationHandler'
import LoadingSpinner from '@/components/LoadingSpinner'

interface TimeEntry {
  id: string
  business_id: string
  business_name: string
  start_time: string
  end_time?: string
  duration?: number
  description: string
  date: string
}

interface WorkStats {
  totalHours: number
  todayHours: number
  thisWeekHours: number
  activeBusinesses: number
  completedTasks: number
}

const IndividualDashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAccess | null>(null)
  const [timeEntries, setTimeEntries] = useState<ServiceTimeEntry[]>([])
  const [workStats, setWorkStats] = useState<WorkStats>({
    totalHours: 0,
    todayHours: 0,
    thisWeekHours: 0,
    activeBusinesses: 0,
    completedTasks: 0
  })
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const loadDashboardData = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        
      // Load real dashboard stats
      const stats = await IndividualUserService.getDashboardStats(user.id)
      setWorkStats(stats)
      
      // Load time entries for display
      const entries = await IndividualUserService.getTimeEntries(user.id, undefined, 10)
      setTimeEntries(entries)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
        setLoading(false)
      }
    }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleBusinessSelect = (business: BusinessAccess) => {
    setSelectedBusiness(business)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const quickActions = [
    {
      id: 'time_tracking',
      title: 'Time Tracking',
      description: 'Track your work hours',
      icon: <Timer className="h-5 w-5" />,
      color: 'bg-blue-500',
      action: () => navigate('/time-tracking')
    },
    {
      id: 'task_management',
      title: 'Task Management',
      description: 'Manage your tasks',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-500',
      action: () => navigate('/tasks')
    },
    {
      id: 'reports',
      title: 'Work Reports',
      description: 'View your work reports',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-purple-500',
      action: () => navigate('/reports')
    },
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Update your profile',
      icon: <User className="h-5 w-5" />,
      color: 'bg-orange-500',
      action: () => navigate('/individual-settings')
    }
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Otic Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src="/Layer 2.png" 
                  alt="Otic Business Logo" 
                  className="h-10 md:h-12 w-auto object-contain"
                />
              <div>
                  <h1 className="text-xl font-bold text-[#040458]">Individual Dashboard</h1>
                  <p className="text-sm text-gray-600">Personal workspace</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <IndividualBusinessSwitcher onBusinessSelect={handleBusinessSelect} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/individual-settings')}
                className="text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {getGreeting()}, {user?.email?.split('@')[0]}! 👋
                  </h2>
                  <p className="text-white/90 mb-4">
                    {formatDate(currentTime)} • {formatTime(currentTime)}
                  </p>
                  <p className="text-white/80">
                    Track your work, manage tasks, and stay productive across all your business collaborations.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="text-right">
                    <div className="text-3xl font-bold">{formatTime(currentTime)}</div>
                    <div className="text-white/80">{formatDate(currentTime)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-[#040458]">{workStats.totalHours}h</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
      </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-[#040458]">{workStats.todayHours}h</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-[#040458]">{workStats.thisWeekHours}h</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Businesses</p>
                  <p className="text-2xl font-bold text-[#040458]">{workStats.activeBusinesses}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Quick Actions</span>
              </CardTitle>
                <CardDescription>
                  Manage your work and productivity
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      onClick={action.action}
                      className="h-auto p-4 flex items-start space-x-3 hover:bg-gray-50"
                    >
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                      </div>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>

            {/* Business Access */}
            {selectedBusiness && (
              <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Business Access: {selectedBusiness.business_name}</span>
              </CardTitle>
                  <CardDescription>
                    Access business systems and data
                  </CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['pos', 'inventory', 'accounting', 'payments', 'customers'].map((page) => (
                      <Button
                        key={page}
                        variant="outline"
                        onClick={() => navigate(`/business/${selectedBusiness.business_id}/${page}`)}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        disabled={!selectedBusiness.permissions.includes(page)}
                      >
                        <div className="text-2xl">
                          {page === 'pos' && <Briefcase />}
                          {page === 'inventory' && <Package />}
                          {page === 'accounting' && <DollarSign />}
                          {page === 'payments' && <CreditCard />}
                          {page === 'customers' && <Users />}
                        </div>
                        <div className="text-sm font-medium capitalize">{page}</div>
                        {selectedBusiness.permissions.includes(page) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    ))}
              </div>
            </CardContent>
          </Card>
            )}
                </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invitations */}
            <IndividualInvitationHandler />

            {/* Recent Activity */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your work activity will appear here
                  </p>
                </div>
            </CardContent>
          </Card>

            {/* Last Visited Business */}
            {selectedBusiness && (
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Last Visited</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#040458]/10 rounded-lg">
                        <Building2 className="h-4 w-4 text-[#040458]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{selectedBusiness.business_name}</div>
                        <div className="text-sm text-gray-600 capitalize">
                          {selectedBusiness.business_type} • {selectedBusiness.access_level}
                    </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/business/${selectedBusiness.business_id}/dashboard`)}
                      className="w-full bg-[#040458] hover:bg-[#030345] text-white"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
            )}
          </div>
      </div>
      </main>
    </div>
  )
}

export default IndividualDashboard