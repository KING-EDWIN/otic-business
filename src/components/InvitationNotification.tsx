import React, { useState, useEffect } from 'react'
import { Bell, Mail, Building2, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InvitationService, BusinessInvitation } from '@/services/invitationService'
import { useAuth } from '@/contexts/AuthContext'

interface InvitationNotificationProps {
  className?: string
}

export const InvitationNotification: React.FC<InvitationNotificationProps> = ({ className = '' }) => {
  const { user, profile } = useAuth()
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    invitation: BusinessInvitation
    action: 'accept' | 'decline'
  } | null>(null)

  useEffect(() => {
    if (user?.email) {
      loadInvitations()
    }
  }, [user?.email])

  const loadInvitations = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      const data = await InvitationService.getUserInvitations(user.email)
      setInvitations(data)
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (invitation: BusinessInvitation, action: 'accept' | 'decline') => {
    if (!user?.id) return

    setRespondingTo(invitation.id)
    try {
      const result = await InvitationService.respondToInvitation(
        invitation.id,
        action,
        user.id
      )

      if (result?.success) {
        // Remove the invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id))
        
        // Show success message
        if (action === 'accepted') {
          // You might want to redirect to the business dashboard or show a success message
          console.log('Successfully joined business:', invitation.business_name)
        }
      }
    } catch (error) {
      console.error('Error responding to invitation:', error)
    } finally {
      setRespondingTo(null)
      setShowConfirmDialog(null)
    }
  }

  const showConfirmation = (invitation: BusinessInvitation, action: 'accept' | 'decline') => {
    setShowConfirmDialog({ invitation, action })
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

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-orange-100 text-orange-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading invitations...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className={`${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Business Invitations
            </CardTitle>
            <CardDescription>
              You don't have any pending business invitations
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Business Invitations
            <Badge variant="secondary" className="ml-2">
              {invitations.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            You have {invitations.length} pending business invitation{invitations.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-lg">{invitation.business_name}</h4>
                    <p className="text-sm text-gray-600">
                      Invited by <span className="font-medium">{invitation.invited_by_name}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleBadgeColor(invitation.role)}>
                        {invitation.role}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        Expires {formatDate(invitation.expires_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {invitation.message && (
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Message:</strong> {invitation.message}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => showConfirmation(invitation, 'accept')}
                  disabled={respondingTo === invitation.id}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Invitation
                </Button>
                <Button
                  onClick={() => showConfirmation(invitation, 'decline')}
                  disabled={respondingTo === invitation.id}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold">Confirm Your Decision</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                You are about to <strong>{showConfirmDialog.action}</strong> the invitation to join{' '}
                <strong>{showConfirmDialog.invitation.business_name}</strong> as a{' '}
                <strong>{showConfirmDialog.invitation.role}</strong>.
              </p>
              
              {showConfirmDialog.action === 'accept' ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Accepting</strong> will add you as a member of this business. 
                    You'll be able to access the business dashboard and collaborate with the team.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Declining</strong> will reject this invitation. 
                    You can still be invited again in the future if needed.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmDialog(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleRespond(showConfirmDialog.invitation, showConfirmDialog.action)}
                disabled={respondingTo === showConfirmDialog.invitation.id}
                className={`flex-1 ${
                  showConfirmDialog.action === 'accept' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {respondingTo === showConfirmDialog.invitation.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  `Confirm ${showConfirmDialog.action === 'accept' ? 'Accept' : 'Decline'}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvitationNotification
