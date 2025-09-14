// Email Notification Service
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUserInfo, hasFeatureAccess } from '@/utils/userUtils'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  text: string
}

export interface EmailNotification {
  id: string
  user_id: string
  type: 'invoice_reminder' | 'low_stock' | 'payment_received' | 'subscription_expiry' | 'welcome' | 'report_ready'
  recipient_email: string
  subject: string
  content: string
  status: 'pending' | 'sent' | 'failed'
  sent_at?: string
  created_at: string
}

export interface NotificationSettings {
  user_id: string
  email_notifications: boolean
  invoice_reminders: boolean
  low_stock_alerts: boolean
  payment_notifications: boolean
  subscription_alerts: boolean
  report_notifications: boolean
  reminder_frequency: 'daily' | 'weekly' | 'monthly'
}

export class EmailService {
  private templates: EmailTemplate[] = [
    {
      id: 'invoice_reminder',
      name: 'Invoice Reminder',
      subject: 'Invoice Reminder - Payment Due Soon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #040458;">Invoice Reminder</h2>
          <p>Dear {{customer_name}},</p>
          <p>This is a friendly reminder that your invoice <strong>{{invoice_number}}</strong> is due on {{due_date}}.</p>
          <p><strong>Amount Due:</strong> {{amount}} {{currency}}</p>
          <p>Please ensure payment is made by the due date to avoid any late fees.</p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>{{business_name}}</p>
        </div>
      `,
      text: `Invoice Reminder\n\nDear {{customer_name}},\n\nThis is a friendly reminder that your invoice {{invoice_number}} is due on {{due_date}}.\n\nAmount Due: {{amount}} {{currency}}\n\nPlease ensure payment is made by the due date to avoid any late fees.\n\nThank you for your business!\n\nBest regards,\n{{business_name}}`
    },
    {
      id: 'low_stock',
      name: 'Low Stock Alert',
      subject: 'Low Stock Alert - {{product_name}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #faa51a;">Low Stock Alert</h2>
          <p>Dear {{user_name}},</p>
          <p>The following product is running low on stock:</p>
          <ul>
            <li><strong>{{product_name}}</strong> - Current stock: {{current_stock}} (Reorder level: {{reorder_level}})</li>
          </ul>
          <p>Please consider restocking this item to avoid stockouts.</p>
          <p>Best regards,<br>Otic Business System</p>
        </div>
      `,
      text: `Low Stock Alert\n\nDear {{user_name}},\n\nThe following product is running low on stock:\n\n- {{product_name}} - Current stock: {{current_stock}} (Reorder level: {{reorder_level}})\n\nPlease consider restocking this item to avoid stockouts.\n\nBest regards,\nOtic Business System`
    },
    {
      id: 'payment_received',
      name: 'Payment Received',
      subject: 'Payment Received - {{invoice_number}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Payment Received</h2>
          <p>Dear {{customer_name}},</p>
          <p>We have received your payment for invoice <strong>{{invoice_number}}</strong>.</p>
          <p><strong>Amount Paid:</strong> {{amount}} {{currency}}</p>
          <p><strong>Payment Date:</strong> {{payment_date}}</p>
          <p>Thank you for your prompt payment!</p>
          <p>Best regards,<br>{{business_name}}</p>
        </div>
      `,
      text: `Payment Received\n\nDear {{customer_name}},\n\nWe have received your payment for invoice {{invoice_number}}.\n\nAmount Paid: {{amount}} {{currency}}\nPayment Date: {{payment_date}}\n\nThank you for your prompt payment!\n\nBest regards,\n{{business_name}}`
    },
    {
      id: 'subscription_expiry',
      name: 'Subscription Expiry',
      subject: 'Subscription Expiring Soon - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Subscription Expiring Soon</h2>
          <p>Dear {{user_name}},</p>
          <p>Your {{subscription_plan}} subscription will expire on {{expiry_date}}.</p>
          <p>To continue using all features, please renew your subscription before the expiry date.</p>
          <p><a href="{{renewal_link}}" style="background-color: #040458; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Now</a></p>
          <p>Best regards,<br>Otic Business Team</p>
        </div>
      `,
      text: `Subscription Expiring Soon\n\nDear {{user_name}},\n\nYour {{subscription_plan}} subscription will expire on {{expiry_date}}.\n\nTo continue using all features, please renew your subscription before the expiry date.\n\nRenewal link: {{renewal_link}}\n\nBest regards,\nOtic Business Team`
    },
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to Otic Business!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #040458;">Welcome to Otic Business!</h2>
          <p>Dear {{user_name}},</p>
          <p>Welcome to Otic Business! We're excited to help you manage your business more effectively.</p>
          <p>Your account has been successfully created and you can now access all features of your {{subscription_plan}} plan.</p>
          <p>Here are some quick tips to get started:</p>
          <ul>
            <li>Set up your products in the Inventory section</li>
            <li>Configure your POS settings</li>
            <li>Add your first customers</li>
            <li>Explore the Analytics dashboard</li>
          </ul>
          <p>If you have any questions, don't hesitate to contact our support team.</p>
          <p>Best regards,<br>Otic Business Team</p>
        </div>
      `,
      text: `Welcome to Otic Business!\n\nDear {{user_name}},\n\nWelcome to Otic Business! We're excited to help you manage your business more effectively.\n\nYour account has been successfully created and you can now access all features of your {{subscription_plan}} plan.\n\nHere are some quick tips to get started:\n- Set up your products in the Inventory section\n- Configure your POS settings\n- Add your first customers\n- Explore the Analytics dashboard\n\nIf you have any questions, don't hesitate to contact our support team.\n\nBest regards,\nOtic Business Team`
    },
    {
      id: 'report_ready',
      name: 'Report Ready',
      subject: 'Your {{report_type}} Report is Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #040458;">Report Ready</h2>
          <p>Dear {{user_name}},</p>
          <p>Your {{report_type}} report for the period {{start_date}} to {{end_date}} is ready for download.</p>
          <p><a href="{{download_link}}" style="background-color: #040458; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Report</a></p>
          <p>Best regards,<br>Otic Business Team</p>
        </div>
      `,
      text: `Report Ready\n\nDear {{user_name}},\n\nYour {{report_type}} report for the period {{start_date}} to {{end_date}} is ready for download.\n\nDownload link: {{download_link}}\n\nBest regards,\nOtic Business Team`
    }
  ]

  async sendEmail(
    recipientEmail: string,
    templateId: string,
    variables: Record<string, string>,
    userId?: string
  ): Promise<boolean> {
    try {
      // Get current user info if userId not provided
      let currentUserId = userId
      if (!currentUserId) {
        const userInfo = await getCurrentUserInfo()
        if (!userInfo) {
          console.error('User not authenticated')
          return false
        }
        currentUserId = userInfo.id
      }

      // Check if user has access to email notifications
      const userInfo = await getCurrentUserInfo()
      if (userInfo && !hasFeatureAccess(userInfo.tier, 'standard')) {
        console.error('Email notifications require Standard tier or higher')
        return false
      }

      const template = this.templates.find(t => t.id === templateId)
      if (!template) {
        console.error('Email template not found:', templateId)
        return false
      }

      // Replace variables in template
      const subject = this.replaceVariables(template.subject, variables)
      const htmlContent = this.replaceVariables(template.html, variables)
      const textContent = this.replaceVariables(template.text, variables)

      // Create notification record
      const notification: Omit<EmailNotification, 'id' | 'created_at'> = {
        user_id: currentUserId,
        type: templateId as any,
        recipient_email: recipientEmail,
        subject,
        content: htmlContent,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('email_notifications')
        .insert([notification])
        .select()
        .single()

      if (error) {
        console.error('Error creating email notification:', error)
        return false
      }

      // In a real application, you would integrate with an email service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Nodemailer with SMTP
      
      // For demo purposes, we'll simulate sending
      console.log('📧 Email would be sent:', {
        to: recipientEmail,
        subject,
        template: templateId,
        variables
      })

      // Update notification status to sent
      await supabase
        .from('email_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', data.id)

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  async sendInvoiceReminder(invoiceId: string, userId: string): Promise<boolean> {
    try {
      // Get invoice data
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(name, email)
        `)
        .eq('id', invoiceId)
        .single()

      if (error || !invoice) {
        console.error('Error fetching invoice:', error)
        return false
      }

      const variables = {
        customer_name: invoice.customers?.name || 'Valued Customer',
        invoice_number: invoice.invoice_number,
        due_date: new Date(invoice.due_date).toLocaleDateString(),
        amount: new Intl.NumberFormat('en-UG', {
          style: 'currency',
          currency: 'UGX'
        }).format(invoice.total),
        currency: invoice.currency_code,
        business_name: 'Otic Business'
      }

      return await this.sendEmail(
        invoice.customers?.email || 'customer@example.com',
        'invoice_reminder',
        variables,
        userId
      )
    } catch (error) {
      console.error('Error sending invoice reminder:', error)
      return false
    }
  }

  async sendLowStockAlert(productId: string, userId: string): Promise<boolean> {
    try {
      // Get product data
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error || !product) {
        console.error('Error fetching product:', error)
        return false
      }

      // Get user data
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (userError || !user) {
        console.error('Error fetching user:', userError)
        return false
      }

      const variables = {
        user_name: user.full_name || 'User',
        product_name: product.name,
        current_stock: product.stock_quantity.toString(),
        reorder_level: product.reorder_level.toString()
      }

      return await this.sendEmail(
        user.email,
        'low_stock',
        variables,
        userId
      )
    } catch (error) {
      console.error('Error sending low stock alert:', error)
      return false
    }
  }

  async sendPaymentConfirmation(paymentId: string, userId: string): Promise<boolean> {
    try {
      // Get payment and invoice data
      const { data: payment, error } = await supabase
        .from('payments')
        .select(`
          *,
          user_subscriptions(
            invoices(
              *,
              customers(name, email)
            )
          )
        `)
        .eq('id', paymentId)
        .single()

      if (error || !payment) {
        console.error('Error fetching payment:', error)
        return false
      }

      const variables = {
        customer_name: 'Valued Customer', // This would come from invoice data
        invoice_number: 'INV-001', // This would come from invoice data
        amount: new Intl.NumberFormat('en-UG', {
          style: 'currency',
          currency: 'UGX'
        }).format(payment.amount),
        currency: payment.currency,
        payment_date: new Date(payment.created_at).toLocaleDateString(),
        business_name: 'Otic Business'
      }

      return await this.sendEmail(
        'customer@example.com', // This would come from invoice data
        'payment_received',
        variables,
        userId
      )
    } catch (error) {
      console.error('Error sending payment confirmation:', error)
      return false
    }
  }

  async sendSubscriptionExpiryAlert(userId: string): Promise<boolean> {
    try {
      // Get subscription data
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error || !subscription) {
        console.error('Error fetching subscription:', error)
        return false
      }

      // Get user data
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (userError || !user) {
        console.error('Error fetching user:', userError)
        return false
      }

      const variables = {
        user_name: user.full_name || 'User',
        subscription_plan: subscription.tier_id,
        expiry_date: new Date(subscription.end_date).toLocaleDateString(),
        renewal_link: `${window.location.origin}/subscription`
      }

      return await this.sendEmail(
        user.email,
        'subscription_expiry',
        variables,
        userId
      )
    } catch (error) {
      console.error('Error sending subscription expiry alert:', error)
      return false
    }
  }

  async sendWelcomeEmail(userId: string, subscriptionPlan: string): Promise<boolean> {
    try {
      // Get user data
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !user) {
        console.error('Error fetching user:', error)
        return false
      }

      const variables = {
        user_name: user.full_name || 'User',
        subscription_plan: subscriptionPlan
      }

      return await this.sendEmail(
        user.email,
        'welcome',
        variables,
        userId
      )
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return false
    }
  }

  async sendReportReadyNotification(
    userId: string,
    reportType: string,
    startDate: string,
    endDate: string,
    downloadLink: string
  ): Promise<boolean> {
    try {
      // Get user data
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !user) {
        console.error('Error fetching user:', error)
        return false
      }

      const variables = {
        user_name: user.full_name || 'User',
        report_type: reportType,
        start_date: new Date(startDate).toLocaleDateString(),
        end_date: new Date(endDate).toLocaleDateString(),
        download_link: downloadLink
      }

      return await this.sendEmail(
        user.email,
        'report_ready',
        variables,
        userId
      )
    } catch (error) {
      console.error('Error sending report ready notification:', error)
      return false
    }
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    })
    return result
  }

  async getNotificationSettings(userId?: string): Promise<NotificationSettings | null> {
    // Get current user info if userId not provided
    let currentUserId = userId
    if (!currentUserId) {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        console.error('User not authenticated')
        return null
      }
      currentUserId = userInfo.id
    }
    
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      console.error('Error fetching notification settings:', error)
      return null
    }

    return data
  }

  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<boolean> {
    try {
      // Get current user info if userId not provided
      let currentUserId = userId
      if (!currentUserId) {
        const userInfo = await getCurrentUserInfo()
        if (!userInfo) {
          console.error('User not authenticated')
          return false
        }
        currentUserId = userInfo.id
      }
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert([{ user_id: currentUserId, ...settings }])

      if (error) {
        console.error('Error updating notification settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating notification settings:', error)
      return false
    }
  }

  async getEmailHistory(userId: string, limit: number = 50): Promise<EmailNotification[]> {
    // Use the known demo user ID for now
    const demoUserId = '00000000-0000-0000-0000-000000000001'
    
    const { data, error } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('user_id', demoUserId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching email history:', error)
      return []
    }

    return data || []
  }
}

export const emailService = new EmailService()
