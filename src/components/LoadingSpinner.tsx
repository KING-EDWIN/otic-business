import React from 'react'

interface LoadingSpinnerProps {
  context?: 'auth' | 'dashboard' | 'business' | 'individual' | 'data' | 'general'
  message?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  context = 'general', 
  message, 
  className = '' 
}) => {
  return (
    <div className={`min-h-screen bg-white flex items-center justify-center ${className}`}>
      <div className="text-center">
        {/* Otic Logo with Pulse Animation */}
        <div className="flex justify-center mb-8">
          <img 
            src="/Layer 2.png" 
            alt="Otic Business Logo" 
            className="h-20 md:h-24 w-auto object-contain animate-pulse opacity-60"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
        
        {/* Loading Text */}
        <p className="text-gray-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner