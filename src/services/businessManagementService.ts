import { supabase } from '@/lib/supabaseClient'

export interface Business {
  id: string
  name: string
  description?: string
  business_type: string
  industry?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  tax_id?: string
  registration_number?: string
  currency: string
  timezone: string
  logo_url?: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  settings: Record<string, any>
  created_at: string
  updated_at: string
  created_by: string
  user_role?: 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'
  joined_at?: string
}

export interface BusinessMember {
  id: string
  user_id: string
  email: string
  full_name?: string
  business_name?: string
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  joined_at: string
  invited_by?: string
}

export interface BusinessInvitation {
  id: string
  business_id: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'
  permissions: Record<string, any>
  invited_by: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  token: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface CreateBusinessData {
  name: string
  description?: string
  business_type: string
  industry?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  tax_id?: string
  registration_number?: string
  currency?: string
  timezone?: string
}

export class BusinessManagementService {
  // Get sub-businesses for the current user's main business
  async getSubBusinesses(): Promise<Business[]> {
    try {
      console.log('getSubBusinesses: Starting...')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('getSubBusinesses: Auth error:', userError)
        throw new Error('Authentication error: ' + userError.message)
      }
      
      if (!user) {
        console.error('getSubBusinesses: User not authenticated')
        throw new Error('User not authenticated')
      }

      console.log('getSubBusinesses: Getting main business for user:', user.id)
      
      // First get the main business
      const { data: mainBusiness, error: mainError } = await supabase.rpc('get_main_business', {
        user_id_param: user.id
      })

      if (mainError) {
        console.error('getSubBusinesses: Main business error:', mainError)
        throw new Error('Failed to get main business: ' + mainError.message)
      }

      if (!mainBusiness || mainBusiness.length === 0) {
        console.log('getSubBusinesses: No main business found')
        return []
      }

      const mainBusinessId = mainBusiness[0].business_id
      console.log('getSubBusinesses: Main business ID:', mainBusinessId)

      // Then get sub-businesses
      const { data, error } = await supabase.rpc('get_sub_businesses', {
        parent_business_id_param: mainBusinessId
      })

      if (error) {
        console.error('getSubBusinesses: Sub-businesses error:', error)
        throw new Error('Failed to get sub-businesses: ' + error.message)
      }

      console.log('getSubBusinesses: Found sub-businesses:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('getSubBusinesses: Error:', error)
      return []
    }
  }

