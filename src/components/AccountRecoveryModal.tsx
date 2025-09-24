import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, User, Building2, RefreshCw, AlertTriangle } from 'lucide-react'
import { AccountDeletionService, DeletedAccountInfo } from '@/services/accountDeletionService'
import { toast } from 'sonner'

interface AccountRecoveryModalProps {
  email: string
  isOpen: boolean
  onClose: () => void
  onRecover: (recoveryToken: string) => void
  onStartFresh: () => void
}

const AccountRecoveryModal: React.FC<AccountRecoveryModalProps> = ({
  email,
  isOpen,
  onClose,
  onRecover,
  onStartFresh
}) => {
  const [accountInfo, setAccountInfo] = useState<DeletedAccountInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    if (isOpen && email) {
      checkForRecoverableAccount()
    }
  }, [isOpen, email])

  const checkForRecoverableAccount = async () => {
    setLoading(true)
    try {
      const info = await AccountDeletionService.checkRecoverableAccount(email)
      setAccountInfo(info)
    } catch (error) {
      console.error('Error checking recoverable account:', error)
      toast.error('Failed to check for recoverable account')
    } finally {
      setLoading(false)
    }
  }

  const handleRecover = async () => {
    if (!accountInfo) return
    
    setRecovering(true)
    try {
      // For now, we'll just call the onRecover callback
      // The actual recovery will be handled by the parent component
      onRecover('recovery-token-placeholder') // This should be the actual recovery token
    } catch (error) {
      console.error('Error recovering account:', error)
      toast.error('Failed to recover account')
    } finally {
      setRecovering(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-[#040458]">
            Account Recovery Available
          </CardTitle>
          <CardDescription>
            We found a previously deleted account for this email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040458] mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Checking for recoverable account...</p>
            </div>
          ) : accountInfo?.has_recoverable_account ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Account Found:</strong> You have a deleted account that can be recovered.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Account Type:</span>
                  <Badge variant="outline">
                    {accountInfo.user_type === 'business' ? 'Business' : 'Individual'}
                  </Badge>
                </div>

                {accountInfo.business_name && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Business:</span>
                    <span className="text-sm text-gray-600">{accountInfo.business_name}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Deleted:</span>
                  <span className="text-sm text-gray-600">
                    {accountInfo.deleted_at ? new Date(accountInfo.deleted_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Recovery expires in:</span>
                  <Badge variant={accountInfo.days_remaining && accountInfo.days_remaining > 7 ? 'default' : 'destructive'}>
                    {accountInfo.days_remaining} days
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRecover}
                  disabled={recovering}
                  className="w-full bg-gradient-to-r from-[#040458] to-[#faa51a] hover:from-[#030345] hover:to-[#e6950e] text-white"
                >
                  {recovering ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Recovering Account...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recover My Account
                    </>
                  )}
                </Button>

                <Button
                  onClick={onStartFresh}
                  variant="outline"
                  className="w-full"
                >
                  Start Fresh (New Account)
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>
                  <strong>Recover:</strong> Restore your previous account with all data intact.<br/>
                  <strong>Start Fresh:</strong> Create a completely new account.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">
                No recoverable account found for this email address.
              </p>
              <Button
                onClick={onStartFresh}
                className="w-full mt-4 bg-gradient-to-r from-[#040458] to-[#faa51a] hover:from-[#030345] hover:to-[#e6950e] text-white"
              >
                Continue with New Account
              </Button>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountRecoveryModal
