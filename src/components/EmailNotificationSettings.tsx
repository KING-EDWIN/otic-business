import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Mail, Bell, Settings, CheckCircle, XCircle, Clock } from 'lucide-react'
import { emailService, NotificationSettings, EmailNotification } from '@/services/emailService'

interface EmailNotificationSettingsProps {
  userId: string
}

export const EmailNotificationSettings: React.FC<EmailNotificationSettingsProps> = ({ userId }) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [emailHistory, setEmailHistory] = useState<EmailNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
    loadEmailHistory()
  }, [userId])

  const loadSettings = async () => {
    try {
      const data = await emailService.getNotificationSettings(userId)
      setSettings(data)
    } catch (error) {
      console.error('Error loading notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmailHistory = async () => {
    try {
      const data = await emailService.getEmailHistory(userId, 20)
      setEmailHistory(data)
    } catch (error) {
      console.error('Error loading email history:', error)
    }
  }

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    if (!settings) return

    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    try {
      setSaving(true)
      await emailService.updateNotificationSettings(userId, { [key]: value })
    } catch (error) {
      console.error('Error updating setting:', error)
      // Revert on error
      setSettings(settings)
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500">Sent</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'invoice_reminder':
        return 'Invoice Reminder'
      case 'low_stock':
        return 'Low Stock Alert'
      case 'payment_received':
        return 'Payment Confirmation'
      case 'subscription_expiry':
        return 'Subscription Expiry'
      case 'welcome':
        return 'Welcome Email'
      case 'report_ready':
        return 'Report Ready'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Notification Settings
          </CardTitle>
          <CardDescription>
            Configure when and how you receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable all email notifications
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings?.email_notifications || false}
              onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          {/* Individual Notification Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Types</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="invoice-reminders" className="text-sm">
                    Invoice Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get reminded about overdue invoices
                  </p>
                </div>
                <Switch
                  id="invoice-reminders"
                  checked={settings?.invoice_reminders || false}
                  onCheckedChange={(checked) => updateSetting('invoice_reminders', checked)}
                  disabled={saving || !settings?.email_notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="low-stock-alerts" className="text-sm">
                    Low Stock Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when products are running low
                  </p>
                </div>
                <Switch
                  id="low-stock-alerts"
                  checked={settings?.low_stock_alerts || false}
                  onCheckedChange={(checked) => updateSetting('low_stock_alerts', checked)}
                  disabled={saving || !settings?.email_notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-notifications" className="text-sm">
                    Payment Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when payments are received
                  </p>
                </div>
                <Switch
                  id="payment-notifications"
                  checked={settings?.payment_notifications || false}
                  onCheckedChange={(checked) => updateSetting('payment_notifications', checked)}
                  disabled={saving || !settings?.email_notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="subscription-alerts" className="text-sm">
                    Subscription Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about subscription changes
                  </p>
                </div>
                <Switch
                  id="subscription-alerts"
                  checked={settings?.subscription_alerts || false}
                  onCheckedChange={(checked) => updateSetting('subscription_alerts', checked)}
                  disabled={saving || !settings?.email_notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="report-notifications" className="text-sm">
                    Report Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when reports are ready
                  </p>
                </div>
                <Switch
                  id="report-notifications"
                  checked={settings?.report_notifications || false}
                  onCheckedChange={(checked) => updateSetting('report_notifications', checked)}
                  disabled={saving || !settings?.email_notifications}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Reminder Frequency */}
          <div className="space-y-2">
            <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
            <Select
              value={settings?.reminder_frequency || 'weekly'}
              onValueChange={(value) => updateSetting('reminder_frequency', value)}
              disabled={saving || !settings?.email_notifications}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often to send reminder emails
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email History
          </CardTitle>
          <CardDescription>
            Recent email notifications sent to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailHistory.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No email notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emailHistory.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(email.status)}
                    <div>
                      <p className="font-medium">{getTypeLabel(email.type)}</p>
                      <p className="text-sm text-muted-foreground">{email.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        To: {email.recipient_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(email.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(email.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Test Email Notifications
          </CardTitle>
          <CardDescription>
            Send a test email to verify your settings are working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              // In a real app, this would send a test email
              alert('Test email would be sent to your registered email address')
            }}
            disabled={!settings?.email_notifications}
          >
            Send Test Email
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
