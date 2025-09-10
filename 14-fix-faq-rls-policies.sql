-- Fix FAQ System RLS Policies
-- This file fixes the RLS policies to allow public access to FAQ data

-- Drop existing policies
DROP POLICY IF EXISTS "FAQ categories are viewable by everyone" ON faq_categories;
DROP POLICY IF EXISTS "FAQ questions are viewable by everyone" ON faq_questions;
DROP POLICY IF EXISTS "Users can insert their own search logs" ON faq_search_logs;
DROP POLICY IF EXISTS "Admins can manage FAQ categories" ON faq_categories;
DROP POLICY IF EXISTS "Admins can manage FAQ questions" ON faq_questions;

-- Create new policies that allow public access to FAQ data
-- FAQ categories are public (no authentication required)
CREATE POLICY "FAQ categories are publicly viewable" ON faq_categories
    FOR SELECT USING (true);

-- FAQ questions are public (no authentication required)
CREATE POLICY "FAQ questions are publicly viewable" ON faq_questions
    FOR SELECT USING (is_active = true);

-- Search logs require authentication but are permissive
CREATE POLICY "Authenticated users can insert search logs" ON faq_search_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin policies for management (only for specific admin emails)
CREATE POLICY "Admins can manage FAQ categories" ON faq_categories
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email IN ('admin@oticbusiness.com', 'admin@otic.com')
        )
    );

CREATE POLICY "Admins can manage FAQ questions" ON faq_questions
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email IN ('admin@oticbusiness.com', 'admin@otic.com')
        )
    );

-- Grant public access to FAQ tables
GRANT SELECT ON faq_categories TO anon;
GRANT SELECT ON faq_questions TO anon;
GRANT SELECT ON faq_categories TO authenticated;
GRANT SELECT ON faq_questions TO authenticated;
GRANT INSERT ON faq_search_logs TO authenticated;
GRANT ALL ON faq_categories TO authenticated;
GRANT ALL ON faq_questions TO authenticated;
