import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { IndividualUserService, WorkReport } from '@/services/individualUserService'
import { IndividualBusinessAccessService, BusinessAccess } from '@/services/individualBusinessAccessService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Download,
  Building2,
  Target,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import IndividualBusinessSwitcher from '@/components/IndividualBusinessSwitcher'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const WorkReports: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAccess | null>(null)
  const [reports, setReports] = useState<WorkReport[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly')

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user?.id])

  const loadData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Load accessible businesses
      const businesses = await IndividualBusinessAccessService.getAccessibleBusinesses(user.id)
      if (businesses.length > 0) {
        setSelectedBusiness(businesses[0])
      }

      // Load reports
      const reportData = await IndividualUserService.getWorkReports(user.id, undefined, 20)
      setReports(reportData)

    } catch (error) {
      console.error('Error loading work reports:', error)
      toast.error('Failed to load work reports')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessSelect = (business: BusinessAccess) => {
    setSelectedBusiness(business)
  }

  const generateReport = async () => {
    if (!user?.id || !selectedBusiness) {
      toast.error('Please select a business')
      return
    }

    try {
      setGeneratingReport(true)
      
      let periodStart: string
      let periodEnd: string = new Date().toISOString()
      
      const endDate = new Date()
      
      switch (reportType) {
        case 'daily':
          periodStart = new Date(endDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
          break
        case 'weekly':
          periodStart = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'monthly':
          periodStart = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
          break
        default:
          periodStart = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      const result = await IndividualUserService.generateWorkReport(
        user.id,
        selectedBusiness.business_id,
        reportType,
        periodStart,
        periodEnd
      )

      if (result.success) {
        toast.success('Work report generated successfully!')
        loadData() // Reload reports
      } else {
        toast.error(result.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating work report:', error)
      toast.error('Failed to generate work report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toFixed(2)}`
  }

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  const getReportTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'daily': 'bg-blue-100 text-blue-800',
      'weekly': 'bg-green-100 text-green-800',
      'monthly': 'bg-purple-100 text-purple-800',
      'custom': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || colors['weekly']
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (reports.length === 0) return []

    return reports.slice(0, 7).map(report => ({
      date: formatDate(report.report_period_start),
      hours: report.total_hours_worked,
      tasks: report.total_tasks_completed,
      earnings: report.total_earnings,
      productivity: report.productivity_score
    })).reverse()
  }

  const prepareProductivityData = () => {
    if (reports.length === 0) return []

    const latestReport = reports[0]
    if (!latestReport?.detailed_breakdown?.topCategories) return []

    return latestReport.detailed_breakdown.topCategories.map((cat: any) => ({
      name: cat.category,
      value: cat.count
    }))
  }

  const COLORS = ['#040458', '#faa51a', '#10b981', '#3b82f6', '#8b5cf6']

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/individual-dashboard')}
                className="text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-[#040458] to-[#1e1e6b] rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#040458]">Work Reports</h1>
                  <p className="text-sm text-gray-600">View your work analytics</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <IndividualBusinessSwitcher onBusinessSelect={handleBusinessSelect} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generate Report */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Generate Work Report</span>
            </CardTitle>
            <CardDescription>
              Create a new work report for {selectedBusiness?.business_name || 'selected business'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={generateReport}
                disabled={generatingReport || !selectedBusiness}
                className="bg-[#040458] hover:bg-[#030345] text-white"
              >
                {generatingReport ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        {reports.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Hours Worked Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Hours Worked</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#040458" 
                      strokeWidth={2}
                      dot={{ fill: '#faa51a', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tasks Completed Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Tasks Completed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#faa51a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Work Categories */}
        {reports.length > 0 && prepareProductivityData().length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Work Categories</span>
              </CardTitle>
              <CardDescription>
                Distribution of work by category (Latest Report)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareProductivityData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareProductivityData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Work Reports ({reports.length})</span>
            </CardTitle>
            <CardDescription>
              Your generated work reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No work reports yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generate your first work report to see analytics
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                          </h4>
                          <Badge className={getReportTypeColor(report.report_type)}>
                            {report.report_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(report.report_period_start)} - {formatDate(report.report_period_end)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Generated on {formatDate(report.generated_at)}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#040458]">
                          {formatDuration(report.total_hours_worked)}
                        </div>
                        <div className="text-sm text-gray-600">Hours Worked</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#040458]">
                          {report.total_tasks_completed}
                        </div>
                        <div className="text-sm text-gray-600">Tasks Completed</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(report.total_earnings)}
                        </div>
                        <div className="text-sm text-gray-600">Total Earnings</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {report.productivity_score.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Productivity Score</div>
                      </div>
                    </div>
                    
                    {report.summary && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Summary</h5>
                        <p className="text-sm text-gray-700">{report.summary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default WorkReports
