import { supabase } from '@/lib/supabase'

export interface AdminUser {
  user_id: string
  role: 'super_admin' | 'admin'
  last_login_at?: string | null
  created_at?: string
}

export interface AdminLogEntry {
  id?: string
  admin_user_id: string
  action: string
  metadata?: Record<string, any>
  created_at?: string
}

export class AdminService {
  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    return Boolean(data?.user_id)
  }

  async touchLastLogin(userId: string): Promise<void> {
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', userId)
  }

  async logAction(adminUserId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: adminUserId,
        action,
        metadata: metadata || null
      })
  }

  async resendEmailConfirmation(email: string): Promise<{ error?: any }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/signin` }
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }
}

export const adminService = new AdminService()


