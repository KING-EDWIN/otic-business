import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ProfessionalSignupService } from '@/services/professionalSignup'
import ProfessionalEmailVerificationPrompt from '@/components/ProfessionalEmailVerificationPrompt'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Building2, User, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ProfessionalSignupFlowProps {
  userType: 'business' | 'individual'
  onComplete?: () => void
}

const ProfessionalSignupFlow = ({ userType, onComplete }: ProfessionalSignupFlowProps) => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [step, setStep] = useState<'signup' | 'verification' | 'complete'>('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    fullName: '',
    phone: '',
    address: '',
    profession: '',
    country: '',
    countryCode: ''
  })

  // Check if user is already verified
  useEffect(() => {
    if (user && profile) {
      if (profile.email_verified) {
        setStep('complete')
        onComplete?.()
      } else {
        setStep('verification')
      }
    }
  }, [user, profile, onComplete])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.email) {
      errors.push('Email is required')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Please enter a valid email address')
    }

    if (!formData.password) {
      errors.push('Password is required')
    } else if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match')
    }

    if (userType === 'business' && !formData.businessName) {
      errors.push('Business name is required')
    }

    if (userType === 'individual' && !formData.fullName) {
      errors.push('Full name is required')
    }

    return errors
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }

    setLoading(true)
    try {
      const result = await ProfessionalSignupService.signup({
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        fullName: formData.fullName,
        userType,
        phone: formData.phone,
        address: formData.address,
        profession: formData.profession,
        country: formData.country,
        countryCode: formData.countryCode
      })

      if (result.success) {
        if (result.needsEmailVerification) {
          setStep('verification')
          toast.success('Account created! Please check your email to verify your account.')
        } else {
          setStep('complete')
          onComplete?.()
        }
      } else {
        setError(result.error || 'Signup failed')
      }
    } catch (error: any) {
      setError(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationComplete = () => {
    setStep('complete')
    onComplete?.()
  }

  if (step === 'verification') {
    return (
      <ProfessionalEmailVerificationPrompt
        onVerificationComplete={handleVerificationComplete}
        userType={userType}
      />
    )
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to OTIC Business!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your {userType} account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your email has been verified and your account is ready to use.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => navigate(userType === 'business' ? '/dashboard' : '/individual-dashboard')}
              className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
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
          onClick={() => navigate('/user-type')}
          className="flex items-center space-x-2 bg-white/90 hover:bg-white backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {userType === 'business' ? (
              <Building2 className="h-12 w-12 text-[#040458]" />
            ) : (
              <User className="h-12 w-12 text-[#faa51a]" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {userType === 'business' ? 'Business Signup' : 'Professional Signup'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create your {userType} account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            {/* Business Name or Full Name */}
            {userType === 'business' ? (
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                  required
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                disabled={loading}
              />
            </div>

            {/* Individual-specific fields */}
            {userType === 'individual' && (
              <div className="space-y-2">
                <Label htmlFor="profession">Profession (Optional)</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  placeholder="Enter your profession"
                  disabled={loading}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={`w-full ${
                userType === 'business' 
                  ? 'bg-[#040458] hover:bg-[#040458]/90' 
                  : 'bg-[#faa51a] hover:bg-[#faa51a]/90'
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                `Create ${userType === 'business' ? 'Business' : 'Professional'} Account`
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Already have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-[#faa51a] hover:text-[#faa51a]/80"
                onClick={() => navigate(userType === 'business' ? '/business-signin' : '/individual-signin')}
              >
                Sign in
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfessionalSignupFlow
