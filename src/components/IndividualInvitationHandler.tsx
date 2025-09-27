import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { IndividualBusinessAccessService, BusinessInvitation } from '@/services/individualBusinessAccessService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Building2, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

const IndividualInvitationHandler: React.FC = () => {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null)

  useEffect(() => {
    if (user?.email) {
      loadInvitations()
    }
  }, [user?.email])

  const loadInvitations = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      const pendingInvitations = await IndividualBusinessAccessService.getPendingInvitations(user.email)
      setInvitations(pendingInvitations)
    } catch (error) {
      console.error('Error loading invitations:', error)
      toast.error('Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!user?.id) return

    try {
      setProcessingInvitation(invitationId)
      const result = await IndividualBusinessAccessService.acceptInvitation(invitationId, user.id)
      
      if (result.success) {
        toast.success('Invitation accepted! You now have access to the business.')
        // Remove the accepted invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      } else {
        toast.error(result.error || 'Failed to accept invitation')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setProcessingInvitation(null)
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      setProcessingInvitation(invitationId)
      const result = await IndividualBusinessAccessService.declineInvitation(invitationId)
      
      if (result.success) {
        toast.success('Invitation declined')
        // Remove the declined invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      } else {
        toast.error(result.error || 'Failed to decline invitation')
      }
    } catch (error) {
      console.error('Error declining invitation:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setProcessingInvitation(null)
    }
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffInHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 0) return 'Expired'
    if (diffInHours < 24) return `${diffInHours}h remaining`
    return `${Math.floor(diffInHours / 24)}d remaining`
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Business Invitations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-[#040458]" />
            <span className="ml-2 text-gray-600">Loading invitations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Business Invitations</span>
          </CardTitle>
          <CardDescription>
            You have no pending business invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending invitations</p>
            <p className="text-sm text-gray-500 mt-2">
              Business owners can invite you to access their systems
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Business Invitations</span>
          <Badge variant="secondary" className="ml-2">
            {invitations.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Accept invitations to access business systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className={`border rounded-lg p-4 ${
              isExpired(invitation.expires_at) 
                ? 'border-red-200 bg-red-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-[#040458]" />
                  <h3 className="font-semibold text-gray-900">{invitation.business_name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {invitation.role}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>Invited by {invitation.invited_by_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span className={isExpired(invitation.expires_at) ? 'text-red-600' : ''}>
                      {formatTimeRemaining(invitation.expires_at)}
                    </span>
                  </div>
                </div>

                {invitation.message && (
                  <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
                    "{invitation.message}"
                  </p>
                )}

                {isExpired(invitation.expires_at) && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm mb-3">
                    <AlertCircle className="h-4 w-4" />
                    <span>This invitation has expired</span>
                  </div>
                )}
              </div>
            </div>

            {!isExpired(invitation.expires_at) && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleAcceptInvitation(invitation.id)}
                  disabled={processingInvitation === invitation.id}
                  className="bg-[#040458] hover:bg-[#030345] text-white"
                >
                  {processingInvitation === invitation.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeclineInvitation(invitation.id)}
                  disabled={processingInvitation === invitation.id}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Decline
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default IndividualInvitationHandler
