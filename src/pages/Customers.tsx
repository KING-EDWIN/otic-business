import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Star,
  MessageSquare,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { CardSkeleton, TableSkeleton, ChartSkeleton } from '@/components/LoadingSkeleton'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  created_at: string
  last_purchase?: string
  total_orders: number
  total_spent: number
  status: 'active' | 'inactive' | 'vip'
  notes?: string
  tags?: string[]
}

const Customers = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: [] as string[]
  })

  // Customer statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    vip: 0,
    newThisMonth: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  })
  
  // Loading states for different sections
  const [statsLoading, setStatsLoading] = useState(true)
  const [customersLoading, setCustomersLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchCustomers()
      loadAnalyticsData()
    }
  }, [user?.id])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, statusFilter])

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true)
      setStatsLoading(true)
      
      // Fetch customers from Supabase
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (customersError) throw customersError

      // Fetch sales data to calculate customer metrics
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user?.id)

      if (salesError) throw salesError

      // Calculate customer metrics
      const customerMetrics = new Map<string, { orders: number; spent: number; lastPurchase: string }>()
      
      salesData?.forEach(sale => {
        const customerId = sale.customer_id || 'walk-in'
        const existing = customerMetrics.get(customerId) || { orders: 0, spent: 0, lastPurchase: '' }
        existing.orders += 1
        existing.spent += sale.total || 0
        if (sale.created_at > existing.lastPurchase) {
          existing.lastPurchase = sale.created_at
        }
        customerMetrics.set(customerId, existing)
      })

      // Enhance customers with metrics
      const enhancedCustomers = customersData?.map(customer => {
        const metrics = customerMetrics.get(customer.id) || { orders: 0, spent: 0, lastPurchase: '' }
        return {
          ...customer,
          total_orders: metrics.orders,
          total_spent: metrics.spent,
          last_purchase: metrics.lastPurchase,
          status: metrics.spent > 1000000 ? 'vip' : metrics.orders > 0 ? 'active' : 'inactive'
        }
      }) || []

      setCustomers(enhancedCustomers)

      // Calculate statistics
      const total = enhancedCustomers.length
      const active = enhancedCustomers.filter(c => c.status === 'active').length
      const vip = enhancedCustomers.filter(c => c.status === 'vip').length
      const newThisMonth = enhancedCustomers.filter(c => 
        new Date(c.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length
      const totalRevenue = enhancedCustomers.reduce((sum, c) => sum + c.total_spent, 0)
      const averageOrderValue = total > 0 ? totalRevenue / enhancedCustomers.reduce((sum, c) => sum + c.total_orders, 0) : 0

      setStats({
        total,
        active,
        vip,
        newThisMonth,
        totalRevenue,
        averageOrderValue
      })

    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setCustomersLoading(false)
      setStatsLoading(false)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true)
      // Simulate loading analytics data
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter)
    }

    setFilteredCustomers(filtered)
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error('Customer name is required')
      return
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          user_id: user?.id,
          name: newCustomer.name,
          email: newCustomer.email || null,
          phone: newCustomer.phone || null,
          address: newCustomer.address || null,
          notes: newCustomer.notes || null,
          tags: newCustomer.tags
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Customer added successfully')
      setShowAddDialog(false)
      setNewCustomer({ name: '', email: '', phone: '', address: '', notes: '', tags: [] })
      fetchCustomers()
    } catch (error) {
      console.error('Error adding customer:', error)
      toast.error('Failed to add customer')
    }
  }

  const handleEditCustomer = async () => {
    if (!selectedCustomer || !newCustomer.name.trim()) {
      toast.error('Customer name is required')
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: newCustomer.name,
          email: newCustomer.email || null,
          phone: newCustomer.phone || null,
          address: newCustomer.address || null,
          notes: newCustomer.notes || null,
          tags: newCustomer.tags
        })
        .eq('id', selectedCustomer.id)

      if (error) throw error

      toast.success('Customer updated successfully')
      setShowEditDialog(false)
      setSelectedCustomer(null)
      setNewCustomer({ name: '', email: '', phone: '', address: '', notes: '', tags: [] })
      fetchCustomers()
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer')
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) throw error

      toast.success('Customer deleted successfully')
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setNewCustomer({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || '',
      tags: customer.tags || []
    })
    setShowEditDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vip':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"><Star className="h-3 w-3 mr-1" />VIP</Badge>
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Chart data for customer analytics
  const customerGrowthData = [
    { month: 'Jan', customers: 12, revenue: 2400000 },
    { month: 'Feb', customers: 18, revenue: 3600000 },
    { month: 'Mar', customers: 25, revenue: 5000000 },
    { month: 'Apr', customers: 32, revenue: 6400000 },
    { month: 'May', customers: 28, revenue: 5600000 },
    { month: 'Jun', customers: 35, revenue: 7000000 }
  ]

  const topCustomersData = filteredCustomers
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 5)
    .map(customer => ({
      name: customer.name,
      spent: customer.total_spent,
      orders: customer.total_orders
    }))

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
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#040458] to-[#1e40af] bg-clip-text text-transparent">
                    Customer Management
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Manage your customer relationships and track their value
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-[#040458] to-[#1e40af] hover:from-[#030345] hover:to-[#0f1a5c] text-white shadow-lg"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          {statsLoading ? (
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
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Total Customers</p>
                      <p className="text-3xl font-bold text-[#040458]">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Active Customers</p>
                      <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">VIP Customers</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.vip}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg shadow-md">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">New This Month</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.newThisMonth}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Total Revenue</p>
                      <p className="text-2xl font-bold text-[#040458]">UGX {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-md">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Avg Order Value</p>
                      <p className="text-2xl font-bold text-[#040458]">UGX {Math.round(stats.averageOrderValue).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            <TabsList className="bg-transparent border-0">
              <TabsTrigger 
                value="customers"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Customer List
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="customers" className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/50 border-white/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-white/50 border-white/30">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={fetchCustomers}
                      variant="outline"
                      className="bg-white/50 border-white/30"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer List */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#040458]">Customer Directory</CardTitle>
                <CardDescription>Manage your customer relationships and track their value</CardDescription>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <TableSkeleton rows={5} />
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
                    <p className="text-gray-600 mb-6">Start building your customer base by adding your first customer.</p>
                    <Button
                      onClick={() => setShowAddDialog(true)}
                      className="bg-gradient-to-r from-[#040458] to-[#1e40af] hover:from-[#030345] hover:to-[#0f1a5c] text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Customer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#040458] to-[#1e40af] rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-[#040458]">{customer.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {customer.email && (
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{customer.email}</span>
                                  </div>
                                )}
                                {customer.phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{customer.phone}</span>
                                  </div>
                                )}
                                {customer.address && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{customer.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                {getStatusBadge(customer.status)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {customer.total_orders} orders • UGX {customer.total_spent.toLocaleString()}
                              </p>
                              {customer.last_purchase && (
                                <p className="text-xs text-gray-500">
                                  Last purchase: {new Date(customer.last_purchase).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(customer)}
                                className="text-[#040458] border-[#040458] hover:bg-[#040458] hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
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
              {analyticsLoading ? (
                <>
                  <ChartSkeleton />
                  <ChartSkeleton />
                </>
              ) : (
                <>
                  {/* Customer Growth Chart */}
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Customer Growth</span>
                      </CardTitle>
                      <CardDescription className="text-blue-100">Monthly customer acquisition and revenue</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={customerGrowthData}>
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
                            dataKey="customers" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Customers Chart */}
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5" />
                        <span>Top Customers</span>
                      </CardTitle>
                      <CardDescription className="text-green-100">Highest spending customers</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCustomersData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Spent']}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Bar 
                            dataKey="spent" 
                            fill="url(#greenGradient)"
                            radius={[4, 4, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30">
          <DialogHeader>
            <DialogTitle className="text-[#040458]">Add New Customer</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter customer information to add them to your database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#040458]">Name *</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/50 border-white/30 text-[#040458]"
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#040458]">Phone</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-white/50 border-white/30 text-[#040458]"
                  placeholder="+256 700 000 000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#040458]">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/50 border-white/30 text-[#040458]"
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[#040458]">Address</Label>
              <Input
                id="address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                className="bg-white/50 border-white/30 text-[#040458]"
                placeholder="Customer address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[#040458]">Notes</Label>
              <Textarea
                id="notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-white/50 border-white/30 text-[#040458]"
                placeholder="Additional notes about the customer"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="hover:bg-gray-100">
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white">
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30">
          <DialogHeader>
            <DialogTitle className="text-[#040458]">Edit Customer</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update customer information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-[#040458]">Name *</Label>
                <Input
                  id="edit-name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/50 border-white/30 text-[#040458]"
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-[#040458]">Phone</Label>
                <Input
                  id="edit-phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-white/50 border-white/30 text-[#040458]"
                  placeholder="+256 700 000 000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-[#040458]">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/50 border-white/30 text-[#040458]"
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-[#040458]">Address</Label>
              <Input
                id="edit-address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                className="bg-white/50 border-white/30 text-[#040458]"
                placeholder="Customer address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes" className="text-[#040458]">Notes</Label>
              <Textarea
                id="edit-notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-white/50 border-white/30 text-[#040458]"
                placeholder="Additional notes about the customer"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="hover:bg-gray-100">
              Cancel
            </Button>
            <Button onClick={handleEditCustomer} className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white">
              Update Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Customers

