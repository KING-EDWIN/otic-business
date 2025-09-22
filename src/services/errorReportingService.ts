import { supabase } from '@/lib/supabaseClient'

export interface SystemError {
  errorType: string
  errorMessage: string
  errorDetails?: any
  pageUrl?: string
  userAgent?: string
  browserInfo?: any
}

export interface ErrorReport {
  id: string
  user_id: string
  user_email: string
  error_type: string
  error_message: string
  error_details: any
  page_url: string
  user_agent: string
  browser_info: any
  timestamp: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  admin_notes?: string
  resolved_by?: string
  resolved_at?: string
}

class ErrorReportingService {
  /**
   * Log a system error to the database
   */
  async logSystemError(error: SystemError): Promise<string | null> {
    try {
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        timestamp: new Date().toISOString()
      }

      const { data, error: dbError } = await supabase.rpc('log_system_error', {
        p_error_type: error.errorType,
        p_error_message: error.errorMessage,
        p_error_details: error.errorDetails || {},
        p_page_url: error.pageUrl || window.location.href,
        p_user_agent: error.userAgent || navigator.userAgent,
        p_browser_info: error.browserInfo || browserInfo
      })

      if (dbError) {
        console.error('Failed to log system error:', dbError)
        return null
      }

      console.log('System error logged successfully:', data)
      return data
    } catch (error) {
      console.error('Error in logSystemError:', error)
      return null
    }
  }

  /**
   * Get system error reports (admin only)
   */
  async getErrorReports(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ErrorReport[]> {
    try {
      const { data, error } = await supabase.rpc('get_system_error_reports', {
        p_status: status,
        p_limit: limit,
        p_offset: offset
      })

      if (error) {
        console.error('Failed to get error reports:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getErrorReports:', error)
      return []
    }
  }

  /**
   * Update error report status (admin only)
   */
  async updateErrorReportStatus(
    logId: string,
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed',
    adminNotes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_error_report_status', {
        p_log_id: logId,
        p_status: status,
        p_admin_notes: adminNotes
      })

      if (error) {
        console.error('Failed to update error report status:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('Error in updateErrorReportStatus:', error)
      return false
    }
  }

  /**
   * Check if user has internet connection
   */
  isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer
    }
  }
}

export const errorReportingService = new ErrorReportingService()




