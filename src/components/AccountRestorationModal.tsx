import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Lock, AlertTriangle, CheckCircle } from 'lucide-react'
import { AccountDeletionService } from '@/services/accountDeletionService'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface AccountRestorationModalProps {
  isOpen: boolean
  onClose: () => void
  onRestoreSuccess: () => void
  email: string
  accountInfo: any
}

const AccountRestorationModal: React.FC<AccountRestorationModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
  email,
  accountInfo
}) => {
  const [password, setPassword] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'password' | 'reason' | 'success'>('password')
  const [error, setError] = useState('')

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verify password by attempting to sign in
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        setError('Invalid password. Please check your credentials.')
        setLoading(false)
        return
      }

      // Password is correct, move to reason step
      setStep('reason')
    } catch (error: any) {
      setError('Password verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a reason for restoration')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await AccountDeletionService.restoreAccountWithPassword(
        email,
        password,
        reason
      )

      if (result.success) {
        setStep('success')
        toast.success(result.message || 'Account restored successfully!')
        
        // Wait a moment then close and redirect
        setTimeout(() => {
          onRestoreSuccess()
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to restore account')
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setReason('')
    setError('')
    setStep('password')
    onClose()
  }

  const getDaysRemaining = () => {
    if (!accountInfo?.recovery_expires_at) return 0
    const expiryDate = new Date(accountInfo.recovery_expires_at)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const daysRemaining = getDaysRemaining()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            <span>Account Restoration</span>
          </DialogTitle>
          <DialogDescription>
            Your account was soft-deleted on {new Date(accountInfo?.deleted_at).toLocaleDateString()}. 
            You have {daysRemaining} days remaining to restore it.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to verify"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !password.trim()}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Verify Password
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'reason' && (
          <form onSubmit={handleRestoreSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restore-reason">Why do you want to restore your account?</Label>
              <Textarea
                id="restore-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you want to restore your account..."
                rows={3}
                required
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                By restoring your account, you will regain access to all your data and can continue using the platform.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setStep('password')}>
                Back
              </Button>
              <Button type="submit" disabled={loading || !reason.trim()}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restore Account
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">Account Restored Successfully!</h3>
              <p className="text-sm text-gray-600 mt-2">
                Your account has been restored and you will be redirected to your dashboard shortly.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AccountRestorationModal
