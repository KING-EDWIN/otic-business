import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, MessageSquareText, CheckCircle } from 'lucide-react'
import { errorReportingService } from '@/services/errorReportingService'

interface SystemErrorPopupProps {
  isOpen: boolean
  onClose: () => void
  error: {
    type: string
    message: string
    details?: any
  }
}

const SystemErrorPopup: React.FC<SystemErrorPopupProps> = ({
  isOpen,
  onClose,
  error
}) => {
  const [isReporting, setIsReporting] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  const handleReportError = async () => {
    if (!errorReportingService.isOnline()) {
      alert('No internet connection. Please check your connection and try again.')
      return
    }

    setIsReporting(true)
    try {
      const logId = await errorReportingService.logSystemError({
        errorType: error.type,
        errorMessage: error.message,
        errorDetails: error.details,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        browserInfo: errorReportingService.getBrowserInfo()
      })

      if (logId) {
        setReportSent(true)
        console.log('Error report sent successfully:', logId)
      } else {
        alert('Failed to send error report. Please try again.')
      }
    } catch (error) {
      console.error('Error reporting failed:', error)
      alert('Failed to send error report. Please try again.')
    } finally {
      setIsReporting(false)
    }
  }

  const handleRetry = () => {
    onClose()
    window.location.reload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#040458] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span>Otic Business</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Failed to Fetch Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                This is a system issue. We're unable to load real-time data from our servers.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Error Details:</p>
            <p className="text-sm font-mono text-gray-700 break-words">
              {error.message}
            </p>
          </div>

          {reportSent ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Error report sent successfully!</span>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleReportError}
                disabled={isReporting || !errorReportingService.isOnline()}
                className="w-full bg-[#040458] hover:bg-[#faa51a] text-white"
              >
                {isReporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending Report...
                  </>
                ) : (
                  <>
                    <MessageSquareText className="h-4 w-4 mr-2" />
                    Report This Issue
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Our technical team will investigate this issue and contact you if needed.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SystemErrorPopup



