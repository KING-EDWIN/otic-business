import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Users, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Bell,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { businessMonitoringService, BusinessAlert, BusinessKPI, BusinessGoal, BusinessInsight } from '@/services/businessMonitoringService'
import { CardSkeleton, TableSkeleton, ChartSkeleton } from '@/components/LoadingSkeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface BusinessMonitoringDashboardProps {
  userId: string
}

const BusinessMonitoringDashboard: React.FC<BusinessMonitoringDashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [alerts, setAlerts] = useState<BusinessAlert[]>([])
  const [kpis, setKpis] = useState<BusinessKPI[]>([])
  const [goals, setGoals] = useState<BusinessGoal[]>([])
  const [insights, setInsights] = useState<BusinessInsight[]>([])
  const [dashboardSummary, setDashboardSummary] = useState({
    totalAlerts: 0,
    unreadAlerts: 0,
    activeGoals: 0,
    completedGoals: 0,
    recentInsights: 0,
    kpiCount: 0
  })

  // Loading states
  const [loading, setLoading] = useState(true)
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [kpisLoading, setKpisLoading] = useState(true)
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadDashboardData()
    }
  }, [userId])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadAlerts(),
        loadKPIs(),
        loadGoals(),
        loadInsights(),
        loadDashboardSummary()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      setAlertsLoading(true)
      const data = await businessMonitoringService.getAlerts(userId)
      setAlerts(data)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setAlertsLoading(false)
    }
  }

  const loadKPIs = async () => {
    try {
      setKpisLoading(true)
      const data = await businessMonitoringService.getKPIs(userId)
      setKpis(data)
    } catch (error) {
      console.error('Error loading KPIs:', error)
    } finally {
      setKpisLoading(false)
    }
  }

  const loadGoals = async () => {
    try {
      setGoalsLoading(true)
      const data = await businessMonitoringService.getBusinessGoals(userId)
      setGoals(data)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setGoalsLoading(false)
    }
  }

  const loadInsights = async () => {
    try {
      setInsightsLoading(true)
      const data = await businessMonitoringService.getBusinessInsights(userId)
      setInsights(data)
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  const loadDashboardSummary = async () => {
    try {
      const data = await businessMonitoringService.getDashboardSummary(userId)
      setDashboardSummary(data)
    } catch (error) {
      console.error('Error loading dashboard summary:', error)
    }
  }

  const markAlertAsRead = async (alertId: string) => {
    try {
      await businessMonitoringService.markAlertAsRead(alertId)
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ))
      setDashboardSummary(prev => ({
        ...prev,
        unreadAlerts: Math.max(0, prev.unreadAlerts - 1)
      }))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      await businessMonitoringService.resolveAlert(alertId)
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      setDashboardSummary(prev => ({
        ...prev,
        totalAlerts: Math.max(0, prev.totalAlerts - 1),
        unreadAlerts: Math.max(0, prev.unreadAlerts - 1)
      }))
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  // Mock chart data
  const kpiChartData = [
    { month: 'Jan', revenue: 2400000, sales: 145, customers: 89 },
    { month: 'Feb', revenue: 2800000, sales: 168, customers: 95 },
    { month: 'Mar', revenue: 3200000, sales: 192, customers: 102 },
    { month: 'Apr', revenue: 2900000, sales: 174, customers: 98 },
    { month: 'May', revenue: 3500000, sales: 210, customers: 115 },
    { month: 'Jun', revenue: 3800000, sales: 228, customers: 125 }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Total Alerts</p>
                    <p className="text-2xl font-bold text-[#040458]">{dashboardSummary.totalAlerts}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Unread Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{dashboardSummary.unreadAlerts}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Active Goals</p>
                    <p className="text-2xl font-bold text-green-600">{dashboardSummary.activeGoals}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Completed Goals</p>
                    <p className="text-2xl font-bold text-blue-600">{dashboardSummary.completedGoals}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Recent Insights</p>
                    <p className="text-2xl font-bold text-purple-600">{dashboardSummary.recentInsights}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">KPIs Tracked</p>
                    <p className="text-2xl font-bold text-indigo-600">{dashboardSummary.kpiCount}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 shadow-lg">
          <TabsList className="bg-transparent border-0">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="alerts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
            >
              Alerts
            </TabsTrigger>
            <TabsTrigger 
              value="kpis"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
            >
              KPIs
            </TabsTrigger>
            <TabsTrigger 
              value="goals"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
            >
              Goals
            </TabsTrigger>
            <TabsTrigger 
              value="insights"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
            >
              Insights
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Recent Alerts</span>
                </CardTitle>
                <CardDescription className="text-red-100">Latest business alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {alertsLoading ? (
                  <TableSkeleton rows={3} />
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No alerts at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="p-3 bg-white/80 rounded-lg border border-white/40">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getSeverityIcon(alert.severity)}
                            <div>
                              <h4 className="font-semibold text-sm text-[#040458]">{alert.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            {!alert.is_read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAlertAsRead(alert.id)}
                                className="text-xs"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KPI Trends Chart */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>KPI Trends</span>
                </CardTitle>
                <CardDescription className="text-blue-100">Key performance indicators over time</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {kpisLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={kpiChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#040458]">Business Alerts</CardTitle>
              <CardDescription>Monitor and manage your business alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <TableSkeleton rows={5} />
              ) : alerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts found</h3>
                  <p className="text-gray-600">Your business is running smoothly!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-4 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <h3 className="font-semibold text-lg text-[#040458]">{alert.title}</h3>
                            <p className="text-gray-600 mt-1">{alert.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Type: {alert.alert_type}</span>
                              <span>Created: {new Date(alert.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {!alert.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAlertAsRead(alert.id)}
                              className="text-[#040458] border-[#040458] hover:bg-[#040458] hover:text-white"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                            className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#040458]">Key Performance Indicators</CardTitle>
              <CardDescription>Track your business performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <TableSkeleton rows={5} />
              ) : kpis.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No KPIs found</h3>
                  <p className="text-gray-600">Start tracking your business performance metrics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {kpis.map((kpi) => (
                    <div key={kpi.id} className="p-4 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-[#040458]">{kpi.kpi_name}</h3>
                          <p className="text-gray-600">{kpi.period} • {kpi.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#040458]">{kpi.kpi_value.toLocaleString()}</p>
                          {kpi.change_percentage && (
                            <p className={`text-sm ${kpi.change_percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {kpi.change_percentage > 0 ? '+' : ''}{kpi.change_percentage}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#040458]">Business Goals</CardTitle>
              <CardDescription>Set and track your business objectives</CardDescription>
            </CardHeader>
            <CardContent>
              {goalsLoading ? (
                <TableSkeleton rows={5} />
              ) : goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals set</h3>
                  <p className="text-gray-600">Start setting business goals to track your progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-[#040458]">{goal.goal_name}</h3>
                          <p className="text-gray-600">{goal.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Type: {goal.goal_type}</span>
                            <span>Target: {goal.target_value.toLocaleString()} {goal.unit}</span>
                            <span>Status: {goal.status}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#040458]">{goal.progress_percentage}%</p>
                          <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-[#040458] to-[#faa51a] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${goal.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#040458]">Business Insights</CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <TableSkeleton rows={5} />
              ) : insights.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No insights available</h3>
                  <p className="text-gray-600">Generate insights to get AI-powered recommendations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg">
                            <Lightbulb className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-[#040458]">{insight.title}</h3>
                            <p className="text-gray-600 mt-1">{insight.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Type: {insight.insight_type}</span>
                              <span>Confidence: {insight.confidence_score ? `${(insight.confidence_score * 100).toFixed(0)}%` : 'N/A'}</span>
                              <span>Impact: {insight.impact_level || 'N/A'}</span>
                            </div>
                            {insight.actionable && insight.action_items && (
                              <div className="mt-3">
                                <p className="text-sm font-semibold text-[#040458] mb-2">Action Items:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {insight.action_items.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white">
                          {insight.insight_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BusinessMonitoringDashboard

