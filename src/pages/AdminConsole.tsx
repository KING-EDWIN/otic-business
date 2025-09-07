import { useEffect, useMemo, useState } from 'react'
import { adminService, AdminUser } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import TierUpgradeRequests from '@/components/TierUpgradeRequests'
import EmailVerificationManager from '@/components/EmailVerificationManager'
import { Crown, Mail } from 'lucide-react'

const isDesktop = () => {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= 992
}

const AdminConsole = () => {
  // TEMPORARILY DISABLE AUTH - SHOW ADMIN PAGE DIRECTLY
  const [resendEmail, setResendEmail] = useState('')
  const [showTierManagement, setShowTierManagement] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)

  const desktopOnly = useMemo(() => isDesktop(), [])

  const handleLogout = () => {
    // TEMPORARILY DISABLED
  }

  if (!desktopOnly) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Admin Console</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">This page is only accessible on desktop.</p>
          </CardContent>
        </Card>
      </div>
    )
  }


  const handleResend = async () => {
    if (!resendEmail) return
    console.log(`Email resend requested for: ${resendEmail}`)
    toast.success('Email resend requested (logged to console)')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-[#040458]">Admin Console</h1>
              <Badge variant="outline" className="text-[#040458] border-[#040458]">Internal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Logged in as: admin@otic.com (TEMP)</span>
              <Button variant="outline" onClick={handleLogout} className="text-[#040458] border-[#040458]">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Email Verification Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Manage user email verification status and manually verify emails for users who can't receive verification emails.</p>
            <div className="flex space-x-3">
              <Button 
                className="bg-[#040458] hover:bg-[#030345] text-white"
                onClick={() => setShowEmailVerification(true)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Manage Email Verification
              </Button>
              <div className="flex items-center space-x-3">
                <Input placeholder="user@example.com" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} />
                <Button variant="outline" onClick={handleResend}>Resend Confirmation</Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Use the management interface to verify emails or resend confirmations for specific users.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tier Upgrade Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">Manage customer tier upgrade requests, verify payments, and manually upgrade customer tiers.</p>
            <Button 
              className="bg-[#040458] hover:bg-[#030345] text-white"
              onClick={() => setShowTierManagement(true)}
            >
              <Crown className="h-4 w-4 mr-2" />
              Open Tier Management
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Proofs Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">Admins can verify or reject uploaded payment proofs from the regular Payments admin workflow. For now, use the existing flow; deeper integration can be added here if needed.</p>
          </CardContent>
        </Card>
      </div>

      <TierUpgradeRequests 
        isOpen={showTierManagement} 
        onClose={() => setShowTierManagement(false)} 
      />

      <EmailVerificationManager 
        isOpen={showEmailVerification} 
        onClose={() => setShowEmailVerification(false)} 
      />
    </div>
  )
}

export default AdminConsole


