import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Eye, EyeOff, CheckCircle, Loader2, ArrowLeft, Building2, User } from 'lucide-react'
import { toast } from 'sonner'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Password strength checker
  const checkPasswordStrength = useCallback((pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }, [])

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password))
  }, [password, checkPasswordStrength])

  useEffect(() => {
    // Check if we have a valid session for password reset
    if (user) {
      setIsValidSession(true)
    } else {
      // Redirect to login if no valid session
      navigate('/login-type')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      toast.success('Password updated successfully!')
      
      // Redirect based on user type
      if (profile?.user_type === 'business') {
        navigate('/dashboard')
      } else {
        navigate('/individual-dashboard')
      }
    } catch (error: any) {
      console.error('Error updating password:', error)
      setError(error.message || 'Failed to update password')
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 2) return 'bg-orange-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Very Weak'
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Fair'
    if (passwordStrength <= 4) return 'Good'
    return 'Strong'
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Validating session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
      {/* Return Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/login-type')}
          className="flex items-center space-x-2 bg-white/90 hover:bg-white backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            {profile?.user_type === 'business' ? (
              <Building2 className="h-12 w-12 text-[#040458]" />
            ) : (
              <User className="h-12 w-12 text-[#faa51a]" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Reset Your Password</CardTitle>
          <CardDescription className="text-gray-600">
            {profile?.user_type === 'business' 
              ? 'Set a new password for your business account'
              : 'Set a new password for your professional account'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="bg-white pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Password strength: <span className="font-medium">{getPasswordStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  className="bg-white pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || passwordStrength < 3}
              className={`w-full ${
                profile?.user_type === 'business' 
                  ? 'bg-[#040458] hover:bg-[#040458]/90' 
                  : 'bg-[#faa51a] hover:bg-[#faa51a]/90'
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating Password...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Update Password</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-[#faa51a] hover:text-[#faa51a]/80"
                onClick={() => navigate('/login-type')}
              >
                Sign in instead
              </Button>
            </p>
            
            <div className="text-xs text-gray-500">
              <p>Password requirements:</p>
              <ul className="mt-1 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Include numbers and special characters</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword
