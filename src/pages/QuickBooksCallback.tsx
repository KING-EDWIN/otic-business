import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { quickbooksService } from '@/services/quickbooksService'

const QuickBooksCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const realmId = urlParams.get('realmId')
      const error = urlParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`QuickBooks authorization failed: ${error}`)
        return
      }

      if (!code || !realmId) {
        setStatus('error')
        setMessage('Missing authorization code or realm ID')
        return
      }

      // Exchange code for tokens
      const result = await quickbooksService.exchangeCodeForTokens(code, realmId)
      
      if (result.success) {
        setStatus('success')
        setMessage('QuickBooks connected successfully! You can now use advanced accounting features.')
        
        // Redirect to accounting page after 3 seconds
        setTimeout(() => {
          navigate('/accounting')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to connect to QuickBooks')
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  const handleRetry = () => {
    navigate('/accounting')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>QuickBooks Connection</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Connecting to QuickBooks...'}
            {status === 'success' && 'Connection successful!'}
            {status === 'error' && 'Connection failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#040458]" />
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="text-center text-sm text-gray-600">
              Redirecting to accounting page in 3 seconds...
            </div>
          )}

          {status === 'error' && (
            <div className="flex space-x-2">
              <Button 
                onClick={handleRetry} 
                className="flex-1 bg-[#040458] hover:bg-[#030345]"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/accounting')} 
                variant="outline" 
                className="flex-1"
              >
                Back to Accounting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default QuickBooksCallback
