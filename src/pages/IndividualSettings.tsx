import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  Bell,
  Globe,
  Save,
  Edit,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

const IndividualSettings = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    profession: '',
    bio: '',
    availability: 'available',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false
    }
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        // Simulate loading delay for skeleton effect
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Load profile data (using mock data for now)
        setFormData({
          fullName: profile?.full_name || 'John Doe',
          email: user.email || '',
          phone: '+256 700 123 456',
          location: 'Kampala, Uganda',
          profession: 'Financial Consultant',
          bio: 'Experienced financial consultant specializing in SME growth and business optimization.',
          availability: 'available',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profileVisible: true,
            showEmail: false,
            showPhone: false
          }
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, profile])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Here you would save to database
      console.log('Saving profile:', formData)
      
      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <SkeletonLoader key={j} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Individual Settings</h1>
                <p className="text-gray-600">Manage your professional profile and preferences</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/individual-dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-[#faa51a]" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>
                    Update your personal and professional details
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                  className="flex items-center space-x-2"
                >
                  {editing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  <span>{editing ? 'Cancel' : 'Edit'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your profession"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability Status</Label>
                  <select
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#faa51a] focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!editing}
                  placeholder="Tell us about your professional background and expertise"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-[#faa51a]" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="email-notifications"
                    checked={formData.notifications.email}
                    onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
                    className="h-4 w-4 text-[#faa51a] focus:ring-[#faa51a] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive browser notifications</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="push-notifications"
                    checked={formData.notifications.push}
                    onChange={(e) => handleNestedChange('notifications', 'push', e.target.checked)}
                    className="h-4 w-4 text-[#faa51a] focus:ring-[#faa51a] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive text message updates</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="sms-notifications"
                    checked={formData.notifications.sms}
                    onChange={(e) => handleNestedChange('notifications', 'sms', e.target.checked)}
                    className="h-4 w-4 text-[#faa51a] focus:ring-[#faa51a] border-gray-300 rounded"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[#faa51a]" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription>
                Control your profile visibility and data sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="profile-visible">Profile Visibility</Label>
                      <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="profile-visible"
                    checked={formData.privacy.profileVisible}
                    onChange={(e) => handleNestedChange('privacy', 'profileVisible', e.target.checked)}
                    className="h-4 w-4 text-[#faa51a] focus:ring-[#faa51a] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="show-email">Show Email</Label>
                      <p className="text-sm text-gray-500">Display email address on your profile</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="show-email"
                    checked={formData.privacy.showEmail}
                    onChange={(e) => handleNestedChange('privacy', 'showEmail', e.target.checked)}
                    className="h-4 w-4 text-[#faa51a] focus:ring-[#faa51a] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="show-phone">Show Phone</Label>
                      <p className="text-sm text-gray-500">Display phone number on your profile</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="show-phone"
                    checked={formData.privacy.showPhone}
                    onChange={(e) => handleNestedChange('privacy', 'showPhone', e.target.checked)}
                    className="h-4 w-4 text-[#faa51a] focus:ring-[#faa51a] border-gray-300 rounded"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span>Account Actions</span>
              </CardTitle>
              <CardDescription>
                Manage your account security and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-semibold text-red-900">Sign Out</h4>
                  <p className="text-sm text-red-700">Sign out of your account on this device</p>
                </div>
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {editing && (
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#faa51a] hover:bg-[#faa51a]/90"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IndividualSettings


