import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Users, 
  Search, 
  ArrowLeft,
  Settings,
  CheckCircle,
  XCircle,
  Save,
  Shield,
  UserCheck,
  Mail,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

interface IndividualAccess {
  id: string
  individual_id: string
  business_id: string
  invitation_type: 'viewer' | 'manager'
  access_level: string
  invitation_status: string
  granted_at: string
  permission_settings?: {
    pos: boolean
    inventory: boolean
    accounting: boolean
    payments: boolean
    customers: boolean
  }
  individual_email: string
  individual_name: string
}

interface PermissionSettings {
  pos: boolean
  inventory: boolean
  accounting: boolean
  payments: boolean
  customers: boolean
}

const BusinessMembers: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [individuals, setIndividuals] = useState<IndividualAccess[]>([])
  const [permissions, setPermissions] = useState<Record<string, PermissionSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (businessId) {
      loadIndividualAccess()
    }
  }, [businessId])

  const loadIndividualAccess = async () => {
    try {
      setLoading(true)
      
      // Get all individuals with access to this business
      const { data, error } = await supabase
        .from('individual_business_access')
        .select(`
          id,
          individual_id,
          business_id,
          invitation_type,
          access_level,
          invitation_status,
          granted_at,
          permission_settings
        `)
        .eq('business_id', businessId)
        .eq('invitation_status', 'accepted')

      if (error) {
        console.error('Error loading individual access:', error)
        toast.error('Failed to load individual access')
        return
      }

      // Get user details for each individual
      const individualsWithDetails: IndividualAccess[] = []
      
      for (const access of data) {
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('email, full_name')
          .eq('id', access.individual_id)
          .single()

        if (!profileError && userProfile) {
          individualsWithDetails.push({
            ...access,
            individual_email: userProfile.email,
            individual_name: userProfile.full_name || 'Individual User'
          })
        }
      }

      setIndividuals(individualsWithDetails)

      // Load current permissions for each individual
      const permissionData: Record<string, PermissionSettings> = {}
      individualsWithDetails.forEach(individual => {
        permissionData[individual.individual_id] = individual.permission_settings || getDefaultPermissions(individual.invitation_type)
      })
      setPermissions(permissionData)

    } catch (error) {
      console.error('Error loading individual access:', error)
      toast.error('Failed to load individual access')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPermissions = (invitationType: string): PermissionSettings => {
    if (invitationType === 'manager') {
      return {
        pos: true,
        inventory: true,
        accounting: true,
        payments: true,
        customers: true
      }
    } else {
      return {
        pos: true,
        inventory: false,
        accounting: false,
        payments: false,
        customers: false
      }
    }
  }

  const handlePermissionChange = (individualId: string, permission: keyof PermissionSettings, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [individualId]: {
        ...prev[individualId],
        [permission]: checked
      }
    }))
  }

  const savePermissions = async (individualId: string) => {
    try {
      setSaving(individualId)
      
      const individualPermissions = permissions[individualId]
      
      // Update the individual_business_access record with permission details
      const { error } = await supabase
        .from('individual_business_access')
        .update({
          permission_settings: individualPermissions,
          updated_at: new Date().toISOString()
        })
        .eq('individual_id', individualId)
        .eq('business_id', businessId)

      if (error) {
        console.error('Error saving permissions:', error)
        toast.error('Failed to save permissions')
        return
      }

      toast.success('Permissions updated successfully!')
      
    } catch (error) {
      console.error('Error saving permissions:', error)
      toast.error('Failed to save permissions')
    } finally {
      setSaving(null)
    }
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'pos': return '🛒'
      case 'inventory': return '📦'
      case 'accounting': return '💰'
      case 'payments': return '💳'
      case 'customers': return '👥'
      default: return '📋'
    }
  }

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'pos': return 'Point of Sale'
      case 'inventory': return 'Inventory Management'
      case 'accounting': return 'Accounting'
      case 'payments': return 'Payments'
      case 'customers': return 'Customer Management'
      default: return permission
    }
  }

  const filteredIndividuals = individuals.filter(individual =>
    individual.individual_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    individual.individual_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const totalMembers = individuals.length
  const managers = individuals.filter(i => i.invitation_type === 'manager').length
  const viewers = individuals.filter(i => i.invitation_type === 'viewer').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040458] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/business-management')}
                className="text-gray-600 hover:text-[#040458]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#040458]/10 rounded-lg">
                  <Users className="h-6 w-6 text-[#040458]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                  <p className="text-gray-600">Manage access and permissions for your team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-gray-900">{managers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Eye className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Viewers</p>
                  <p className="text-2xl font-bold text-gray-900">{viewers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage roles and permissions for team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredIndividuals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
                <p className="text-gray-600 mb-4">
                  You haven't invited any individuals to your business yet.
                </p>
                <Button onClick={() => navigate('/business-management')}>
                  Manage Invitations
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredIndividuals.map((individual) => (
                  <Card key={individual.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#040458]/10 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-[#040458]" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{individual.individual_name}</CardTitle>
                            <CardDescription>{individual.individual_email}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={individual.invitation_type === 'manager' ? 'default' : 'secondary'}>
                            {individual.invitation_type}
                          </Badge>
                          <Badge variant="outline">
                            {individual.access_level}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <Settings className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">Access Permissions</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(['pos', 'inventory', 'accounting', 'payments', 'customers'] as const).map((permission) => (
                            <div key={permission} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                              <Checkbox
                                id={`${individual.individual_id}-${permission}`}
                                checked={permissions[individual.individual_id]?.[permission] || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(individual.individual_id, permission, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`${individual.individual_id}-${permission}`}
                                className="flex items-center space-x-2 cursor-pointer text-gray-900"
                              >
                                <span className="text-lg">{getPermissionIcon(permission)}</span>
                                <span className="text-sm font-medium">{getPermissionLabel(permission)}</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                        
                        {individual.invitation_type === 'viewer' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Viewer Access</span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                              This user has viewer access. You can grant additional permissions by checking the boxes above.
                            </p>
                          </div>
                        )}
                        
                        {individual.invitation_type === 'manager' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Manager Access</span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                              This user has manager access with full permissions to all business modules.
                            </p>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Joined: {new Date(individual.granted_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => savePermissions(individual.individual_id)}
                            disabled={saving === individual.individual_id}
                            className="bg-[#040458] hover:bg-[#030345] text-white"
                          >
                            {saving === individual.individual_id ? (
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BusinessMembers