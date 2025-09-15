-- Update database schema for employee system and receipts
-- This script adds employee roles and receipt storage

-- Add user_type column to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'business' CHECK (user_type IN ('business', 'employee', 'individual'));

-- Add employee-specific columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT ARRAY['pos', 'inventory', 'accounting', 'customers'],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hired_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    business_id UUID REFERENCES businesses(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    employee_id UUID REFERENCES auth.users(id), -- Employee who made the sale
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'credit', 'mobile_money', 'card')),
    payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
    items JSONB NOT NULL, -- Array of sold items with details
    customer_info JSONB, -- Customer details if available
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipt_items table for detailed item tracking
CREATE TABLE IF NOT EXISTS receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_permissions table for granular access control
CREATE TABLE IF NOT EXISTS employee_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    permission VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(employee_id, permission)
);

-- Update business_invitations table to support employee invitations
ALTER TABLE business_invitations 
ADD COLUMN IF NOT EXISTS invitation_type VARCHAR(20) DEFAULT 'employee' CHECK (invitation_type IN ('employee', 'partner', 'admin')),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT ARRAY['pos', 'inventory', 'accounting', 'customers'];

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_business_id ON receipts(business_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_employee_permissions_employee_id ON employee_permissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_id ON user_profiles(business_id);

-- Enable RLS on new tables
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for receipts
CREATE POLICY "Users can view their business receipts" ON receipts
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses 
      WHERE owner_id = auth.uid() 
      OR id IN (
        SELECT business_id FROM business_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert receipts for their business" ON receipts
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses 
      WHERE owner_id = auth.uid() 
      OR id IN (
        SELECT business_id FROM business_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for receipt_items
CREATE POLICY "Users can view receipt items for their business" ON receipt_items
  FOR SELECT USING (
    receipt_id IN (
      SELECT id FROM receipts 
      WHERE business_id IN (
        SELECT id FROM businesses 
        WHERE owner_id = auth.uid() 
        OR id IN (
          SELECT business_id FROM business_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert receipt items for their business" ON receipt_items
  FOR INSERT WITH CHECK (
    receipt_id IN (
      SELECT id FROM receipts 
      WHERE business_id IN (
        SELECT id FROM businesses 
        WHERE owner_id = auth.uid() 
        OR id IN (
          SELECT business_id FROM business_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Create RLS policies for employee_permissions
CREATE POLICY "Users can view employee permissions for their business" ON employee_permissions
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage employee permissions" ON employee_permissions
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses 
      WHERE owner_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON receipts TO authenticated;
GRANT ALL ON receipt_items TO authenticated;
GRANT ALL ON employee_permissions TO authenticated;

-- Create function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    receipt_number TEXT;
    business_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    -- Get business prefix (first 3 letters of business name)
    SELECT UPPER(LEFT(name, 3)) INTO business_prefix
    FROM businesses 
    WHERE id = (SELECT business_id FROM user_profiles WHERE id = auth.uid());
    
    -- Get next sequence number for this business
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM receipts 
    WHERE business_id = (SELECT business_id FROM user_profiles WHERE id = auth.uid());
    
    -- Format: BIZ-YYYYMMDD-001
    receipt_number := business_prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN receipt_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to check employee permissions
CREATE OR REPLACE FUNCTION check_employee_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_type_val TEXT;
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Get user type
    SELECT user_type INTO user_type_val
    FROM user_profiles 
    WHERE id = auth.uid();
    
    -- Business owners have all permissions
    IF user_type_val = 'business' THEN
        RETURN TRUE;
    END IF;
    
    -- Check if employee has specific permission
    SELECT EXISTS(
        SELECT 1 FROM employee_permissions ep
        JOIN user_profiles up ON ep.employee_id = up.id
        WHERE ep.employee_id = auth.uid() 
        AND ep.permission = permission_name
        AND up.is_active = TRUE
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

SELECT 'Employee system and receipts schema updated successfully' as status;
