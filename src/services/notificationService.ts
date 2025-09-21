import { supabase } from '@/lib/supabaseClient'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success' | 'invitation' | 'low_stock' | 'payment' | 'sale' | 'expense' | 'tax'
  priority: 'low' | 'medium' | 'high' | 'critical'
  is_read: boolean
  action_url?: string
  created_at: string
  read_at?: string
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  id: string
  notification_type: string
  enabled: boolean
  email_enabled: boolean
  push_enabled: boolean
}

export class NotificationService {
  // Get unread notification count
  static async getUnreadCount(businessId?: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return 0

      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_id: user.id,
        p_business_id: businessId || null
      })

      if (error) {
        console.error('Error getting unread count:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error in getUnreadCount:', error)
      return 0
    }
  }

  // Get recent notifications
  static async getRecentNotifications(businessId?: string, limit: number = 10): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase.rpc('get_recent_notifications', {
        p_user_id: user.id,
        p_business_id: businessId || null,
        p_limit: limit
      })

      if (error) {
        console.error('Error getting recent notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getRecentNotifications:', error)
      return []
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_user_id: user.id
      })

      if (error) {
        console.error('Error marking notification as read:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Error in markAsRead:', error)
      return false
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(businessId?: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return 0

      const { data, error } = await supabase.rpc('mark_all_notifications_read', {
        p_user_id: user.id,
        p_business_id: businessId || null
      })

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
      return 0
    }
  }

  // Create notification (for system use)
  static async createNotification(
    businessId: string,
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    priority: Notification['priority'] = 'medium',
    actionUrl?: string,
    metadata?: Record<string, any>,
    expiresAt?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_business_id: businessId,
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_type: type,
        p_priority: priority,
        p_action_url: actionUrl || null,
        p_metadata: metadata || {},
        p_expires_at: expiresAt || null
      })

      if (error) {
        console.error('Error creating notification:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createNotification:', error)
      return null
    }
  }

  // Create sale notification
  static async createSaleNotification(
    businessId: string,
    userId: string,
    saleAmount: number,
    paymentMethod: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_sale_notification', {
        p_business_id: businessId,
        p_user_id: userId,
        p_sale_amount: saleAmount,
        p_payment_method: paymentMethod
      })

      if (error) {
        console.error('Error creating sale notification:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createSaleNotification:', error)
      return null
    }
  }

  // Create invitation notification
  static async createInvitationNotification(
    businessId: string,
    invitedEmail: string,
    role: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_invitation_notification', {
        p_business_id: businessId,
        p_invited_email: invitedEmail,
        p_role: role
      })

      if (error) {
        console.error('Error creating invitation notification:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createInvitationNotification:', error)
      return null
    }
  }

  // Check for low stock notifications
  static async checkLowStockNotifications(businessId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('check_low_stock_notifications', {
        p_business_id: businessId
      })

      if (error) {
        console.error('Error checking low stock notifications:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error in checkLowStockNotifications:', error)
      return 0
    }
  }

  // Get notification preferences
  static async getPreferences(businessId?: string): Promise<NotificationPreferences[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      let query = supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)

      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error getting notification preferences:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getPreferences:', error)
      return []
    }
  }

  // Update notification preferences
  static async updatePreferences(
    notificationType: string,
    enabled: boolean,
    emailEnabled: boolean = false,
    pushEnabled: boolean = true,
    businessId?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          business_id: businessId || null,
          notification_type: notificationType,
          enabled,
          email_enabled: emailEnabled,
          push_enabled: pushEnabled,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating notification preferences:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updatePreferences:', error)
      return false
    }
  }

  // Get notification icon color based on priority
  static getPriorityColor(priority: Notification['priority']): string {
    switch (priority) {
      case 'critical':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-blue-500'
      case 'low':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  // Get notification icon based on type
  static getTypeIcon(type: Notification['type']): string {
    switch (type) {
      case 'low_stock':
        return '📦'
      case 'sale':
        return '💰'
      case 'payment':
        return '💳'
      case 'invitation':
        return '👥'
      case 'expense':
        return '📊'
      case 'tax':
        return '🧾'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'success':
        return '✅'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  // Format notification time
  static formatTime(createdAt: string): string {
    const now = new Date()
    const notificationTime = new Date(createdAt)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    }
  }
}


