import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  Mail, 
  Clock, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Percent, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Send, 
  Calculator, 
  Receipt, 
  Building2, 
  Bell, 
  RefreshCw, 
  Save, 
  Upload, 
  ExternalLink, 
  ListFilter, 
  SortAsc, 
  SortDesc, 
  Printer, 
  Share2, 
  History, 
  Repeat, 
  Clock3, 
  CalendarDays, 
  CalendarCheck, 
  CalendarX, 
  CalendarPlus, 
  CalendarMinus, 
  CalendarOff, 
  CalendarHeart, 
  CalendarRange, 
  CalendarSearch, 
  CalendarClock, 
  CalendarIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { reportsService, Report, ReportSchedule, ReportStats } from '@/services/reportsService'

// Remove the local ReportData interface since we're using the one from the service

const Reports = () => {
  const navigate = useNavigate()
  const { appUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedReportType, setSelectedReportType] = useState('sales')
  const [timeframe, setTimeframe] = useState('last_30_days')
  const [generatedReports, setGeneratedReports] = useState<Report[]>([])
  const [scheduledReports, setScheduledReports] = useState<ReportSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [reportStats, setReportStats] = useState<ReportStats>({
    totalReports: 0,
    scheduledReports: 0,
    thisMonthReports: 0,
    totalViews: 0
  })

  const reportTypes = [
    { id: 'sales', name: 'Sales Reports', icon: TrendingUp, description: 'Analyze sales performance and trends' },
    { id: 'financial', name: 'Financial Reports', icon: DollarSign, description: 'Profit & Loss, Balance Sheet, Cash Flow' },
    { id: 'inventory', name: 'Inventory Reports', icon: Package, description: 'Stock levels, inventory value, low stock alerts' },
    { id: 'customer', name: 'Customer Reports', icon: Users, description: 'Customer behavior and loyalty analysis' },
    { id: 'tax', name: 'Tax Reports', icon: Percent, description: 'VAT, Income Tax, EFRIS reports' },
    { id: 'expense', name: 'Expense Reports', icon: Receipt, description: 'Business expense tracking and analysis' }
  ]

  const timeframes = [
    { id: 'today', name: 'Today' },
    { id: 'last_7_days', name: 'Last 7 Days' },
    { id: 'last_30_days', name: 'Last 30 Days' },
    { id: 'this_month', name: 'This Month' },
    { id: 'last_month', name: 'Last Month' },
    { id: 'this_quarter', name: 'This Quarter' },
    { id: 'last_quarter', name: 'Last Quarter' },
    { id: 'this_year', name: 'This Year' },
    { id: 'last_year', name: 'Last Year' },
    { id: 'custom', name: 'Custom Range' }
  ]

  useEffect(() => {
    if (appUser?.id) {
      loadReports()
      loadScheduledReports()
      loadReportStats()
    }
  }, [appUser?.id])

  const loadReports = async () => {
    try {
      setLoading(true)
      const reports = await reportsService.getReports(appUser!.id)
      setGeneratedReports(reports)
    } catch (error) {
      console.error('Error loading reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const loadScheduledReports = async () => {
    try {
      const schedules = await reportsService.getReportSchedules(appUser!.id)
      setScheduledReports(schedules)
    } catch (error) {
      console.error('Error loading scheduled reports:', error)
      toast.error('Failed to load scheduled reports')
    }
  }

  const loadReportStats = async () => {
    try {
      const stats = await reportsService.getReportStats(appUser!.id)
      setReportStats(stats)
    } catch (error) {
      console.error('Error loading report stats:', error)
    }
  }

  const generateReport = async () => {
    if (!selectedReportType || !appUser?.id) {
      toast.error('Please select a report type and ensure you are logged in')
      return
    }

    try {
      setLoading(true)
      
      // Generate report content using the service
      const reportContent = await reportsService.generateReportContent(selectedReportType, timeframe, appUser.id)
      
      // Create the report in Supabase
      const newReport = await reportsService.createReport({
        user_id: appUser.id,
        report_type: selectedReportType,
        title: `${reportTypes.find(t => t.id === selectedReportType)?.name} - ${timeframes.find(t => t.id === timeframe)?.name}`,
        content: reportContent,
        timeframe,
        status: 'completed',
        generated_at: new Date().toISOString()
      })

      setGeneratedReports(prev => [newReport, ...prev])
      await loadReportStats() // Refresh stats
      toast.success('Report generated successfully!')
      
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = (report: Report) => {
    const blob = new Blob([report.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.replace(/ /g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Report downloaded successfully!')
  }

  const viewReport = async (report: Report) => {
    try {
      // Record the view
      await reportsService.recordReportView(report.id, appUser!.id)
      // You could open a modal or navigate to a detailed view here
      toast.success('Report view recorded!')
    } catch (error) {
      console.error('Error recording report view:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Generating</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Mock chart data
  const salesData = [
    { month: 'Jan', sales: 4000, revenue: 2400000 },
    { month: 'Feb', sales: 3000, revenue: 1800000 },
    { month: 'Mar', sales: 5000, revenue: 3000000 },
    { month: 'Apr', sales: 4500, revenue: 2700000 },
    { month: 'May', sales: 6000, revenue: 3600000 },
    { month: 'Jun', sales: 5500, revenue: 3300000 }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#faa51a] to-[#ff6b35] rounded-xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#040458] to-[#1e40af] bg-clip-text text-transparent">
                    Business Reports
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Generate comprehensive business reports and analytics
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowScheduleDialog(true)}
                className="bg-gradient-to-r from-[#040458] to-[#1e40af] hover:from-[#030345] hover:to-[#0f1a5c] text-white shadow-lg"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Report Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Total Reports</p>
                  <p className="text-3xl font-bold text-[#040458]">{reportStats.totalReports}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">This Month</p>
                  <p className="text-3xl font-bold text-green-600">{reportStats.thisMonthReports}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Scheduled</p>
                  <p className="text-3xl font-bold text-purple-600">{reportStats.scheduledReports}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md">
                  <Clock3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Total Views</p>
                  <p className="text-3xl font-bold text-orange-600">{reportStats.totalViews}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
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
                value="generate"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Generate Report
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Report History
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Types */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Available Reports</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">Choose from various report types</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {reportTypes.map((type) => (
                      <div
                        key={type.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-[#040458]/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedReportType(type.id)
                          setActiveTab('generate')
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-[#040458]/10 rounded-lg">
                            <type.icon className="h-5 w-5 text-[#040458]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#040458]">{type.name}</h3>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sales Performance Chart */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Sales Performance</span>
                  </CardTitle>
                  <CardDescription className="text-green-100">Monthly sales and revenue trends</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
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
                        dataKey="sales" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#040458]">Generate New Report</CardTitle>
                <CardDescription className="text-gray-600">Configure and generate your desired report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="reportType" className="text-[#040458]">Report Type</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger className="w-full bg-white/50 border-white/30 text-[#040458]">
                        <SelectValue placeholder="Select a report type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-sm">
                        {reportTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeframe" className="text-[#040458]">Timeframe</Label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-full bg-white/50 border-white/30 text-[#040458]">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-sm">
                        {timeframes.map(tf => (
                          <SelectItem key={tf.id} value={tf.id}>{tf.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={generateReport} 
                    disabled={loading}
                    className="bg-gradient-to-r from-[#040458] to-[#1e40af] hover:from-[#030345] hover:to-[#0f1a5c] text-white shadow-lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#040458]">Report History</CardTitle>
                <CardDescription className="text-gray-600">View and manage your generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#040458]" />
                    <p className="text-gray-600">Loading reports...</p>
                  </div>
                ) : generatedReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports generated yet</h3>
                    <p className="text-gray-600 mb-6">Generate your first report to get started.</p>
                    <Button
                      onClick={() => setActiveTab('generate')}
                      className="bg-gradient-to-r from-[#040458] to-[#1e40af] hover:from-[#030345] hover:to-[#0f1a5c] text-white"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-[#040458] to-[#1e40af] rounded-lg">
                              <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-[#040458]">{report.title}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Type: {report.type}</span>
                                <span>Timeframe: {timeframes.find(tf => tf.id === report.timeframe)?.name}</span>
                                <span>Generated: {new Date(report.generated_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              {getStatusBadge(report.status)}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadReport(report)}
                                className="text-[#040458] border-[#040458] hover:bg-[#040458] hover:text-white"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewReport(report)}
                                className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Usage Chart */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Report Usage</span>
                  </CardTitle>
                  <CardDescription className="text-purple-100">Most popular report types</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Sales', value: 45 },
                      { name: 'Financial', value: 30 },
                      { name: 'Inventory', value: 20 },
                      { name: 'Customer', value: 15 },
                      { name: 'Tax', value: 10 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#purpleGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Report Generation Trends */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Generation Trends</span>
                  </CardTitle>
                  <CardDescription className="text-orange-100">Reports generated over time</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
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
                        dataKey="sales" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30">
          <DialogHeader>
            <DialogTitle className="text-[#040458]">Schedule Report</DialogTitle>
            <DialogDescription className="text-gray-600">
              Set up recurring reports to be sent automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleReportType" className="text-[#040458]">Report Type</Label>
              <Select>
                <SelectTrigger className="bg-white/50 border-white/30 text-[#040458]">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm">
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleFrequency" className="text-[#040458]">Frequency</Label>
              <Select>
                <SelectTrigger className="bg-white/50 border-white/30 text-[#040458]">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleEmail" className="text-[#040458]">Email Address</Label>
              <Input
                id="scheduleEmail"
                type="email"
                className="bg-white/50 border-white/30 text-[#040458]"
                placeholder="Enter email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)} className="hover:bg-gray-100">
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Report scheduled successfully!')
              setShowScheduleDialog(false)
            }} className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white">
              Schedule Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Reports
