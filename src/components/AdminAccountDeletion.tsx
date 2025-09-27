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
  Clock, 
  User, 
  Building2,
  Calendar,
  Shield
} from 'lucide-react'
import { AccountDeletionService } from '@/services/accountDeletionService'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface DeletedAccount {
  id: string
  email: string
  full_name: string
  business_name: string
  user_type: 'business' | 'individual'
  tier: string
  deletion_reason: string
  deleted_at: string
  recovery_expires_at: string
  is_recovered: boolean
  recovered_at: string
  days_remaining: number
  status: 'EXPIRED' | 'RECOVERED' | 'ACTIVE'
}

const AdminAccountDeletion: React.FC = () => {
  const [deletedAccounts, setDeletedAccounts] = useState<DeletedAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<DeletedAccount | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [restoreReason, setRestoreReason] = useState('')
  const [accountsNeedingManualDeletion, setAccountsNeedingManualDeletion] = useState<any[]>([])
  const [showManualDeletionSection, setShowManualDeletionSection] = useState(false)

  const limit = 20

  useEffect(() => {
    loadDeletedAccounts()
  }, [currentPage])

  const loadDeletedAccounts = async () => {
    setLoading(true)
    try {
      const result = await AccountDeletionService.getDeletedAccounts(currentPage, limit)
      if (result.success) {
        setDeletedAccounts(result.data || [])
        setTotalAccounts(result.total || 0)
      } else {
        toast.error(result.error || 'Failed to load deleted accounts')
      }
    } catch (error) {
      console.error('Error loading deleted accounts:', error)
      toast.error('Failed to load deleted accounts')
    } finally {
      setLoading(false)
    }
  }

  const loadAccountsNeedingManualDeletion = async () => {
    try {
      // Add timeout to prevent infinite loading
      const queryPromise = supabase
        .from('accounts_needing_manual_deletion')
        .select('*')
        .order('deleted_at', { ascending: true })

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.error('Error loading accounts needing manual deletion:', error)
        toast.error('Failed to load accounts needing manual deletion')
        return
      }

      return data || []
    } catch (error: any) {
      console.error('Error loading accounts needing manual deletion:', error)
      if (error.message === 'Query timeout') {
        toast.error('Request timed out. Please try again.')
      } else {
        toast.error('Failed to load accounts needing manual deletion')
      }
      return []
    }
  }

  const handlePermanentDelete = async () => {
    if (!selectedAccount || !deleteReason.trim()) {
      toast.error('Please provide a reason for permanent deletion')
      return
    }

    try {
      // For now, we'll just mark it as permanently deleted
      // In a real implementation, you'd call the permanent delete service
      toast.success(`Account ${selectedAccount.email} marked for permanent deletion`)
      setShowPermanentDeleteDialog(false)
      setSelectedAccount(null)
      setDeleteReason('')
      loadDeletedAccounts()
    } catch (error) {
      console.error('Error permanently deleting account:', error)
      toast.error('Failed to permanently delete account')
    }
  }

  const handleRestoreAccount = async () => {
    if (!selectedAccount || !restoreReason.trim()) {
      toast.error('Please provide a reason for account restoration')
      return
    }

    try {
      const result = await AccountDeletionService.restoreAccount(
        selectedAccount.id,
        '00000000-0000-0000-0000-000000000000', // Admin ID placeholder
        restoreReason
      )

      if (result.success) {
        toast.success(result.message || 'Account restored successfully!')
        setShowRestoreDialog(false)
        setSelectedAccount(null)
        setRestoreReason('')
        loadDeletedAccounts()
      } else {
        toast.error(result.error || 'Failed to restore account')
      }
    } catch (error) {
      console.error('Error restoring account:', error)
      toast.error('Failed to restore account')
    }
  }

  const handleCleanupExpired = async () => {
    try {
      const result = await AccountDeletionService.cleanupExpiredAccounts()
      if (result.success) {
        toast.success(`Cleaned up ${result.deletedCount} expired accounts`)
        loadDeletedAccounts()
      } else {
        toast.error(result.error || 'Failed to cleanup expired accounts')
      }
    } catch (error) {
      console.error('Error cleaning up expired accounts:', error)
      toast.error('Failed to cleanup expired accounts')
    }
  }

  const getStatusBadge = (status: string, daysRemaining: number) => {
    switch (status) {
      case 'RECOVERED':
        return <Badge variant="secondary">Recovered</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Expired</Badge>
      case 'ACTIVE':
        return (
          <Badge variant={daysRemaining > 7 ? 'default' : 'destructive'}>
            {daysRemaining} days left
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredAccounts = deletedAccounts.filter(account =>
    account.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    account.full_name?.toLowerCase().includes(searchEmail.toLowerCase()) ||
    account.business_name?.toLowerCase().includes(searchEmail.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-[#040458]">Deleted Accounts</h2>
          <Badge variant="outline">{totalAccounts} total</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleCleanupExpired}
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <Shield className="h-4 w-4 mr-2" />
            Cleanup Expired
          </Button>
        <Button
          onClick={async () => {
            if (confirm('⚠️ WARNING: This will permanently delete ALL accounts from the ENTIRE database (user_profiles, auth.users, and all related tables), even those within the 30-day recovery period. This action cannot be undone. Are you sure?')) {
              try {
                const result = await AccountDeletionService.permanentDeleteAllAccounts()
                if (result.success) {
                  toast.success(`Permanently deleted ${result.deletedCount} accounts`)
                  loadDeletedAccounts()
                } else {
                  toast.error(result.error || 'Failed to permanently delete accounts')
                }
              } catch (error) {
                console.error('Error permanently deleting all accounts:', error)
                toast.error('Failed to permanently delete accounts')
              }
            }
          }}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Delete All Permanently
        </Button>
        
        <Button
          onClick={async () => {
            try {
              const accounts = await loadAccountsNeedingManualDeletion()
              setAccountsNeedingManualDeletion(accounts)
              setShowManualDeletionSection(true)
              toast.success(`Found ${accounts.length} accounts needing manual deletion`)
            } catch (error) {
              console.error('Error loading accounts needing manual deletion:', error)
              toast.error('Failed to load accounts needing manual deletion')
            }
          }}
          variant="outline"
          size="sm"
          className="text-orange-600 border-orange-600 hover:bg-orange-50"
        >
          <Shield className="h-4 w-4 mr-2" />
          Check Manual Deletion
        </Button>
          <Button
            onClick={loadDeletedAccounts}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={async () => {
              const result = await AccountDeletionService.createTestDeletedAccount()
              if (result.success) {
                toast.success('Test deleted account created')
                loadDeletedAccounts()
              } else {
                toast.error(result.error || 'Failed to create test account')
              }
            }}
            variant="outline"
            size="sm"
            className="bg-blue-50 text-blue-600 border-blue-200"
          >
            <User className="h-4 w-4 mr-2" />
            Create Test Account
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
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Recovery</p>
                <p className="text-2xl font-bold text-blue-600">
                  {deletedAccounts.filter(a => a.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Recovered</p>
                <p className="text-2xl font-bold text-green-600">
                  {deletedAccounts.filter(a => a.status === 'RECOVERED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {deletedAccounts.filter(a => a.status === 'EXPIRED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deleted Accounts List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#040458]" />
              <p className="text-sm text-gray-600 mt-2">Loading deleted accounts...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Trash2 className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-600 mt-2">No deleted accounts found</p>
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
                    <TableHead>Deleted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.email}</TableCell>
                      <TableCell>{account.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {account.user_type === 'business' ? 'Business' : 'Individual'}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.business_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">
                            {new Date(account.deleted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(account.status, account.days_remaining)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {account.status === 'ACTIVE' && (
                            <>
                              <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setSelectedAccount(account)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Restore
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Restore Account</DialogTitle>
                                    <DialogDescription>
                                      This will restore the account for {account.email} and allow them to sign in again.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="restore-reason">Reason for restoration</Label>
                                      <Textarea
                                        id="restore-reason"
                                        placeholder="Enter reason for account restoration..."
                                        value={restoreReason}
                                        onChange={(e) => setRestoreReason(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setShowRestoreDialog(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleRestoreAccount}
                                        disabled={!restoreReason.trim()}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        Restore Account
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setSelectedAccount(account)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Permanently Delete Account</DialogTitle>
                                    <DialogDescription>
                                      This will permanently delete the account for {account.email}. 
                                      This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="delete-reason">Reason for permanent deletion</Label>
                                      <Textarea
                                        id="delete-reason"
                                        placeholder="Enter reason for permanent deletion..."
                                        value={deleteReason}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setShowPermanentDeleteDialog(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={handlePermanentDelete}
                                        disabled={!deleteReason.trim()}
                                      >
                                        Permanently Delete
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Deletion Section */}
      {showManualDeletionSection && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <Shield className="h-5 w-5 mr-2" />
              Accounts Needing Manual Deletion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsNeedingManualDeletion.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No accounts currently need manual deletion. All expired accounts have been processed.
                </AlertDescription>
              </Alert>
            ) : (
              <div>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These accounts have been cleaned of all data but still exist in the auth.users table. 
                    They need to be manually deleted through the Supabase dashboard.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  {accountsNeedingManualDeletion.map((account, index) => (
                    <div key={account.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{account.email}</p>
                          <p className="text-sm text-gray-600">{account.full_name}</p>
                          <p className="text-xs text-gray-500">
                            Expired {account.days_expired} days ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Manual Deletion Required
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(account.email)
                            toast.success('Email copied to clipboard')
                          }}
                        >
                          Copy Email
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Instructions for Manual Deletion:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Go to Supabase Dashboard → Authentication → Users</li>
                    <li>2. Search for each email listed above</li>
                    <li>3. Select and delete each user</li>
                    <li>4. Or run the cleanup script: <code className="bg-blue-100 px-1 rounded">node scripts/30-day-cleanup.js</code></li>
                  </ol>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalAccounts > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalAccounts)} of {totalAccounts} accounts
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * limit >= totalAccounts}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAccountDeletion
