-- Business Access Management System for Individual Users
-- This script creates tables for managing individual user access to businesses

-- 1. Business Invitations Table
CREATE TABLE IF NOT EXISTS business_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitation_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Business Individual Access Table (for accepted invitations)
CREATE TABLE IF NOT EXISTS business_individual_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitation_id UUID REFERENCES business_invitations(id) ON DELETE SET NULL,
    access_level VARCHAR(20) NOT NULL DEFAULT 'limited' CHECK (access_level IN ('limited', 'standard', 'full')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- 3. Business Access Permissions Table (page-level permissions)
CREATE TABLE IF NOT EXISTS business_access_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_individual_access_id UUID NOT NULL REFERENCES business_individual_access(id) ON DELETE CASCADE,
    page_name VARCHAR(100) NOT NULL,
    page_path VARCHAR(200) NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT false,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_individual_access_id, page_name)
);

-- 4. Business Page Templates Table (predefined page access templates)
CREATE TABLE IF NOT EXISTS business_page_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL,
    profession_type VARCHAR(100) NOT NULL,
    description TEXT,
    pages JSONB NOT NULL, -- Array of page objects with permissions
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default page templates for different professions
INSERT INTO business_page_templates (template_name, profession_type, description, pages) VALUES
('Accountant Access', 'accountant', 'Full access to financial and accounting features', 
 '[
   {"page_name": "Dashboard", "page_path": "/dashboard", "can_view": true, "can_edit": false, "can_delete": false},
   {"page_name": "Analytics", "page_path": "/analytics", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Reports", "page_path": "/reports", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Accounting", "page_path": "/accounting", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Payments", "page_path": "/payments", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Inventory", "page_path": "/inventory", "can_view": true, "can_edit": false, "can_delete": false}
 ]'::jsonb),

('Sales Manager Access', 'sales_manager', 'Access to sales and customer management features',
 '[
   {"page_name": "Dashboard", "page_path": "/dashboard", "can_view": true, "can_edit": false, "can_delete": false},
   {"page_name": "POS", "page_path": "/pos", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Customers", "page_path": "/customers", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Analytics", "page_path": "/analytics", "can_view": true, "can_edit": false, "can_delete": false},
   {"page_name": "Reports", "page_path": "/reports", "can_view": true, "can_edit": false, "can_delete": false},
   {"page_name": "Inventory", "page_path": "/inventory", "can_view": true, "can_edit": false, "can_delete": false}
 ]'::jsonb),

('Inventory Manager Access', 'inventory_manager', 'Access to inventory and stock management features',
 '[
   {"page_name": "Dashboard", "page_path": "/dashboard", "can_view": true, "can_edit": false, "can_delete": false},
   {"page_name": "Inventory", "page_path": "/inventory", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Commodity Registration", "page_path": "/commodity-registration", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Restock", "page_path": "/restock", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Analytics", "page_path": "/analytics", "can_view": true, "can_edit": false, "can_delete": false},
   {"page_name": "Reports", "page_path": "/reports", "can_view": true, "can_edit": false, "can_delete": false}
 ]'::jsonb),

('General Staff Access', 'general_staff', 'Basic access to essential business features',
 '[
   {"page_name": "Dashboard", "page_path": "/dashboard", "can_view": true, "can_edit": false, "can_delete": false},
   {"page_name": "POS", "page_path": "/pos", "can_view": true, "can_edit": true, "can_delete": false},
   {"page_name": "Inventory", "page_path": "/inventory", "can_view": true, "can_edit": false, "can_delete": false}
 ]'::jsonb);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_invitations_business_id ON business_invitations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_user_id ON business_invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);
CREATE INDEX IF NOT EXISTS idx_business_invitations_token ON business_invitations(invitation_token);

CREATE INDEX IF NOT EXISTS idx_business_individual_access_business_id ON business_individual_access(business_id);
CREATE INDEX IF NOT EXISTS idx_business_individual_access_user_id ON business_individual_access(user_id);
CREATE INDEX IF NOT EXISTS idx_business_individual_access_active ON business_individual_access(is_active);

CREATE INDEX IF NOT EXISTS idx_business_access_permissions_access_id ON business_access_permissions(business_individual_access_id);
CREATE INDEX IF NOT EXISTS idx_business_access_permissions_page ON business_access_permissions(page_name);

-- Enable RLS on all tables
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_individual_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_page_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_invitations
CREATE POLICY "Users can view their own invitations" ON business_invitations
    FOR SELECT USING (user_id = auth.uid() OR invited_by = auth.uid());

CREATE POLICY "Business owners can manage invitations" ON business_invitations
    FOR ALL USING (
        business_id IN (
            SELECT b.id FROM businesses b 
            JOIN business_memberships bm ON b.id = bm.business_id 
            WHERE bm.user_id = auth.uid() AND bm.role = 'owner'
        )
    );

-- RLS Policies for business_individual_access
CREATE POLICY "Users can view their own access" ON business_individual_access
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Business owners can manage access" ON business_individual_access
    FOR ALL USING (
        business_id IN (
            SELECT b.id FROM businesses b 
            JOIN business_memberships bm ON b.id = bm.business_id 
            WHERE bm.user_id = auth.uid() AND bm.role = 'owner'
        )
    );

-- RLS Policies for business_access_permissions
CREATE POLICY "Users can view their own permissions" ON business_access_permissions
    FOR SELECT USING (
        business_individual_access_id IN (
            SELECT id FROM business_individual_access 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can manage permissions" ON business_access_permissions
    FOR ALL USING (
        business_individual_access_id IN (
            SELECT bia.id FROM business_individual_access bia
            JOIN businesses b ON bia.business_id = b.id
            JOIN business_memberships bm ON b.id = bm.business_id 
            WHERE bm.user_id = auth.uid() AND bm.role = 'owner'
        )
    );

-- RLS Policies for business_page_templates
CREATE POLICY "All authenticated users can view templates" ON business_page_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to get individual user's accessible businesses
CREATE OR REPLACE FUNCTION get_individual_businesses(user_id_param UUID)
RETURNS TABLE (
    business_id UUID,
    business_name VARCHAR(255),
    business_description TEXT,
    access_level VARCHAR(20),
    granted_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as business_id,
        b.name as business_name,
        b.description as business_description,
        bia.access_level,
        bia.granted_at,
        bia.is_active
    FROM business_individual_access bia
    JOIN businesses b ON bia.business_id = b.id
    WHERE bia.user_id = user_id_param
    AND bia.is_active = true
    ORDER BY bia.granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's permissions for a specific business
CREATE OR REPLACE FUNCTION get_user_business_permissions(user_id_param UUID, business_id_param UUID)
RETURNS TABLE (
    page_name VARCHAR(100),
    page_path VARCHAR(200),
    can_view BOOLEAN,
    can_edit BOOLEAN,
    can_delete BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bap.page_name,
        bap.page_path,
        bap.can_view,
        bap.can_edit,
        bap.can_delete
    FROM business_access_permissions bap
    JOIN business_individual_access bia ON bap.business_individual_access_id = bia.id
    WHERE bia.user_id = user_id_param
    AND bia.business_id = business_id_param
    AND bia.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to apply template permissions to a user
CREATE OR REPLACE FUNCTION apply_template_permissions(
    access_id_param UUID,
    template_id_param UUID,
    granted_by_param UUID
)
RETURNS VOID AS $$
DECLARE
    page_item JSONB;
BEGIN
    -- Clear existing permissions
    DELETE FROM business_access_permissions 
    WHERE business_individual_access_id = access_id_param;
    
    -- Apply template permissions
    FOR page_item IN 
        SELECT jsonb_array_elements(pages) 
        FROM business_page_templates 
        WHERE id = template_id_param
    LOOP
        INSERT INTO business_access_permissions (
            business_individual_access_id,
            page_name,
            page_path,
            can_view,
            can_edit,
            can_delete,
            granted_by
        ) VALUES (
            access_id_param,
            page_item->>'page_name',
            page_item->>'page_path',
            (page_item->>'can_view')::BOOLEAN,
            (page_item->>'can_edit')::BOOLEAN,
            (page_item->>'can_delete')::BOOLEAN,
            granted_by_param
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Business Access Management System created successfully!' as status;
