import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, CheckCircle, XCircle, Clock, Mail, User, Phone, Building } from 'lucide-react'
import { toast } from 'sonner'
import { adminService } from '@/services/adminService'

interface UserVerification {
  id: string
  email: string
  business_name?: string
  phone?: string
  tier: string
  email_verified: boolean
  verification_timestamp?: string
  verified_by?: string
  created_at: string
  verification_status: string
}

interface EmailVerificationManagerProps {
  isOpen: boolean
  onClose: () => void
}

export const EmailVerificationManager: React.FC<EmailVerificationManagerProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<UserVerification[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserVerification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all')

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, filterStatus])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUserVerificationStatus()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by status
    if (filterStatus === 'verified') {
      filtered = filtered.filter(user => user.email_verified)
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(user => !user.email_verified)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.business_name?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        user.verification_status.toLowerCase().includes(term)
      )
    }

    setFilteredUsers(filtered)
  }

  const handleVerifyEmail = async (userId: string) => {
    try {
      setVerifying(userId)
      const result = await adminService.verifyUserEmail(userId)
      
      if (result.success) {
        toast.success('Email verified successfully')
        loadUsers() // Reload to get updated data
      } else {
        toast.error(result.error || 'Failed to verify email')
      }
    } catch (error) {
      console.error('Error verifying email:', error)
      toast.error('Failed to verify email')
    } finally {
      setVerifying(null)
    }
  }

  const handleUnverifyEmail = async (userId: string) => {
    try {
      setVerifying(userId)
      const result = await adminService.unverifyUserEmail(userId)
      
      if (result.success) {
        toast.success('Email verification removed')
        loadUsers() // Reload to get updated data
      } else {
        toast.error(result.error || 'Failed to remove verification')
      }
    } catch (error) {
      console.error('Error removing verification:', error)
      toast.error('Failed to remove verification')
    } finally {
      setVerifying(null)
    }
  }

  const getStatusBadge = (verified: boolean, status: string) => {
    if (verified) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    const tierColors = {
      basic: 'bg-green-100 text-green-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      free_trial: 'bg-gray-100 text-gray-800',
      start_smart: 'bg-green-100 text-green-800',
      grow_intelligence: 'bg-blue-100 text-blue-800',
      enterprise_advantage: 'bg-purple-100 text-purple-800'
    }
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || 'bg-gray-100 text-gray-800'}>
        {tier.charAt(0).toUpperCase() + tier.slice(1).replace('_', ' ')}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-[#040458]">Email Verification Management</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-6">
          {/* Search and Filter Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by email, business name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All Users
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'verified' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('verified')}
                >
                  Verified
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Verification Status</TableHead>
                  <TableHead>Verified Date</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#040458]"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{user.email}</span>
                          </div>
                          {user.business_name && (
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{user.business_name}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTierBadge(user.tier)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.email_verified, user.verification_status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {user.verification_timestamp ? formatDate(user.verification_timestamp) : 'Not verified'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {!user.email_verified ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleVerifyEmail(user.id)}
                              disabled={verifying === user.id}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {verifying === user.id ? 'Verifying...' : 'Verify'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUnverifyEmail(user.id)}
                              disabled={verifying === user.id}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              {verifying === user.id ? 'Processing...' : 'Unverify'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationManager
