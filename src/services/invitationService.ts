import { supabase } from '@/lib/supabaseClient'

export interface BusinessInvitation {
  id: string
  business_id: string
  business_name: string
  invited_email: string
  invited_by_name: string
  role: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  message?: string
  expires_at: string
  created_at: string
}

export interface InvitationResponse {
  success: boolean
  invitation_updated: boolean
  member_added: boolean
}

export class InvitationService {
  // Get all pending invitations for a user
  static async getUserInvitations(userEmail: string): Promise<BusinessInvitation[]> {
    try {
      // Check if we have a valid session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('No valid session for invitations:', sessionError)
        return []
      }

      const { data, error } = await supabase.rpc('get_user_invitations', {
        user_email_param: userEmail
      })

      if (error) {
        console.error('Error fetching user invitations:', error)
        
        // If it's a 401 error, the session might be invalid
        if (error.status === 401 || error.message?.includes('401')) {
          console.log('401 error in invitations - session may be invalid')
          await supabase.auth.signOut()
        }
        
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserInvitations:', error)
      return []
    }
  }

  // Respond to an invitation (accept or decline)
  static async respondToInvitation(
    invitationId: string, 
    response: 'accepted' | 'declined',
    userId: string
  ): Promise<InvitationResponse | null> {
    try {
      const { data, error } = await supabase.rpc('respond_to_invitation', {
        invitation_id_param: invitationId,
        response_param: response,
        user_id_param: userId
      })

      if (error) {
        console.error('Error responding to invitation:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in respondToInvitation:', error)
      return null
    }
  }

  // Create a new invitation
  static async createInvitation(
    businessId: string,
    invitedEmail: string,
    role: string = 'member',
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('business_invitations')
        .insert({
          business_id: businessId,
          invited_email: invitedEmail,
          invited_by: user.id,
          role,
          message
        })

      if (error) {
        console.error('Error creating invitation:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in createInvitation:', error)
      return { success: false, error: 'Failed to create invitation' }
    }
  }
}

export default InvitationService
