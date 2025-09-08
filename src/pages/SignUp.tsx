import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal'

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    phone: '',
    tier: 'free_trial' as 'free_trial' | 'basic' | 'standard' | 'premium'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const { signUp, signUpWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if terms have been accepted
    if (!termsAccepted) {
      setShowTermsModal(true)
      return
    }
    
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await signUp(formData.email, formData.password, formData.businessName, formData.tier)
    
    if (error) {
      setError(error.message || 'Failed to create account')
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    }
    
    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGoogleSignUp = async () => {
    // Check if terms have been accepted
    if (!termsAccepted) {
      setShowTermsModal(true)
      return
    }
    
    setLoading(true)
    setError('')

    const { error } = await signUpWithGoogle()

    if (error) {
      setError('Google sign-up failed. Please try again.')
      setLoading(false)
    }
    // Note: User will be redirected to complete-profile page on success
  }

  const handleTermsAccept = () => {
    setTermsAccepted(true)
    setShowTermsModal(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
        {/* Return Button */}
        <div className="absolute top-4 left-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:text-[#faa51a] hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/Otic icon@2x.png" 
                    alt="Otic Business Logo" 
                    className="h-12 w-12"
                  />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-[#040458]">Otic</span>
                    <span className="text-sm text-[#faa51a] -mt-1">Business</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#faa51a]/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8 text-[#faa51a]" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-[#040458]">Account Created!</h2>
              <p className="text-gray-600 mb-4">
                Your account has been created successfully. Please check your email and click the confirmation link to verify your account.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                You'll be redirected to the dashboard after verification.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#faa51a] mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
      {/* Return Button */}
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-white hover:text-[#faa51a] hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-12 w-12"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#040458]">Otic</span>
                <span className="text-sm text-[#faa51a] -mt-1">Business</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#040458]">Create Account</CardTitle>
          <CardDescription className="text-gray-600">
            Start your business digital transformation journey. Sign up with Google for faster setup!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google Sign-up Button - Prominent */}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full mb-6 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 bg-white shadow-sm" 
            onClick={handleGoogleSignUp}
            disabled={loading || !termsAccepted}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {!termsAccepted ? 'Accept Terms to Continue' : 'Continue with Google (Recommended)'}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or create with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tier">Choose Your Plan</Label>
              <Select value={formData.tier} onValueChange={(value) => handleInputChange('tier', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_trial">Free Trial - 30 days free</SelectItem>
                  <SelectItem value="basic">Basic - UGX 1,000,000/month</SelectItem>
                  <SelectItem value="standard">Standard - UGX 3,000,000/month</SelectItem>
                  <SelectItem value="premium">Premium - UGX 5,000,000/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#faa51a] hover:bg-[#040458] text-white font-semibold" 
              disabled={loading || !termsAccepted}
            >
              {loading ? 'Creating Account...' : 
               !termsAccepted ? 'Accept Terms to Continue' : 
               'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/signin" className="text-[#faa51a] hover:underline font-medium">
              Sign in
            </Link>
          </div>
          
          {/* Privacy Policy Acceptance */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className="text-gray-600">
                {termsAccepted ? (
                  <span className="text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Terms & Conditions Accepted
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Terms & Conditions not accepted
                  </span>
                )}
              </span>
            </div>
            <Button
              type="button"
              variant="link"
              onClick={() => setShowTermsModal(true)}
              className="text-[#040458] hover:text-[#faa51a] text-sm p-0 h-auto"
            >
              {termsAccepted ? 'Review Terms & Conditions' : 'Read Terms & Conditions'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Terms & Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
      />
    </div>
  )
}

export default SignUp
