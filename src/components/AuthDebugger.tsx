import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { checkAuthStatus, refreshSession, clearAuth } from '@/utils/authUtils'
import { supabase } from '@/lib/supabaseClient'
import { RefreshCw, Bug, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export const AuthDebugger: React.FC = () => {
  const { user, session, profile } = useAuth()
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const runAuthCheck = async () => {
    setLoading(true)
    try {
      const status = await checkAuthStatus()
      setAuthStatus(status)
    } catch (error) {
      console.error('Error running auth check:', error)
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseConnection = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)
      
      setTestResult({ success: !error, data, error })
    } catch (error) {
      setTestResult({ success: false, error })
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshSession = async () => {
    setLoading(true)
    try {
      const result = await refreshSession()
      if (result.success) {
        await runAuthCheck()
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearAuth = async () => {
    setLoading(true)
    try {
      await clearAuth()
      window.location.reload()
    } catch (error) {
      console.error('Error clearing auth:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runAuthCheck()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Authentication Debugger
        </CardTitle>
        <CardDescription>
          Debug authentication issues and test Supabase connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Context State */}
        <div>
          <h4 className="font-medium mb-2">Context State</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>User:</span>
              <Badge variant={user ? 'default' : 'secondary'}>
                {user ? 'Present' : 'None'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Session:</span>
              <Badge variant={session ? 'default' : 'secondary'}>
                {session ? 'Present' : 'None'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Profile:</span>
              <Badge variant={profile ? 'default' : 'secondary'}>
                {profile ? 'Present' : 'None'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>User ID:</span>
              <span className="text-xs font-mono">{user?.id || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Auth Status */}
        {authStatus && (
          <div>
            <h4 className="font-medium mb-2">Auth Status</h4>
            <Alert className={authStatus.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {authStatus.valid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {authStatus.valid ? 'Authentication is valid' : `Authentication failed: ${authStatus.reason}`}
                </AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div>
            <h4 className="font-medium mb-2">Supabase Connection Test</h4>
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {testResult.success ? 'Supabase connection successful' : `Connection failed: ${testResult.error?.message || 'Unknown error'}`}
                </AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={runAuthCheck}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check Auth
          </Button>
          <Button
            onClick={testSupabaseConnection}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Connection
          </Button>
          <Button
            onClick={handleRefreshSession}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Refresh Session
          </Button>
          <Button
            onClick={handleClearAuth}
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            Clear Auth
          </Button>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Session expires: {session?.expires_at ? new Date(session.expires_at).toLocaleString() : 'N/A'}</div>
          <div>User email: {user?.email || 'N/A'}</div>
          <div>Profile type: {profile?.user_type || 'N/A'}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuthDebugger
