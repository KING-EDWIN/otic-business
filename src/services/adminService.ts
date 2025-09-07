import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  email: string
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
  async authenticateAdmin(email: string, password: string): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        return { success: false, error: 'Invalid credentials' }
      }

      const isValidPassword = await bcrypt.compare(password, data.password_hash)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Update last login
      await this.touchLastLogin(data.id)

      return { success: true, admin: data }
    } catch (error) {
      return { success: false, error: 'Authentication failed' }
    }
  }

  async touchLastLogin(adminId: string): Promise<void> {
    await supabase
      .from('admin_auth')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminId)
  }

  async logAction(adminId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: adminId,
        action,
        metadata: metadata || null
      })
  }

  async resendEmailConfirmation(email: string): Promise<{ error?: any }> {
    try {
      // For now, just log the action - implement actual email sending later
      console.log(`Email resend requested for: ${email}`)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}

export const adminService = new AdminService()


