import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

interface NetworkStatusIndicatorProps {
  className?: string
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowWarning(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowWarning(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for slow network responses
    const checkNetworkHealth = async () => {
      try {
        const start = Date.now()
        const response = await fetch('https://jvgiyscchxxekcbdicco.supabase.co/rest/v1/', {
          method: 'HEAD',
          mode: 'no-cors'
        })
        const duration = Date.now() - start
        
        if (duration > 5000) { // If response takes more than 5 seconds
          setShowWarning(true)
        }
      } catch (error) {
        setShowWarning(true)
      }
    }

    // Check network health every 30 seconds
    const interval = setInterval(checkNetworkHealth, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (!showWarning && isOnline) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${
        isOnline ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-red-100 text-red-800 border border-red-300'
      }`}>
        {isOnline ? (
          <>
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Slow connection detected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">No internet connection</span>
          </>
        )}
      </div>
    </div>
  )
}

export default NetworkStatusIndicator
