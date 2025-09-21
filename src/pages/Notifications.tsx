import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Check, Filter, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { NotificationService, Notification, NotificationPreferences } from '@/services/notificationService'
import BusinessLoginStatus from '@/components/BusinessLoginStatus'
import { toast } from 'sonner'

const Notifications: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { currentBusiness } = useBusinessManagement()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user || !currentBusiness) return

    setLoading(true)
    try {
      const [recentNotifications, count] = await Promise.all([
        NotificationService.getRecentNotifications(currentBusiness.id, 50),
        NotificationService.getUnreadCount(currentBusiness.id)
      ])
      
      setNotifications(recentNotifications)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [user, currentBusiness])

  // Load preferences
  const loadPreferences = useCallback(async () => {
    if (!user || !currentBusiness) return

    try {
      const prefs = await NotificationService.getPreferences(currentBusiness.id)
      setPreferences(prefs)
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }, [user, currentBusiness])

  // Load data on mount
  useEffect(() => {
    loadNotifications()
    loadPreferences()
  }, [loadNotifications, loadPreferences])

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.is_read) return false
    if (activeTab === 'read' && !notification.is_read) return false
    if (filterType !== 'all' && notification.type !== filterType) return false
    return true
  })

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await NotificationService.markAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    if (notification.action_url) {
      navigate(notification.action_url)
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!currentBusiness) return

    const markedCount = await NotificationService.markAllAsRead(currentBusiness.id)
    if (markedCount > 0) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
      toast.success(`Marked ${markedCount} notifications as read`)
    }
  }

  // Handle preference update
  const handlePreferenceUpdate = async (
    notificationType: string,
    enabled: boolean,
    emailEnabled: boolean = false,
    pushEnabled: boolean = true
  ) => {
    if (!currentBusiness) return

    const success = await NotificationService.updatePreferences(
      notificationType,
      enabled,
      emailEnabled,
      pushEnabled,
      currentBusiness.id
    )

    if (success) {
      setPreferences(prev => 
        prev.map(p => 
          p.notification_type === notificationType 
            ? { ...p, enabled, email_enabled: emailEnabled, push_enabled: pushEnabled }
            : p
        )
      )
      toast.success('Preferences updated')
    } else {
      toast.error('Failed to update preferences')
    }
  }

  // Get notification type options
  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'sale', label: 'Sales' },
    { value: 'payment', label: 'Payments' },
    { value: 'invitation', label: 'Invitations' },
    { value: 'expense', label: 'Expenses' },
    { value: 'tax', label: 'Tax' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warnings' },
    { value: 'error', label: 'Errors' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center space-x-2 text-gray-600 hover:text-[#040458]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <img src="/Otic icon@2x.png" alt="Otic Business Logo" className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-sm text-gray-500">
                    {currentBusiness?.name || 'Business'} • {unreadCount} unread
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <BusinessLoginStatus />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mark all read</span>
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onNotificationClick={handleNotificationClick}
              />
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onNotificationClick={handleNotificationClick}
              />
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              <NotificationList 
                notifications={filteredNotifications}
                loading={loading}
                onNotificationClick={handleNotificationClick}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <NotificationSettings 
                preferences={preferences}
                onPreferenceUpdate={handlePreferenceUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

// Notification List Component
interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  onNotificationClick: (notification: Notification) => void
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  loading, 
  onNotificationClick 
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500 text-center">
            You're all caught up! New notifications will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => (
        <Card 
          key={notification.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            !notification.is_read ? 'ring-2 ring-blue-100 bg-blue-50' : ''
          }`}
          onClick={() => onNotificationClick(notification)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <span className="text-2xl">
                  {NotificationService.getTypeIcon(notification.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-medium ${
                    !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notification.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={notification.priority === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.priority}
                    </Badge>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {NotificationService.formatTime(notification.created_at)}
                  </p>
                  {notification.action_url && (
                    <span className="text-xs text-blue-600 hover:text-blue-700">
                      View details →
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Notification Settings Component
interface NotificationSettingsProps {
  preferences: NotificationPreferences[]
  onPreferenceUpdate: (type: string, enabled: boolean, emailEnabled: boolean, pushEnabled: boolean) => void
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  preferences, 
  onPreferenceUpdate 
}) => {
  const notificationTypes = [
    { type: 'low_stock', label: 'Low Stock Alerts', description: 'Get notified when products are running low' },
    { type: 'sale', label: 'Sales Notifications', description: 'Get notified about completed sales' },
    { type: 'payment', label: 'Payment Alerts', description: 'Get notified about payment activities' },
    { type: 'invitation', label: 'Invitation Updates', description: 'Get notified about employee invitations' },
    { type: 'expense', label: 'Expense Alerts', description: 'Get notified about significant expenses' },
    { type: 'tax', label: 'Tax Reminders', description: 'Get notified about tax-related deadlines' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Notification Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationTypes.map(({ type, label, description }) => {
          const preference = preferences.find(p => p.notification_type === type)
          const enabled = preference?.enabled ?? true
          const emailEnabled = preference?.email_enabled ?? false
          const pushEnabled = preference?.push_enabled ?? true

          return (
            <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{label}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant={enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPreferenceUpdate(type, !enabled, emailEnabled, pushEnabled)}
                >
                  {enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default Notifications


