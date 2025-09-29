import { supabase } from '@/lib/supabaseClient'

export interface BusinessAccess {
  id: string
  business_id: string
  business_name: string
  business_type: string
  access_level: string
  invitation_type: string
  invitation_status: string
  granted_at: string
  created_at?: string
  permission_settings?: {
    pos: boolean
    inventory: boolean
    accounting: boolean
    payments: boolean
    customers: boolean
  }
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
        .from('individual_business_access')
        .select(`
          id,
          business_id,
          access_level,
          invitation_type,
          invitation_status,
          granted_at,
          created_at,
          permission_settings,
          business_signups!inner (
            id,
            business_name,
            company_name
          )
        `)
        .eq('individual_id', userId)
        .eq('invitation_status', 'accepted')
        .order('granted_at', { ascending: false })

      if (error) {
        console.error('Error fetching accessible businesses:', error)
        return []
      }

      return data?.map(item => ({
        id: item.id,
        business_id: item.business_id,
        business_name: item.business_signups?.business_name || item.business_signups?.company_name || 'Unknown Business',
        business_type: 'business',
        access_level: item.access_level,
        invitation_type: item.invitation_type,
        invitation_status: item.invitation_status,
        granted_at: item.granted_at,
        created_at: item.created_at
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
        business_name: item.businesses?.name || 'Unknown Business',
        invited_by_name: 'Business Owner',
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
        .from('individual_business_access')
        .insert({
          business_id: invitation.business_id,
          individual_id: userId,
          invitation_id: invitationId,
          access_level: 'manager',
          invitation_type: 'viewer',
          invitation_status: 'accepted'
        })

      if (accessError) {
        console.error('Error creating business access:', accessError)
        return { success: false, error: 'Failed to grant access' }
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('business_invitations')
        .update({
          status: 'accepted'
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
          status: 'declined'
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
        .from('individual_business_access')
        .update({ updated_at: new Date().toISOString() })
        .eq('business_id', businessId)
        .eq('individual_id', userId)
    } catch (error) {
      console.error('Error updating last accessed:', error)
    }
  }

  // Check if user has access to specific business pages
  static async hasPageAccess(businessId: string, userId: string, page: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('individual_business_access')
        .select('access_level, invitation_type')
        .eq('business_id', businessId)
        .eq('individual_id', userId)
        .eq('invitation_status', 'accepted')
        .single()

      if (error || !data) {
        return false
      }

      // Simple access check based on invitation_type
      return data.invitation_type === 'viewer' || data.invitation_type === 'manager'
    } catch (error) {
      console.error('Error checking page access:', error)
      return false
    }
  }
}

export default IndividualBusinessAccessService