  // Get all businesses for the current user (legacy method)
  async getUserBusinesses(): Promise<Business[]> {
    try {
      console.log('getUserBusinesses: Starting...')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('getUserBusinesses: Auth error:', userError)
        throw new Error('Authentication error: ' + userError.message)
      }
      
      if (!user) {
        console.error('getUserBusinesses: User not authenticated')
        throw new Error('User not authenticated')
      }

      console.log('getUserBusinesses: User authenticated:', user.id)
      
      // Direct query without timeout complexity
      const queryPromise = supabase
        .from('business_memberships')
        .select(`
          business_id,
          role,
          status,
          joined_at,
          businesses!inner (
            id,
            name,
            business_type,
            currency,
            timezone,
            created_at,
            updated_at,
            created_by
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false })

      const { data: directData, error: directError } = await queryPromise

      if (directError) {
        console.error('getUserBusinesses: Direct query failed:', directError)
        // Show user-friendly error for network issues
        if (directError.message.includes('Invalid API key') || directError.message.includes('Failed to fetch')) {
          console.error('Poor network connection - business query failed')
        }
        return []
      }

      // Transform direct query result to match Business interface
      const transformedData: Business[] = directData?.map(item => ({
        id: item.business_id,
        name: (item.businesses as any)?.name || '',
        business_type: (item.businesses as any)?.business_type || 'retail',
        currency: (item.businesses as any)?.currency || 'UGX',
        timezone: (item.businesses as any)?.timezone || 'Africa/Kampala',
        status: 'active' as const,
        settings: {},
        created_at: (item.businesses as any)?.created_at || new Date().toISOString(),
        updated_at: (item.businesses as any)?.updated_at || new Date().toISOString(),
        created_by: (item.businesses as any)?.created_by || '',
        user_role: item.role as any,
        joined_at: item.joined_at
      })) || []

      console.log('getUserBusinesses: Direct query returned:', transformedData.length, 'businesses')
      console.log('getUserBusinesses: Business names:', transformedData.map(b => b.name))
      return transformedData
    } catch (error) {
      console.error('getUserBusinesses: Error in getUserBusinesses:', error)
      console.error('getUserBusinesses: Error details:', error)
      return []
    }
  }

  // Create a new business
  async createBusiness(businessData: CreateBusinessData): Promise<{ success: boolean; business?: Business; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if user can create more businesses
      const { data: canCreate, error: canCreateError } = await supabase.rpc('can_create_business', {
        user_id_param: user.id
      })

      if (canCreateError) {
        console.error('Error checking business creation limit:', canCreateError)
        return { success: false, error: 'Failed to check business creation limit' }
      }

      if (!canCreate) {
        return { success: false, error: 'You have reached the maximum number of businesses for your tier' }
      }

      // Create the business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          created_by: user.id,
          currency: businessData.currency || 'UGX',
          timezone: businessData.timezone || 'Africa/Kampala',
          country: businessData.country || 'Uganda'
        })
        .select()
        .single()

      if (businessError) {
        console.error('Error creating business:', businessError)
        return { success: false, error: 'Failed to create business' }
      }

      // Add the creator as owner
      const { error: membershipError } = await supabase
        .from('business_memberships')
        .insert({
          user_id: user.id,
          business_id: business.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString()
        })

      if (membershipError) {
        console.error('Error creating business membership:', membershipError)
        // Don't fail the entire operation, just log the error
      }

      return { success: true, business }
    } catch (error) {
      console.error('Error in createBusiness:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Update a business
  async updateBusiness(businessId: string, updates: Partial<CreateBusinessData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)

      if (error) {
        console.error('Error updating business:', error)
        return { success: false, error: 'Failed to update business' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateBusiness:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Delete a business
  async deleteBusiness(businessId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // First check if user is the owner of this business
      const { data: membership, error: membershipError } = await supabase
        .from('business_memberships')
        .select('role')
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership) {
        return { success: false, error: 'You are not a member of this business' }
      }

      if (membership.role !== 'owner') {
        return { success: false, error: 'Only the business owner can delete the business' }
      }

      // Delete the business (this will cascade delete memberships due to foreign key constraints)
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId)

      if (error) {
        console.error('Error deleting business:', error)
        return { success: false, error: 'Failed to delete business: ' + error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in deleteBusiness:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get business members
  async getBusinessMembers(businessId: string): Promise<BusinessMember[]> {
    try {
      // Use separate queries to avoid foreign key relationship issues
      const { data: memberships, error: membershipsError } = await supabase
        .from('business_memberships')
        .select(`
          id,
          user_id,
          role,
          status,
          joined_at,
          invited_by
        `)
        .eq('business_id', businessId)
        .order('joined_at', { ascending: false })

      if (membershipsError) {
        console.error('Error fetching business memberships:', membershipsError)
        return []
      }

      if (!memberships || memberships.length === 0) {
        return []
      }

      // Get user profiles for all members
      const userIds = memberships.map(m => m.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, business_name')
        .in('id', userIds)

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError)
        // Return memberships without profile data
        return memberships.map(item => ({
          id: item.id,
          user_id: item.user_id,
          email: '',
          full_name: '',
          business_name: '',
          role: item.role as any,
          status: item.status as any,
          joined_at: item.joined_at,
          invited_by: item.invited_by
        }))
      }

      // Create a map of user profiles for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      // Transform the data to match BusinessMember interface
      const members: BusinessMember[] = memberships.map(item => {
        const profile = profileMap.get(item.user_id)
        return {
          id: item.id,
          user_id: item.user_id,
          email: profile?.email || '',
          full_name: profile?.full_name || '',
          business_name: profile?.business_name || '',
          role: item.role as any,
          status: item.status as any,
          joined_at: item.joined_at,
          invited_by: item.invited_by
        }
      })

      return members
    } catch (error) {
      console.error('Error in getBusinessMembers:', error)
      return []
    }
  }

  // Invite a user to a business as employee
  async inviteUserToBusiness(
    businessId: string, 
    email: string, 
    role: 'employee' = 'employee'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate invitation token
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Define employee permissions
      const permissions = ['pos', 'inventory', 'accounting', 'customers']

      const { error } = await supabase
        .from('business_invitations')
        .insert({
          business_id: businessId,
          invited_email: email,
          role: 'employee',
          invitation_type: 'employee',
          permissions,
          invited_by: user.id,
          invitation_token: token,
          expires_at: expiresAt.toISOString()
        })

      if (error) {
        console.error('Error creating invitation:', error)
        return { success: false, error: 'Failed to send invitation' }
      }

      // Create invitation notification
      await this.createInvitationNotification(businessId, email, role)

      // TODO: Send email invitation
      console.log(`Employee invitation sent to ${email} for business ${businessId}`)

      return { success: true }
    } catch (error) {
      console.error('Error in inviteUserToBusiness:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Accept business invitation
  async acceptInvitation(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('business_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single()

      if (fetchError || !invitation) {
        return { success: false, error: 'Invalid or expired invitation' }
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        return { success: false, error: 'Invitation has expired' }
      }

      // Create employee profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          user_type: 'employee',
          business_id: invitation.business_id,
          role: 'employee',
          permissions: invitation.permissions || ['pos', 'inventory', 'accounting', 'customers'],
          is_active: true,
          hired_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating employee profile:', profileError)
        return { success: false, error: 'Failed to create employee profile' }
      }

      // Create business membership
      const { error: membershipError } = await supabase
        .from('business_memberships')
        .insert({
          user_id: user.id,
          business_id: invitation.business_id,
          role: 'employee',
          status: 'active',
          invited_by: invitation.invited_by,
          joined_at: new Date().toISOString()
        })

      if (membershipError) {
        console.error('Error creating membership:', membershipError)
        return { success: false, error: 'Failed to join business' }
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('business_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

      if (updateError) {
        console.error('Error updating invitation:', updateError)
        // Don't fail the operation, just log the error
      }

      return { success: true }
    } catch (error) {
      console.error('Error in acceptInvitation:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Remove user from business
  async removeUserFromBusiness(
    businessId: string, 
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('business_memberships')
        .delete()
        .eq('business_id', businessId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error removing user from business:', error)
        return { success: false, error: 'Failed to remove user' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in removeUserFromBusiness:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Update user role in business
  async updateUserRole(
    businessId: string, 
    userId: string, 
    newRole: 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('business_memberships')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('business_id', businessId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return { success: false, error: 'Failed to update user role' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Switch business context
  async switchBusinessContext(businessId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('switchBusinessContext: Starting switch to business:', businessId)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('switchBusinessContext: Auth error:', userError)
        return { success: false, error: 'Authentication error' }
      }
      
      if (!user) {
        console.error('switchBusinessContext: User not authenticated')
        return { success: false, error: 'User not authenticated' }
      }

      console.log('switchBusinessContext: Calling RPC with user:', user.id, 'business:', businessId)

      const { data, error } = await supabase.rpc('switch_business_context', {
        user_id_param: user.id,
        business_id_param: businessId
      })

      if (error) {
        console.error('switchBusinessContext: RPC error:', error)
        console.error('switchBusinessContext: Error details:', error)
        return { success: false, error: 'Failed to switch business context: ' + error.message }
      }

      console.log('switchBusinessContext: RPC result:', data)

      if (!data) {
        return { success: false, error: 'You are not a member of this business' }
      }

      return { success: true }
    } catch (error) {
      console.error('switchBusinessContext: Unexpected error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get business settings
  async getBusinessSettings(businessId: string): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('setting_key, setting_value')
        .eq('business_id', businessId)

      if (error) {
        console.error('Error fetching business settings:', error)
        return {}
      }

      const settings: Record<string, any> = {}
      data?.forEach(item => {
        settings[item.setting_key] = item.setting_value
      })

      return settings
    } catch (error) {
      console.error('Error in getBusinessSettings:', error)
      return {}
    }
  }

  // Update business settings
  async updateBusinessSettings(
    businessId: string, 
    settings: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        business_id: businessId,
        setting_key: key,
        setting_value: value
      }))

      const { error } = await supabase
        .from('business_settings')
        .upsert(settingsArray)

      if (error) {
        console.error('Error updating business settings:', error)
        return { success: false, error: 'Failed to update settings' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateBusinessSettings:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Create invitation notification
  async createInvitationNotification(
    businessId: string, 
    email: string, 
    role: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase.rpc('create_invitation_notification', {
        business_id_param: businessId,
        user_id_param: user.id,
        invited_email_param: email,
        role_param: role
      })

      if (error) {
        console.error('Error creating invitation notification:', error)
        return { success: false, error: 'Failed to create notification' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in createInvitationNotification:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}

export const businessManagementService = new BusinessManagementService()


