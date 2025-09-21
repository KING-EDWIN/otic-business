import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContextOptimized'
import { branchDataService, type BranchStaff } from '@/services/branchDataService'
import { useDateRange } from '@/hooks/useDateRange'
import DateRangePicker from '@/components/DateRangePicker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  UserPlus,
  UserCheck,
  UserX,
  Award,
  Target
} from 'lucide-react'
import { toast } from 'sonner'

interface BranchData {
  id: string
  branch_name: string
  branch_code: string
  address: string
  city: string
  is_active: boolean
}

interface StaffMember {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  role: 'manager' | 'supervisor' | 'cashier' | 'stock_keeper' | 'sales_assistant' | 'security' | 'cleaner'
  status: 'active' | 'inactive' | 'on_leave'
  hire_date: string
  salary: number
  performance_score: number
  sales_count: number
  total_sales: number
  efficiency: number
  rating: number
  commission_earned: number
  permissions: string[]
  last_login: string
}

interface StaffSummary {
  total_staff: number
  active_staff: number
  on_leave: number
  average_performance: number
  top_performers: Array<{name: string, score: number, sales: number}>
  role_distribution: Array<{role: string, count: number}>
}

const BranchStaff: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [branch, setBranch] = useState<BranchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  
  // Date range management
  const { dateRange, updateDateRange, minDate, maxDate, dateRangeString, loading: dateLoading } = useDateRange()
  
  // Real-time data from backend
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [summary, setSummary] = useState<StaffSummary | null>(null)

  useEffect(() => {
    if (branchId) {
      loadBranchData()
      loadStaffData()
      loadStaffSummary()
    }
  }, [branchId, dateRange])

  const loadBranchData = async () => {
    try {
      const { data, error } = await supabase
        .from('branch_locations')
        .select('*')
        .eq('id', branchId)
        .single()

      if (error) throw error
      setBranch(data)
    } catch (error) {
      console.error('Error loading branch:', error)
      toast.error('Failed to load branch data')
    }
  }

  const loadStaffData = async () => {
    try {
      setLoading(true)
      
      // Load live staff data from database
      if (!branchId) {
        console.error('No branch ID available')
        setStaff([])
        setLoading(false)
        return
      }

      // Load live staff data
      const liveStaff = await branchDataService.getBranchStaff(branchId)
      const staffPerformance = await branchDataService.getStaffPerformance(branchId, dateRange.from.toISOString().split('T')[0], dateRange.to.toISOString().split('T')[0])
      
      // Map live staff to expected format
      const mappedStaff: StaffMember[] = liveStaff.map(staffMember => {
        const performance = staffPerformance.find(perf => perf.staff_id === staffMember.user_id)
        
        return {
          id: staffMember.id,
          user_id: staffMember.user_id,
          name: 'Unknown Staff', // Would need to join with user_profiles table
          email: 'N/A',
          phone: 'N/A',
          role: staffMember.role,
          status: staffMember.is_active ? 'active' : 'inactive',
          hire_date: staffMember.hire_date,
          salary: staffMember.salary,
          performance_score: staffMember.performance_score,
          sales_count: performance?.total_transactions || 0,
          total_sales: performance?.total_sales || 0,
          efficiency: performance?.efficiency_score || 0,
          rating: Math.min(5, Math.max(1, (performance?.efficiency_score || 0) / 20)),
          commission_earned: performance?.commission_earned || 0,
          permissions: Object.keys(staffMember.permissions || {}),
          last_login: 'N/A' // This would need to be tracked separately
        }
      })

      setStaff(mappedStaff)
    } catch (error) {
      console.error('Error loading staff data:', error)
      toast.error('Failed to load staff data')
    } finally {
      setLoading(false)
    }
  }

  const loadStaffSummary = async () => {
    try {

      // Load live staff summary
      const liveStaff = await branchDataService.getBranchStaff(branchId)
      const staffPerformance = await branchDataService.getStaffPerformance(branchId, dateRange.from.toISOString().split('T')[0], dateRange.to.toISOString().split('T')[0])
      
      // Calculate summary from live data
      const totalStaff = liveStaff.length
      const activeStaff = liveStaff.filter(s => s.is_active).length
      const onLeave = totalStaff - activeStaff
      const averagePerformance = liveStaff?.length > 0 
        ? liveStaff.reduce((sum, s) => sum + (s.performance_score || 0), 0) / liveStaff.length 
        : 0
      
      // Get top performers
      const topPerformers = staffPerformance
        .sort((a, b) => b.efficiency_score - a.efficiency_score)
        .slice(0, 4)
        .map(perf => ({
          name: perf.staff_name,
          score: perf.efficiency_score,
          sales: perf.total_sales
        }))
      
      // Calculate role distribution
      const roleCounts = liveStaff?.reduce((acc, staff) => {
        acc[staff.role] = (acc[staff.role] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
      
      const roleDistribution = Object.entries(roleCounts).map(([role, count]) => ({
        role: role.charAt(0).toUpperCase() + role.slice(1),
        count
      }))
      
      const liveSummary: StaffSummary = {
        total_staff: totalStaff,
        active_staff: activeStaff,
        on_leave: onLeave,
        average_performance: averagePerformance,
        top_performers: topPerformers,
        role_distribution: roleDistribution
      }

      setSummary(liveSummary)
    } catch (error) {
      console.error('Error loading staff summary:', error)
      toast.error('Failed to load staff summary')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800'
      case 'supervisor': return 'bg-blue-100 text-blue-800'
      case 'cashier': return 'bg-green-100 text-green-800'
      case 'stock_keeper': return 'bg-orange-100 text-orange-800'
      case 'sales_assistant': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'on_leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="h-4 w-4 text-green-500" />
      case 'inactive': return <UserX className="h-4 w-4 text-red-500" />
      case 'on_leave': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm)
    
    const matchesRole = filterRole === 'all' || member.role === filterRole
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/multi-branch-management')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Branches</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Staff - {branch?.branch_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {branch?.branch_code} • {branch?.city}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button size="sm" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Add Staff</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_staff}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.active_staff} active, {summary.on_leave} on leave
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.active_staff}</div>
                <p className="text-xs text-muted-foreground">
                  Currently working
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.average_performance}%</div>
                <p className="text-xs text-muted-foreground">
                  Team performance score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{summary.on_leave}</div>
                <p className="text-xs text-muted-foreground">
                  Staff members
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="staff" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <DateRangePicker
                    onDateRangeChange={updateDateRange}
                    initialRange={dateRange}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholder="Select date range"
                    className="w-64"
                  />
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="stock_keeper">Stock Keeper</SelectItem>
                      <SelectItem value="sales_assistant">Sales Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>Manage your branch staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStaff.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedStaff(member)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleColor(member.role)}>
                              {member.role.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(member.rating) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill={i < Math.floor(member.rating) ? 'currentColor' : 'none'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">UGX {member.salary.toLocaleString()}</p>
                        <p className={`text-sm font-semibold ${getPerformanceColor(member.performance_score)}`}>
                          {member.performance_score}% performance
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.sales_count} sales • UGX {member.total_sales.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Best performing staff members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary?.top_performers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#040458] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{performer.name}</h4>
                          <p className="text-sm text-gray-500">Performance Score: {performer.score}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">UGX {performer.sales.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Total Sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>Staff distribution by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary?.role_distribution.map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{role.role}</h4>
                          <p className="text-sm text-gray-500">
                            {((role.count / (summary?.total_staff || 1)) * 100).toFixed(1)}% of total staff
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{role.count}</p>
                        <p className="text-sm text-gray-500">staff members</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Performance Report</span>
                  </CardTitle>
                  <CardDescription>Individual and team performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Sales Report</span>
                  </CardTitle>
                  <CardDescription>Sales performance by staff</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Attendance Report</span>
                  </CardTitle>
                  <CardDescription>Staff attendance and hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Staff Details
                </h3>
                <Button
                  onClick={() => setSelectedStaff(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <div className="text-lg font-semibold">{selectedStaff.name}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Role:</span>
                    <Badge className={getRoleColor(selectedStaff.role)}>
                      {selectedStaff.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <div className="text-lg font-semibold">{selectedStaff.email}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <div className="text-lg font-semibold">{selectedStaff.phone}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <Badge className={getStatusColor(selectedStaff.status)}>
                      {selectedStaff.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Hire Date:</span>
                    <div className="text-lg font-semibold">{selectedStaff.hire_date}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Salary:</span>
                    <div className="text-lg font-semibold">UGX {selectedStaff.salary.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Performance Score:</span>
                    <div className={`text-lg font-semibold ${getPerformanceColor(selectedStaff.performance_score)}`}>
                      {selectedStaff.performance_score}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Sales Count:</span>
                    <div className="text-lg font-semibold">{selectedStaff.sales_count}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Sales:</span>
                    <div className="text-lg font-semibold">UGX {selectedStaff.total_sales.toLocaleString()}</div>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Permissions:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedStaff.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-6">
                  <Button className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Staff
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Award className="h-4 w-4 mr-2" />
                    View Performance
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchStaff
