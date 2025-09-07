import { useEffect, useMemo, useState } from 'react'
import { adminService, AdminUser } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const isDesktop = () => {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= 992
}

const AdminConsole = () => {
  // TEMPORARILY DISABLE AUTH - SHOW ADMIN PAGE DIRECTLY
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>({
    id: 'temp-admin',
    email: 'admin@otic.com',
    role: 'super_admin',
    created_at: new Date().toISOString()
  })
  const [loading, setLoading] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const desktopOnly = useMemo(() => isDesktop(), [])

  const handleLogin = async () => {
    setLoading(true)
    setAuthError('')
    
    const result = await adminService.authenticateAdmin(loginEmail, loginPassword)
    
    if (result.success && result.admin) {
      setCurrentAdmin(result.admin)
      await adminService.logAction(result.admin.id, 'admin_console_access')
      toast.success('Welcome back!')
    } else {
      setAuthError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    setCurrentAdmin(null)
    setLoginEmail('')
    setLoginPassword('')
    setAuthError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458]"></div>
      </div>
    )
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

  // TEMPORARILY DISABLED - SHOW ADMIN PAGE DIRECTLY
  // if (!currentAdmin) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
  //       <Card className="max-w-md w-full">
  //         <CardHeader>
  //           <CardTitle className="text-center text-[#040458]">Welcome back, Otic B Sys Admin</CardTitle>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <p className="text-center text-sm text-gray-600">Enter your admin credentials to access the panel.</p>
  //           {authError && <p className="text-sm text-red-600">{authError}</p>}
  //           <Input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
  //           <Input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
  //           <Button 
  //             className="w-full bg-[#040458] hover:bg-[#030345] text-white" 
  //             onClick={handleLogin}
  //             disabled={loading}
  //           >
  //             {loading ? 'Signing in...' : 'Sign In'}
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }


  const handleResend = async () => {
    if (!resendEmail) return
    const { error } = await adminService.resendEmailConfirmation(resendEmail)
    if (error) {
      toast.error('Failed to resend confirmation')
      await adminService.logAction(currentAdmin!.id, 'resend_email_failure', { email: resendEmail, error })
    } else {
      toast.success('Confirmation email sent')
      await adminService.logAction(currentAdmin!.id, 'resend_email_success', { email: resendEmail })
    }
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
              <span className="text-sm text-gray-600">Logged in as: {currentAdmin.email}</span>
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
            <CardTitle>Manual User Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Input placeholder="user@example.com" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} />
              <Button className="bg-[#040458] hover:bg-[#030345] text-white" onClick={handleResend}>Resend Confirmation</Button>
            </div>
            <p className="text-xs text-gray-500">Use this if users report missing verification emails.</p>
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
    </div>
  )
}

export default AdminConsole


