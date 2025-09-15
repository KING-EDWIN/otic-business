import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Crown,
  Shield,
  User,
  Eye,
  MoreHorizontal,
  Trash2,
  UserPlus,
  ArrowLeft,
  Home
} from 'lucide-react'
import { toast } from 'sonner'
import { useSystemError } from '@/hooks/useSystemError'
import SystemErrorPopup from '@/components/SystemErrorPopup'

const BusinessMembers: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { 
    currentBusiness, 
    businessMembers, 
    loading, 
    inviteUser, 
    removeUser, 
    updateUserRole, 
    refreshMembers 
  } = useBusinessManagement()
  
  const { error, isErrorPopupOpen, hideError, handleDataFetchError } = useSystemError()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee' | 'viewer'
  })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Members are loaded by the BusinessManagementContext
  // No need for useEffect here as it causes unnecessary refreshes

  const filteredMembers = businessMembers.filter(member =>
    member && (
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />
      case 'manager': return <User className="h-4 w-4 text-green-600" />
      case 'employee': return <User className="h-4 w-4 text-gray-600" />
      case 'viewer': return <Eye className="h-4 w-4 text-gray-400" />
      default: return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'manager': return 'bg-green-100 text-green-800'
      case 'employee': return 'bg-gray-100 text-gray-800'
      case 'viewer': return 'bg-gray-100 text-gray-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleInviteUser = async () => {
    if (!inviteData.email.trim()) {
      toast.error('Email is required')
      return
    }

    try {
      setInviteLoading(true)
      const result = await inviteUser(inviteData.email, inviteData.role)
      
      if (result.success) {
        toast.success('Invitation sent successfully')
        setInviteData({ email: '', role: 'employee' })
        setShowInviteDialog(false)
        await refreshMembers()
      } else {
        toast.error(result.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error inviting user:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to remove ${userEmail} from this business?`)) {
      return
    }

    try {
      setActionLoading(userId)
      const result = await removeUser(userId)
      
      if (result.success) {
        toast.success('User removed successfully')
        await refreshMembers()
      } else {
        toast.error(result.error || 'Failed to remove user')
      }
    } catch (error) {
      console.error('Error removing user:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId)
      const result = await updateUserRole(userId, newRole)
      
      if (result.success) {
        toast.success('User role updated successfully')
        await refreshMembers()
      } else {
        toast.error(result.error || 'Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Business Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The business you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/business-management')}>
              Back to Businesses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/business-management')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentBusiness.name} - Members
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage team members and their roles
                </p>
              </div>
            </div>
            
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Invite Member</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this business
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="member@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      <strong>Note:</strong> All invited users will be employees with access to POS, Inventory, Accounting, and Customers pages.
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(false)}
                    disabled={inviteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteUser}
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Stats */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{businessMembers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Owners</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {businessMembers.filter(m => m.role === 'owner').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {businessMembers.filter(m => m.role === 'admin').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {businessMembers.filter(m => ['manager', 'employee', 'viewer'].includes(m.role)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage roles and permissions for team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No members found' : 'No members yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Invite team members to get started'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite First Member
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={`${member.id}-${member.user_id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.full_name || member.business_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">{member.email || 'No email'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(member.role)}
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {member.role !== 'owner' && (
                            <>
                              <Select
                                value={member.role}
                                onValueChange={(value) => handleUpdateRole(member.user_id, value)}
                                disabled={actionLoading === member.user_id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="employee">Employee</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveUser(member.user_id, member.email || 'Unknown')}
                                disabled={actionLoading === member.user_id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* System Error Popup */}
      {error && (
        <SystemErrorPopup
          isOpen={isErrorPopupOpen}
          onClose={hideError}
          error={error}
        />
      )}
    </div>
  )
}

export default BusinessMembers

