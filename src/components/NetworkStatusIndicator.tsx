import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { getSupabaseConfig } from '@/lib/supabaseClient'

interface NetworkStatusIndicatorProps {
  className?: string
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Disable automatic network health check to prevent false positives
    // Only rely on browser's online/offline events

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg bg-red-100 text-red-800 border border-red-300">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">No internet connection</span>
      </div>
    </div>
  )
}

export default NetworkStatusIndicator
