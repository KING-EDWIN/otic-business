import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Crown, User, Phone, Building, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { adminService } from '@/services/adminService'

interface TierUpgradeRequest {
  id: string
  user_id: string
  tier: string
  amount: number
  payment_method: string
  payment_proof_url?: string
  status: 'pending' | 'verified' | 'rejected'
  created_at: string
  verified_at?: string
  verified_by?: string
  notes?: string
  user_profile: {
    email: string
    business_name?: string
    phone?: string
    tier: string
  }
}

interface TierUpgradeRequestsProps {
  isOpen: boolean
  onClose: () => void
}

export const TierUpgradeRequests: React.FC<TierUpgradeRequestsProps> = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState<TierUpgradeRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<TierUpgradeRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingTier, setUpdatingTier] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadUpgradeRequests()
    }
  }, [isOpen])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm])

  const loadUpgradeRequests = async () => {
    try {
      setLoading(true)
      const data = await adminService.getTierUpgradeRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error loading upgrade requests:', error)
      toast.error('Failed to load upgrade requests')
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    if (!searchTerm.trim()) {
      setFilteredRequests(requests)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = requests.filter(request => 
      request.user_profile.email.toLowerCase().includes(term) ||
      request.user_profile.phone?.toLowerCase().includes(term) ||
      request.user_profile.business_name?.toLowerCase().includes(term) ||
      request.tier.toLowerCase().includes(term)
    )
    setFilteredRequests(filtered)
  }

  const handleTierUpdate = async (requestId: string, newTier: string) => {
    try {
      setUpdatingTier(requestId)
      const result = await adminService.updateUserTier(requestId, newTier)
      
      if (result.success) {
        toast.success('Tier updated successfully')
        loadUpgradeRequests() // Reload to get updated data
      } else {
        toast.error(result.error || 'Failed to update tier')
      }
    } catch (error) {
      console.error('Error updating tier:', error)
      toast.error('Failed to update tier')
    } finally {
      setUpdatingTier(null)
    }
  }

  const handleVerifyPayment = async (requestId: string, status: 'verified' | 'rejected') => {
    try {
      const result = await adminService.verifyPaymentRequest(requestId, status)
      
      if (result.success) {
        toast.success(`Payment ${status} successfully`)
        loadUpgradeRequests()
      } else {
        toast.error(result.error || `Failed to ${status} payment`)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error(`Failed to ${status} payment`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    const tierColors = {
      basic: 'bg-green-100 text-green-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800'
    }
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || 'bg-gray-100 text-gray-800'}>
        <Crown className="h-3 w-3 mr-1" />
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
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
          <h2 className="text-2xl font-bold text-[#040458]">Tier Upgrade Management</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email, phone, business name, or tier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredRequests.length} of {requests.length} upgrade requests
            </p>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Details</TableHead>
                  <TableHead>Current Tier</TableHead>
                  <TableHead>Requested Tier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#040458]"></div>
                        <span className="ml-2">Loading upgrade requests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No upgrade requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{request.user_profile.email}</span>
                          </div>
                          {request.user_profile.business_name && (
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{request.user_profile.business_name}</span>
                            </div>
                          )}
                          {request.user_profile.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{request.user_profile.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTierBadge(request.user_profile.tier)}
                      </TableCell>
                      <TableCell>
                        {getTierBadge(request.tier)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(request.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.payment_method.replace('_', ' ').toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(request.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleVerifyPayment(request.id, 'verified')}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVerifyPayment(request.id, 'rejected')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Select
                            value=""
                            onValueChange={(value) => handleTierUpdate(request.id, value)}
                            disabled={updatingTier === request.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Upgrade to..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
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

export default TierUpgradeRequests
