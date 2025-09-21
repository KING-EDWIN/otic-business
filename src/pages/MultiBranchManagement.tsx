import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ArrowLeft,
  Building2,
  Plus,
  MapPin,
  Users,
  Package,
  TrendingUp,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Truck,
  DollarSign,
  ShoppingCart,
  User,
  Brain
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'

interface Branch {
  id: string
  branch_name: string
  branch_code: string
  address: string
  city: string
  status: string
  manager_name: string
  manager_phone: string
  manager_email: string
  staff_count: number
  total_sales: number
  created_at: string
}

interface BranchStaff {
  id: string
  user_id: string
  role: string
  employment_date: string
  status: string
  salary: number
  commission_rate: number
}

interface BranchInventory {
  id: string
  product_id: string
  product_name: string
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  cost_price: number
  selling_price: number
  status: string
}

interface BranchTransfer {
  id: string
  from_branch_name: string
  to_branch_name: string
  product_name: string
  quantity: number
  transfer_reason: string
  status: string
  transfer_date: string
}

const MultiBranchManagement = () => {
  const { user, profile } = useAuth()
  const { currentBusiness } = useBusinessManagement()
  const navigate = useNavigate()
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchStaff, setBranchStaff] = useState<BranchStaff[]>([])
  const [branchInventory, setBranchInventory] = useState<BranchInventory[]>([])
  const [branchTransfers, setBranchTransfers] = useState<BranchTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // New branch form state
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false)
  const [newBranch, setNewBranch] = useState({
    branch_name: '',
    branch_code: '',
    address: '',
    city: '',
    manager_name: '',
    manager_phone: '',
    manager_email: ''
  })

  // Check if user has access to multi-branch feature
  const hasMultiBranchAccess = () => {
    if (!profile?.features_enabled) return false
    return profile.features_enabled.multi_branch === true
  }

  useEffect(() => {
    if (!hasMultiBranchAccess()) {
      toast.error('Multi-Branch Management is only available for Grow Intelligence and Enterprise Advantage tiers')
      navigate('/my-extras')
      return
    }
    
    if (currentBusiness) {
      loadBranches()
    }
  }, [currentBusiness, profile])

  const loadBranches = async () => {
    if (!currentBusiness) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_business_branches', {
        business_id_param: currentBusiness.id
      })
      
      if (error) {
        console.error('Error loading branches:', error)
        toast.error('Failed to load branches')
        return
      }
      
      setBranches(data || [])
    } catch (error) {
      console.error('Error loading branches:', error)
      toast.error('Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  const createBranch = async () => {
    if (!currentBusiness) return
    
    try {
      const { data, error } = await supabase.rpc('create_branch', {
        business_id_param: currentBusiness.id,
        branch_name_param: newBranch.branch_name,
        branch_code_param: newBranch.branch_code,
        address_param: newBranch.address,
        city_param: newBranch.city,
        manager_name_param: newBranch.manager_name,
        manager_phone_param: newBranch.manager_phone,
        manager_email_param: newBranch.manager_email
      })
      
      if (error) {
        console.error('Error creating branch:', error)
        toast.error('Failed to create branch')
        return
      }
      
      toast.success('Branch created successfully!')
      setIsCreateBranchOpen(false)
      setNewBranch({
        branch_name: '',
        branch_code: '',
        address: '',
        city: '',
        manager_name: '',
        manager_phone: '',
        manager_email: ''
      })
      loadBranches()
    } catch (error) {
      console.error('Error creating branch:', error)
      toast.error('Failed to create branch')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!hasMultiBranchAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature Not Available</h2>
              <p className="text-gray-600 mb-6">
                Multi-Branch Management is only available for Grow Intelligence and Enterprise Advantage tiers.
              </p>
              <Button onClick={() => navigate('/my-extras')} className="bg-[#040458] hover:bg-[#040458]/90">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Extras
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/my-extras')}
              className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Extras
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Multi-Branch Management</h1>
                <p className="text-sm text-gray-600">Manage multiple business locations</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isCreateBranchOpen} onOpenChange={setIsCreateBranchOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
                <DialogDescription>
                  Add a new branch location to your business.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch_name">Branch Name *</Label>
                    <Input
                      id="branch_name"
                      value={newBranch.branch_name}
                      onChange={(e) => setNewBranch({...newBranch, branch_name: e.target.value})}
                      placeholder="e.g., Main Branch"
                    />
                  </div>
                  <div>
                    <Label htmlFor="branch_code">Branch Code *</Label>
                    <Input
                      id="branch_code"
                      value={newBranch.branch_code}
                      onChange={(e) => setNewBranch({...newBranch, branch_code: e.target.value})}
                      placeholder="e.g., MAIN, BR001"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newBranch.city}
                      onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                      placeholder="e.g., Kampala"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager_name">Manager Name</Label>
                    <Input
                      id="manager_name"
                      value={newBranch.manager_name}
                      onChange={(e) => setNewBranch({...newBranch, manager_name: e.target.value})}
                      placeholder="Branch manager name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manager_phone">Manager Phone</Label>
                    <Input
                      id="manager_phone"
                      value={newBranch.manager_phone}
                      onChange={(e) => setNewBranch({...newBranch, manager_phone: e.target.value})}
                      placeholder="+256700000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager_email">Manager Email</Label>
                    <Input
                      id="manager_email"
                      type="email"
                      value={newBranch.manager_email}
                      onChange={(e) => setNewBranch({...newBranch, manager_email: e.target.value})}
                      placeholder="manager@example.com"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateBranchOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createBranch}
                    disabled={!newBranch.branch_name || !newBranch.branch_code}
                    className="bg-[#040458] hover:bg-[#040458]/90"
                  >
                    Create Branch
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Branches</p>
                      <p className="text-3xl font-bold text-[#040458]">{branches.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Branches</p>
                      <p className="text-3xl font-bold text-green-600">
                        {branches.filter(b => b.status === 'active').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Staff</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {branches.reduce((sum, b) => sum + b.staff_count, 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-3xl font-bold text-[#faa51a]">
                        UGX {branches.reduce((sum, b) => sum + b.total_sales, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-[#040458]" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {branches.slice(0, 3).map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#040458] rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{branch.branch_name}</p>
                          <p className="text-sm text-gray-600">{branch.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(branch.status)}>
                          {branch.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {branch.staff_count} staff
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle>All Branches</CardTitle>
                <CardDescription>Manage your business locations</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040458]"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Branch</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Sales (30d)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{branch.branch_name}</p>
                              <p className="text-sm text-gray-600">{branch.branch_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{branch.city}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{branch.manager_name || 'Not assigned'}</p>
                              {branch.manager_phone && (
                                <p className="text-sm text-gray-600">{branch.manager_phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{branch.staff_count}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span>UGX {branch.total_sales.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(branch.status)}>
                              {branch.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/branch/${branch.id}/ai-insights`)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Brain className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/branch/${branch.id}/analytics`)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/branch/${branch.id}/accounting`)}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/branch/${branch.id}/inventory`)}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/branch/${branch.id}/sales`)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/branch/${branch.id}/staff`)}
                                className="text-indigo-600 hover:text-indigo-700"
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle>Branch Inventory</CardTitle>
                <CardDescription>Manage inventory across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    Inventory management across branches will be available in the next update.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle>Branch Transfers</CardTitle>
                <CardDescription>Track inventory transfers between branches</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <ArrowRightLeft className="h-4 w-4" />
                  <AlertDescription>
                    Transfer management between branches will be available in the next update.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default MultiBranchManagement

