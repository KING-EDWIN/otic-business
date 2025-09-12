import { supabase } from '@/lib/supabase'

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
  // Get all businesses for the current user
  async getUserBusinesses(): Promise<Business[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        throw new Error('User not authenticated')
      }

      console.log('Calling get_user_businesses RPC for user:', user.id)
      const { data, error } = await supabase.rpc('get_user_businesses', {
        user_id_param: user.id
      })

      if (error) {
        console.error('Error fetching user businesses:', error)
        return []
      }

      console.log('RPC get_user_businesses returned:', data?.length || 0, 'businesses')
      return data || []
    } catch (error) {
      console.error('Error in getUserBusinesses:', error)
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
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId)

      if (error) {
        console.error('Error deleting business:', error)
        return { success: false, error: 'Failed to delete business' }
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
      const { data, error } = await supabase.rpc('get_business_members', {
        business_id_param: businessId
      })

      if (error) {
        console.error('Error fetching business members:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getBusinessMembers:', error)
      return []
    }
  }

  // Invite a user to a business
  async inviteUserToBusiness(
    businessId: string, 
    email: string, 
    role: 'admin' | 'manager' | 'employee' | 'viewer'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate invitation token
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const { error } = await supabase
        .from('business_invitations')
        .insert({
          business_id: businessId,
          email,
          role,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString()
        })

      if (error) {
        console.error('Error creating invitation:', error)
        return { success: false, error: 'Failed to send invitation' }
      }

      // TODO: Send email invitation
      console.log(`Invitation sent to ${email} for business ${businessId}`)

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
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      if (fetchError || !invitation) {
        return { success: false, error: 'Invalid or expired invitation' }
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        return { success: false, error: 'Invitation has expired' }
      }

      // Create business membership
      const { error: membershipError } = await supabase
        .from('business_memberships')
        .insert({
          user_id: user.id,
          business_id: invitation.business_id,
          role: invitation.role,
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase.rpc('switch_business_context', {
        user_id_param: user.id,
        business_id_param: businessId
      })

      if (error) {
        console.error('Error switching business context:', error)
        return { success: false, error: 'Failed to switch business context' }
      }

      if (!data) {
        return { success: false, error: 'You are not a member of this business' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in switchBusinessContext:', error)
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
}

export const businessManagementService = new BusinessManagementService()
