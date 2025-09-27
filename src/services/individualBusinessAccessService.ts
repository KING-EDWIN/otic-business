import { supabase } from '@/lib/supabaseClient'

export interface BusinessAccess {
  id: string
  business_id: string
  business_name: string
  business_type: string
  access_level: 'limited' | 'standard' | 'full'
  permissions: string[]
  is_active: boolean
  granted_at: string
  last_accessed?: string
}

export interface BusinessInvitation {
  id: string
  business_id: string
  business_name: string
  invited_by_name: string
  role: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  message?: string
  invited_at: string
  expires_at: string
}

export class IndividualBusinessAccessService {
  // Get all businesses the individual user has access to
  static async getAccessibleBusinesses(userId: string): Promise<BusinessAccess[]> {
    try {
      const { data, error } = await supabase
        .from('business_individual_access')
        .select(`
          id,
          business_id,
          access_level,
          permissions,
          is_active,
          granted_at,
          last_accessed,
          businesses!inner (
            id,
            name,
            business_type
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_accessed', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('Error fetching accessible businesses:', error)
        return []
      }

      return data?.map(item => ({
        id: item.id,
        business_id: item.business_id,
        business_name: item.businesses.name,
        business_type: item.businesses.business_type,
        access_level: item.access_level,
        permissions: item.permissions || [],
        is_active: item.is_active,
        granted_at: item.granted_at,
        last_accessed: item.last_accessed
      })) || []
    } catch (error) {
      console.error('Error in getAccessibleBusinesses:', error)
      return []
    }
  }

  // Get pending invitations for the user
  static async getPendingInvitations(userEmail: string): Promise<BusinessInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('business_invitations')
        .select(`
          id,
          business_id,
          role,
          status,
          message,
          invited_at,
          expires_at,
          businesses!inner (
            id,
            name
          ),
          invited_by_user:invited_by (
            id,
            email
          )
        `)
        .eq('invited_email', userEmail)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('invited_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending invitations:', error)
        return []
      }

      return data?.map(item => ({
        id: item.id,
        business_id: item.business_id,
        business_name: item.businesses.name,
        invited_by_name: item.invited_by_user?.email || 'Unknown',
        role: item.role,
        status: item.status,
        message: item.message,
        invited_at: item.invited_at,
        expires_at: item.expires_at
      })) || []
    } catch (error) {
      console.error('Error in getPendingInvitations:', error)
      return []
    }
  }

  // Accept a business invitation
  static async acceptInvitation(invitationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('business_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (invitationError || !invitation) {
        return { success: false, error: 'Invitation not found' }
      }

      // Check if invitation is still valid
      if (invitation.status !== 'pending' || new Date(invitation.expires_at) < new Date()) {
        return { success: false, error: 'Invitation has expired or is no longer valid' }
      }

      // Create business access record
      const { error: accessError } = await supabase
        .from('business_individual_access')
        .insert({
          business_id: invitation.business_id,
          user_id: userId,
          invitation_id: invitationId,
          access_level: 'standard',
          permissions: ['pos', 'inventory', 'accounting', 'payments', 'customers'],
          granted_by: invitation.invited_by
        })

      if (accessError) {
        console.error('Error creating business access:', accessError)
        return { success: false, error: 'Failed to grant access' }
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('business_invitations')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)

      if (updateError) {
        console.error('Error updating invitation status:', updateError)
        // Don't fail the whole operation for this
      }

      return { success: true }
    } catch (error) {
      console.error('Error in acceptInvitation:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Decline a business invitation
  static async declineInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('business_invitations')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)

      if (error) {
        console.error('Error declining invitation:', error)
        return { success: false, error: 'Failed to decline invitation' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in declineInvitation:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Update last accessed time for a business
  static async updateLastAccessed(businessId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('business_individual_access')
        .update({ last_accessed: new Date().toISOString() })
        .eq('business_id', businessId)
        .eq('user_id', userId)
    } catch (error) {
      console.error('Error updating last accessed:', error)
    }
  }

  // Check if user has access to specific business pages
  static async hasPageAccess(businessId: string, userId: string, page: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('business_individual_access')
        .select('permissions')
        .eq('business_id', businessId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return false
      }

      return data.permissions?.includes(page) || false
    } catch (error) {
      console.error('Error checking page access:', error)
      return false
    }
  }
}

export default IndividualBusinessAccessService
