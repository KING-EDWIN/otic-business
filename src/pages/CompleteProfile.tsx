import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: '',
    tier: 'free_trial' as 'free_trial' | 'basic' | 'standard' | 'premium'
  })
  const [googleEmail, setGoogleEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const { updateProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setGoogleEmail(user.email || '')
        
        // Check if user already has a complete profile
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('business_name, tier')
          .eq('id', user.id)
          .single()

        if (existingProfile && existingProfile.business_name) {
          // User already has a complete profile, redirect to dashboard
          navigate('/dashboard')
          return
        }

        // Pre-fill with Google profile data if available
        if (user.user_metadata?.full_name) {
          setFormData(prev => ({
            ...prev,
            businessName: user.user_metadata.full_name
          }))
        }
      } else {
        // No user found, redirect to sign up
        navigate('/signup')
      }
    }
    getUser()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('No user found. Please try signing in again.')
      setLoading(false)
      return
    }

    try {
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError)
        setError('Failed to check existing profile. Please try again.')
        setLoading(false)
        return
      }

      if (existingProfile) {
        // Profile exists, update it
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            business_name: formData.businessName,
            phone: formData.phone,
            address: formData.address,
            tier: formData.tier,
            email_verified: true, // Set as verified
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
          setError(`Failed to update profile: ${updateError.message}`)
          setLoading(false)
          return
        }
      } else {
        // Profile doesn't exist, create it
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email!,
            business_name: formData.businessName,
            phone: formData.phone,
            address: formData.address,
            tier: formData.tier,
            email_verified: true, // Set as verified
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createError) {
          console.error('Error creating user profile:', createError)
          setError(`Failed to create profile: ${createError.message}`)
          setLoading(false)
          return
        }
      }

      // Handle subscription creation/update
      const { data: existingSubscription, error: subCheckError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (subCheckError && subCheckError.code !== 'PGRST116') {
        console.error('Error checking existing subscription:', subCheckError)
        // Don't fail the whole process for subscription errors
        console.warn('Subscription check failed, but profile was created successfully')
      } else if (existingSubscription) {
        // Update existing subscription
        const { error: updateSubError } = await supabase
          .from('user_subscriptions')
          .update({
            tier: formData.tier,
            status: 'active',
            expires_at: formData.tier === 'free_trial' 
              ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateSubError) {
          console.error('Error updating subscription:', updateSubError)
        }
      } else {
        // Create new subscription
        const { error: createSubError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            tier: formData.tier,
            status: 'active',
            expires_at: formData.tier === 'free_trial' 
              ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createSubError) {
          console.error('Error creating subscription:', createSubError)
        }
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error completing profile:', error)
    }

    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
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
              <h2 className="text-2xl font-bold mb-2 text-[#040458]">Profile Complete!</h2>
              <p className="text-gray-600 mb-4">
                Your business profile has been created successfully. Redirecting to dashboard...
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
          <CardTitle className="text-2xl font-bold text-[#040458]">Complete Your Business Profile</CardTitle>
          <CardDescription className="text-gray-600">
            Your Google account is linked! Just add your business details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Linked Google Account */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">Google Account Linked</p>
                  <p className="text-xs text-green-600">{googleEmail}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Your Business Name"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +2567XXXXXXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address (Optional)</Label>
              <Input
                id="address"
                type="text"
                placeholder="Your Business Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Select Your Plan</Label>
              <Select value={formData.tier} onValueChange={(value: 'free_trial' | 'basic' | 'standard' | 'premium') => handleInputChange('tier', value)}>
                <SelectTrigger id="tier">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_trial">Free Trial (30 Days)</SelectItem>
                  <SelectItem value="basic">Basic (UGX 50,000/month)</SelectItem>
                  <SelectItem value="standard">Standard (UGX 150,000/month)</SelectItem>
                  <SelectItem value="premium">Premium (UGX 300,000/month)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#faa51a] hover:bg-[#040458] text-white font-semibold"
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Need help? </span>
            <a href="mailto:support@oticbusiness.com" className="text-[#faa51a] hover:underline font-medium">
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompleteProfile
