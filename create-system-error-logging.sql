-- Create system troubleshooting logs table
-- This table will store error reports from users when real-time data fails to load

-- Create the system_troubleshoot_logs table
CREATE TABLE IF NOT EXISTS public.system_troubleshoot_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB DEFAULT '{}'::jsonb,
    page_url TEXT,
    user_agent TEXT,
    browser_info JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_troubleshoot_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own error reports
CREATE POLICY "Users can report their own errors" ON public.system_troubleshoot_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Users can view their own error reports
CREATE POLICY "Users can view their own error reports" ON public.system_troubleshoot_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Policy: Admins can view all error reports
CREATE POLICY "Admins can view all error reports" ON public.system_troubleshoot_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_auth 
        WHERE id = auth.uid()
    )
);

-- Policy: Admins can update error reports
CREATE POLICY "Admins can update error reports" ON public.system_troubleshoot_logs
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_auth 
        WHERE id = auth.uid()
    )
);

-- Create function to log system errors
CREATE OR REPLACE FUNCTION public.log_system_error(
    p_error_type TEXT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT '{}'::jsonb,
    p_page_url TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_browser_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    -- Get current user info
    current_user_id := auth.uid();
    
    -- Get user email if available
    SELECT email INTO current_user_email 
    FROM public.user_profiles 
    WHERE id = current_user_id;
    
    -- Insert error log
    INSERT INTO public.system_troubleshoot_logs (
        user_id,
        user_email,
        error_type,
        error_message,
        error_details,
        page_url,
        user_agent,
        browser_info
    ) VALUES (
        current_user_id,
        current_user_email,
        p_error_type,
        p_error_message,
        p_error_details,
        p_page_url,
        p_user_agent,
        p_browser_info
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for admins to get error reports
CREATE OR REPLACE FUNCTION public.get_system_error_reports(
    p_status TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_email TEXT,
    error_type TEXT,
    error_message TEXT,
    error_details JSONB,
    page_url TEXT,
    user_agent TEXT,
    browser_info JSONB,
    timestamp TIMESTAMP WITH TIME ZONE,
    status TEXT,
    admin_notes TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_auth 
        WHERE id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    RETURN QUERY
    SELECT 
        stl.id,
        stl.user_id,
        stl.user_email,
        stl.error_type,
        stl.error_message,
        stl.error_details,
        stl.page_url,
        stl.user_agent,
        stl.browser_info,
        stl.timestamp,
        stl.status,
        stl.admin_notes,
        stl.resolved_by,
        stl.resolved_at
    FROM public.system_troubleshoot_logs stl
    WHERE (p_status IS NULL OR stl.status = p_status)
    ORDER BY stl.timestamp DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for admins to update error report status
CREATE OR REPLACE FUNCTION public.update_error_report_status(
    p_log_id UUID,
    p_status TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_auth 
        WHERE id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Update the error report
    UPDATE public.system_troubleshoot_logs
    SET 
        status = p_status,
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        resolved_by = CASE WHEN p_status = 'resolved' THEN auth.uid() ELSE resolved_by END,
        resolved_at = CASE WHEN p_status = 'resolved' THEN now() ELSE resolved_at END,
        updated_at = now()
    WHERE id = p_log_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_system_troubleshoot_logs_user_id ON public.system_troubleshoot_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_troubleshoot_logs_timestamp ON public.system_troubleshoot_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_troubleshoot_logs_status ON public.system_troubleshoot_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_troubleshoot_logs_error_type ON public.system_troubleshoot_logs(error_type);



