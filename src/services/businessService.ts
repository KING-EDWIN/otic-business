import { supabase } from '@/lib/supabase';

export interface Business {
  id: string;
  name: string;
  description?: string;
  business_type: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  registration_number?: string;
  currency: string;
  timezone: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface BusinessMembership {
  id: string;
  user_id: string;
  business_id: string;
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'viewer';
  permissions: Record<string, any>;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessInvitation {
  id: string;
  business_id: string;
  email: string;
  role: string;
  permissions: Record<string, any>;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessData {
  name: string;
  description?: string;
  business_type: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  registration_number?: string;
  currency?: string;
  timezone?: string;
  settings?: Record<string, any>;
}

class BusinessService {
  // Check if user can create businesses (Enterprise Advantage tier)
  async canCreateBusiness(userId: string): Promise<boolean> {
    try {
      // For now, just check the profile tier directly to avoid subscription complexity
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error checking user profile:', profileError);
        return false;
      }

      return profileData?.tier === 'enterprise_advantage';
    } catch (error) {
      console.error('Error checking business creation permission:', error);
      return false;
    }
  }

  // Get all businesses for a user
  async getUserBusinesses(userId: string): Promise<Business[]> {
    try {
      // Try the RPC function first
      const { data, error } = await supabase.rpc('get_user_businesses', {
        user_uuid: userId
      });
      
      if (error) {
        console.log('RPC function not available, using direct query...');
        // Fallback: get business IDs first, then fetch businesses
        const { data: membershipData, error: membershipError } = await supabase
          .from('business_memberships')
          .select('business_id')
          .eq('user_id', userId)
          .eq('status', 'active');

        if (membershipError) {
          console.error('Error fetching business memberships:', membershipError);
          return [];
        }

        if (!membershipData || membershipData.length === 0) {
          return [];
        }

        const businessIds = membershipData.map(m => m.business_id);
        
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .in('id', businessIds)
          .order('created_at', { ascending: false });

        if (businessError) {
          console.error('Error fetching businesses:', businessError);
          return [];
        }

        return businessData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user businesses:', error);
      return [];
    }
  }

  // Create a new business
  async createBusiness(businessData: CreateBusinessData, userId: string): Promise<Business | null> {
    try {
      // First check if user can create businesses
      const canCreate = await this.canCreateBusiness(userId);
      if (!canCreate) {
        throw new Error('You need Enterprise Advantage tier to create multiple businesses');
      }

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          created_by: userId,
          currency: businessData.currency || 'USD',
          timezone: businessData.timezone || 'UTC',
          settings: businessData.settings || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating business:', error);
        throw error;
      }

      // Create membership for the creator as owner
      await this.createBusinessMembership(data.id, userId, 'owner', {});

      return data;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }

  // Create business membership
  async createBusinessMembership(
    businessId: string, 
    userId: string, 
    role: string, 
    permissions: Record<string, any> = {}
  ): Promise<BusinessMembership | null> {
    try {
      const { data, error } = await supabase
        .from('business_memberships')
        .insert({
          business_id: businessId,
          user_id: userId,
          role,
          permissions,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating business membership:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating business membership:', error);
      throw error;
    }
  }

  // Get business details
  async getBusiness(businessId: string): Promise<Business | null> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) {
        console.error('Error fetching business:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching business:', error);
      return null;
    }
  }

  // Update business
  async updateBusiness(businessId: string, updates: Partial<CreateBusinessData>): Promise<Business | null> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', businessId)
        .select()
        .single();

      if (error) {
        console.error('Error updating business:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  }

  // Get business members
  async getBusinessMembers(businessId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_business_members', {
        business_uuid: businessId
      });
      
      if (error) {
        console.error('Error fetching business members:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching business members:', error);
      return [];
    }
  }

  // Invite user to business
  async inviteUserToBusiness(
    businessId: string,
    email: string,
    role: string,
    permissions: Record<string, any> = {},
    invitedBy: string
  ): Promise<BusinessInvitation | null> {
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data, error } = await supabase
        .from('business_invitations')
        .insert({
          business_id: businessId,
          email,
          role,
          permissions,
          token,
          invited_by: invitedBy,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating business invitation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating business invitation:', error);
      throw error;
    }
  }

  // Accept business invitation
  async acceptBusinessInvitation(token: string, userId: string): Promise<boolean> {
    try {
      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('business_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invitation) {
        throw new Error('Invalid or expired invitation');
      }

      // Check if invitation is still valid
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Create business membership
      await this.createBusinessMembership(
        invitation.business_id,
        userId,
        invitation.role,
        invitation.permissions
      );

      // Update invitation status
      await supabase
        .from('business_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      return true;
    } catch (error) {
      console.error('Error accepting business invitation:', error);
      throw error;
    }
  }

  // Switch business context
  async switchBusinessContext(businessId: string, userId: string): Promise<boolean> {
    try {
      // Verify user has access to this business
      const { data: membership, error } = await supabase
        .from('business_memberships')
        .select('id')
        .eq('business_id', businessId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !membership) {
        throw new Error('You do not have access to this business');
      }

      // Record the switch
      await supabase
        .from('business_switches')
        .insert({
          user_id: userId,
          business_id: businessId
        });

      return true;
    } catch (error) {
      console.error('Error switching business context:', error);
      throw error;
    }
  }

  // Delete business (only for owners)
  async deleteBusiness(businessId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is owner
      const { data: membership, error } = await supabase
        .from('business_memberships')
        .select('role')
        .eq('business_id', businessId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !membership || membership.role !== 'owner') {
        throw new Error('Only business owners can delete businesses');
      }

      // Delete business (cascade will handle memberships and invitations)
      const { error: deleteError } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  }

  // Get business statistics
  async getBusinessStats(businessId: string): Promise<Record<string, any>> {
    try {
      // Get member count
      const { count: memberCount } = await supabase
        .from('business_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'active');

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentSwitches } = await supabase
        .from('business_switches')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gte('switched_at', thirtyDaysAgo.toISOString());

      return {
        memberCount: memberCount || 0,
        recentActivity: recentSwitches || 0
      };
    } catch (error) {
      console.error('Error fetching business stats:', error);
      return { memberCount: 0, recentActivity: 0 };
    }
  }
}

export const businessService = new BusinessService();
