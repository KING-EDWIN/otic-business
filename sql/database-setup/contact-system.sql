-- Contact Messages Table
-- This table stores contact form submissions from the website

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  response_sent BOOLEAN DEFAULT FALSE,
  response_content TEXT,
  response_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to view their own contact messages
CREATE POLICY "Users can view their own contact messages" ON contact_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert contact messages
CREATE POLICY "Anyone can create contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Allow maintenance admins to view all contact messages
-- This bypasses RLS for admin portal access (maintenance team)
CREATE POLICY "Maintenance admins can view all contact messages" ON contact_messages
  FOR SELECT USING (true);

-- Allow maintenance admins to update contact messages  
CREATE POLICY "Maintenance admins can update contact messages" ON contact_messages
  FOR UPDATE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Insert some sample data for testing
INSERT INTO contact_messages (name, email, subject, message, status) VALUES
('John Doe', 'john@example.com', 'Question about pricing', 'Hi, I would like to know more about your pricing plans.', 'new'),
('Jane Smith', 'jane@example.com', 'Technical support needed', 'I am having trouble with the POS system.', 'in_progress'),
('Mike Johnson', 'mike@example.com', 'Feature request', 'Can you add barcode scanning to the mobile app?', 'new');

-- Create a view for admin dashboard
CREATE OR REPLACE VIEW contact_messages_admin AS
SELECT 
  cm.*,
  up.business_name,
  up.full_name as user_name,
  up.email as user_email,
  CASE 
    WHEN cm.created_at > NOW() - INTERVAL '1 hour' THEN 'Just now'
    WHEN cm.created_at > NOW() - INTERVAL '1 day' THEN 'Today'
    WHEN cm.created_at > NOW() - INTERVAL '7 days' THEN 'This week'
    ELSE 'Older'
  END as time_category
FROM contact_messages cm
LEFT JOIN user_profiles up ON cm.user_id = up.id
ORDER BY cm.created_at DESC;

-- Grant permissions
GRANT SELECT ON contact_messages_admin TO authenticated;
GRANT ALL ON contact_messages TO authenticated;
