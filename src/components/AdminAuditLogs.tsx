import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RefreshCw, Clock, User, Mail, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { adminService, AdminLogEntry } from '@/services/adminService'

interface AdminAuditLogsProps {
  isOpen: boolean
  onClose: () => void
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AdminLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadLogs()
    }
  }, [isOpen])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAdminLogs(50) // Load last 50 logs
      setLogs(data)
    } catch (error) {
      console.error('Error loading admin logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadLogs()
      toast.success('Audit logs refreshed')
    } catch (error) {
      console.error('Error refreshing logs:', error)
      toast.error('Failed to refresh logs')
    } finally {
      setRefreshing(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'email_verified':
        return <Mail className="h-4 w-4 text-green-600" />
      case 'email_unverified':
        return <Mail className="h-4 w-4 text-red-600" />
      case 'tier_upgraded':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'user_deleted':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionBadge = (action: string) => {
    const actionColors = {
      email_verified: 'bg-green-100 text-green-800',
      email_unverified: 'bg-red-100 text-red-800',
      tier_upgraded: 'bg-blue-100 text-blue-800',
      user_deleted: 'bg-red-100 text-red-800',
      login: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={actionColors[action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800'}>
        {action.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatMetadata = (metadata: any) => {
    if (!metadata) return 'No details'
    
    const details = []
    if (metadata.email) details.push(`Email: ${metadata.email}`)
    if (metadata.userId) details.push(`User ID: ${metadata.userId.slice(0, 8)}...`)
    if (metadata.tier) details.push(`Tier: ${metadata.tier}`)
    if (metadata.verificationTimestamp) details.push(`Verified: ${new Date(metadata.verificationTimestamp).toLocaleString()}`)
    
    return details.length > 0 ? details.join(', ') : 'No details'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-[#040458]">Admin Audit Logs</h2>
            <Badge variant="outline" className="text-[#040458] border-[#040458]">
              {logs.length} entries
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Email Verifications</p>
                    <p className="text-2xl font-bold text-green-600">
                      {logs.filter(log => log.action === 'email_verified').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Email Unverifications</p>
                    <p className="text-2xl font-bold text-red-600">
                      {logs.filter(log => log.action === 'email_unverified').length}
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
                    <p className="text-sm font-medium">Tier Upgrades</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {logs.filter(log => log.action === 'tier_upgraded').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Total Actions</p>
                    <p className="text-2xl font-bold text-gray-600">{logs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#040458]"></div>
                        <span className="ml-2">Loading audit logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {(log as any).admin_auth?.email || 'Unknown Admin'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(log as any).admin_auth?.role || 'Unknown Role'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs">
                        <div className="truncate" title={formatMetadata(log.metadata)}>
                          {formatMetadata(log.metadata)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(log.created_at || '')}</span>
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

export default AdminAuditLogs
