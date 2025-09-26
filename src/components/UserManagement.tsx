import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  User, 
  Building2,
  Calendar,
  Mail,
  Phone,
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface ActiveUser {
  id: string
  email: string
  full_name: string
  business_name: string
  user_type: 'business' | 'individual'
  tier: string
  phone: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

const UserManagement: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null)
  const [deleteReason, setDeleteReason] = useState('')

  const limit = 20

  useEffect(() => {
    loadActiveUsers()
  }, [currentPage])

  const loadActiveUsers = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * limit

      console.log('🔍 Fetching active users from user_profiles table...')
      
      // Add timeout to prevent infinite loading
      const queryPromise = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )

      const { data, error, count } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.error('Error fetching active users:', error)
        toast.error('Failed to load users')
        return
      }

      console.log('📊 Active users data:', { data, count, error })
      console.log('📊 Number of users found:', data?.length || 0)

      setActiveUsers(data || [])
      setTotalUsers(count || 0)
    } catch (error: any) {
      console.error('Error loading active users:', error)
      if (error.message === 'Query timeout') {
        toast.error('Request timed out. Please try again.')
      } else {
        toast.error('Failed to load users')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser || !deleteReason.trim()) {
      toast.error('Please provide a reason for deletion')
      return
    }

    try {
      // Call the soft delete function
      const { data, error } = await supabase.rpc('soft_delete_user_account', {
        user_id_param: selectedUser.id,
        deletion_reason_param: deleteReason.trim()
      })

      if (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
        return
      }

      toast.success(`User ${selectedUser.email} has been deleted`)
      setShowDeleteDialog(false)
      setSelectedUser(null)
      setDeleteReason('')
      loadActiveUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const filteredUsers = activeUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free_trial':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Free Trial</Badge>
      case 'start_smart':
        return <Badge variant="outline" className="text-green-600 border-green-600">Start Smart</Badge>
      case 'grow_intelligence':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Grow Intelligence</Badge>
      case 'enterprise_advantage':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Enterprise</Badge>
      default:
        return <Badge variant="outline">{tier}</Badge>
    }
  }

  const getStatusBadge = (emailVerified: boolean) => {
    return emailVerified ? 
      <Badge className="bg-green-100 text-green-800">Verified</Badge> :
      <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-[#040458]">Active Users</h3>
          <Badge variant="outline" className="text-[#040458] border-[#040458]">
            {totalUsers} Total Users
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadActiveUsers}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by email, name, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Business Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeUsers.filter(u => u.user_type === 'business').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Individual Users</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activeUsers.filter(u => u.user_type === 'individual').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Verified</p>
                <p className="text-2xl font-bold text-orange-600">
                  {activeUsers.filter(u => u.email_verified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#040458]" />
              <p className="text-sm text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-600 mt-2">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.user_type === 'business' ? 'Business' : 'Individual'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.business_name || 'N/A'}</TableCell>
                      <TableCell>{getTierBadge(user.tier)}</TableCell>
                      <TableCell>{getStatusBadge(user.email_verified)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <span>Delete User Account</span>
                              </DialogTitle>
                              <DialogDescription>
                                This will permanently delete the user account and all associated data. 
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900">User Details:</h4>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                  <p><strong>Email:</strong> {selectedUser?.email}</p>
                                  <p><strong>Name:</strong> {selectedUser?.full_name || 'N/A'}</p>
                                  <p><strong>Type:</strong> {selectedUser?.user_type}</p>
                                  <p><strong>Business:</strong> {selectedUser?.business_name || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="delete-reason">Reason for Deletion *</Label>
                                <Textarea
                                  id="delete-reason"
                                  placeholder="Enter reason for deleting this user account..."
                                  value={deleteReason}
                                  onChange={(e) => setDeleteReason(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowDeleteDialog(false)
                                    setSelectedUser(null)
                                    setDeleteReason('')
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDeleteUser}
                                  disabled={!deleteReason.trim()}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Account
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalUsers > limit && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(totalUsers / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(totalUsers / limit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
