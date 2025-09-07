-- Create email notification tables
-- Run this in your Supabase SQL Editor

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('invoice_reminder', 'low_stock', 'payment_received', 'subscription_expiry', 'welcome', 'report_ready')),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  invoice_reminders BOOLEAN DEFAULT true,
  low_stock_alerts BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  subscription_alerts BOOLEAN DEFAULT true,
  report_notifications BOOLEAN DEFAULT true,
  reminder_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Disable RLS temporarily for these tables
ALTER TABLE email_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings DISABLE ROW LEVEL SECURITY;

-- Insert default notification settings for demo user
INSERT INTO notification_settings (id, user_id, email_notifications, invoice_reminders, low_stock_alerts, payment_notifications, subscription_alerts, report_notifications, reminder_frequency)
VALUES (
  '00000000-0000-0000-0000-000000000200',
  '00000000-0000-0000-0000-000000000001',
  true,
  true,
  true,
  true,
  true,
  true,
  'weekly'
) ON CONFLICT (user_id) DO NOTHING;

-- Insert sample email notification
INSERT INTO email_notifications (id, user_id, type, recipient_email, subject, content, status, sent_at)
VALUES (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000001',
  'welcome',
  'demo@oticbusiness.com',
  'Welcome to Otic Business!',
  '<h2>Welcome to Otic Business!</h2><p>Thank you for joining us!</p>',
  'sent',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify data
SELECT 'EMAIL TABLES CREATED:' as info;
SELECT 'email_notifications' as table_name, COUNT(*) as count FROM email_notifications;
SELECT 'notification_settings' as table_name, COUNT(*) as count FROM notification_settings;
