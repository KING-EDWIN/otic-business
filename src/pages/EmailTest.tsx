import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const EmailTest: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const testSignup = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      console.log('🧪 Testing signup with email:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            business_name: 'Test Business',
            user_type: 'business',
            full_name: 'Test User'
          }
        }
      })

      if (error) {
        console.error('❌ Signup error:', error)
        toast.error(`Signup failed: ${error.message}`)
        return
      }

      if (data.user) {
        console.log('✅ User created:', data.user.id)
        console.log('📧 Email confirmed at:', data.user.email_confirmed_at)
        
        if (!data.user.email_confirmed_at) {
          toast.success('✅ Signup successful! Check your email for verification.')
          console.log('📧 Verification email should have been sent')
        } else {
          toast.success('✅ Signup successful! Email already verified.')
        }
      } else {
        toast.error('❌ No user data returned')
      }
    } catch (error: any) {
      console.error('❌ Exception:', error)
      toast.error(`Exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testResend = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      console.log('🧪 Testing resend verification for:', email)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      })

      if (error) {
        console.error('❌ Resend error:', error)
        toast.error(`Resend failed: ${error.message}`)
        return
      }

      console.log('✅ Resend successful')
      toast.success('✅ Verification email resent! Check your inbox.')
    } catch (error: any) {
      console.error('❌ Resend exception:', error)
      toast.error(`Resend exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={testSignup} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Signup'}
            </Button>
            
            <Button 
              onClick={testResend} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Resend Verification'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Enter a test email address</li>
              <li>Click "Test Signup" to create a test account</li>
              <li>Check your email for verification</li>
              <li>Use "Test Resend" if needed</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailTest
