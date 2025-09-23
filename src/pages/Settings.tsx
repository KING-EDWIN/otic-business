import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Bell, 
  Shield, 
  CreditCard,
  Users,
  Globe,
  ArrowLeft,
  Smartphone,
  Mail,
  MapPin,
  Phone,
  Trash2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

const Settings = () => {
  const { user, profile, updateProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    address: '',
    email: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    low_stock: true,
    sales_alerts: true,
    weekly_reports: true
  })
  const [security, setSecurity] = useState({
    two_factor: false,
    session_timeout: '30',
    login_alerts: true
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        email: profile.email || ''
      })
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const { error } = await updateProfile(formData)
      if (error) throw error
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion')
      return
    }

    setDeleting(true)
    try {
      // First, delete all related data
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user?.id)

      if (profileError) throw profileError

      // Then delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '')

      if (authError) throw authError

      toast.success('Account deleted successfully')
      navigate('/')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error(error.message || 'Failed to delete account')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setDeleteConfirmation('')
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
    toast.success('Notification preferences updated')
  }

  const handleSecurityChange = (key: string, value: any) => {
    setSecurity(prev => ({ ...prev, [key]: value }))
    toast.success('Security settings updated')
  }

  // Debug logging
  console.log('Settings component rendering, profile:', profile)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-[#faa51a] to-[#ff6b35] rounded-xl shadow-lg">
                <SettingsIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#040458] to-[#1e40af] bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Manage your account and business preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">

        <Tabs defaultValue="profile" className="space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            <TabsList className="bg-transparent border-0">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="business"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Business
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="billing"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Billing
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#040458] data-[state=active]:to-[#1e40af] data-[state=active]:text-white text-[#040458] font-semibold rounded-lg transition-all duration-200"
              >
                Account
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        placeholder="+256 700 000 000"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={loading}
                  className="bg-[#faa51a] hover:bg-[#040458] text-white"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Business Information</span>
                </CardTitle>
                <CardDescription>
                  Manage your business details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                    placeholder="Enter your business name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="pl-10"
                      placeholder="Enter your business address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select defaultValue="retail">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail Store</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="supermarket">Supermarket</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select defaultValue="UGX">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UGX">Ugandan Shilling (UGX)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={loading}
                  className="bg-[#faa51a] hover:bg-[#040458] text-white"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(value) => handleNotificationChange('email', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(value) => handleNotificationChange('sms', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(value) => handleNotificationChange('push', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                    </div>
                    <Switch
                      checked={notifications.low_stock}
                      onCheckedChange={(value) => handleNotificationChange('low_stock', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sales Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about daily sales performance</p>
                    </div>
                    <Switch
                      checked={notifications.sales_alerts}
                      onCheckedChange={(value) => handleNotificationChange('sales_alerts', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly business performance reports</p>
                    </div>
                    <Switch
                      checked={notifications.weekly_reports}
                      onCheckedChange={(value) => handleNotificationChange('weekly_reports', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={security.two_factor}
                      onCheckedChange={(value) => handleSecurityChange('two_factor', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout</Label>
                    <Select value={security.session_timeout} onValueChange={(value) => handleSecurityChange('session_timeout', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="0">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Automatically log out after inactivity</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                    </div>
                    <Switch
                      checked={security.login_alerts}
                      onCheckedChange={(value) => handleSecurityChange('login_alerts', value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Change Password</h4>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pr-10"
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
                      <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword}
                      disabled={changingPassword || !newPassword || !confirmPassword}
                      className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
                    >
                      {changingPassword ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Update Password</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Billing & Subscription</span>
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile?.tier?.toUpperCase()} Plan - UGX {profile?.tier === 'basic' ? '1,000,000' : profile?.tier === 'standard' ? '2,000,000' : '5,000,000'} per month
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span>Account Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your account data and deletion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> Account deletion is permanent and cannot be undone. 
                    All your business data, transactions, and settings will be permanently deleted.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-4">
                      This action will permanently delete your account and all associated data. 
                      This cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Delete Account</span>
              </CardTitle>
              <CardDescription>
                This action cannot be undone. All your data will be permanently deleted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Warning:</strong> This will delete:
                  <ul className="mt-2 list-disc list-inside text-sm">
                    <li>Your business profile and settings</li>
                    <li>All transaction history</li>
                    <li>Customer data</li>
                    <li>Inventory records</li>
                    <li>All other business data</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirmation">
                  Type <strong>DELETE</strong> to confirm:
                </Label>
                <Input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE here"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmation('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation !== 'DELETE'}
                  className="flex-1"
                >
                  {deleting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Settings


