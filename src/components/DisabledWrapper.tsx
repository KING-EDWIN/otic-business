import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Mail } from 'lucide-react'

interface DisabledWrapperProps {
  children: React.ReactNode
  tooltipText?: string
  className?: string
}

const DisabledWrapper: React.FC<DisabledWrapperProps> = ({ 
  children, 
  tooltipText = "Please verify your email to access this feature",
  className = ""
}) => {
  const { user } = useAuth()
  
  // Check if email is verified
  const isEmailVerified = user?.email_confirmed_at !== null

  if (isEmailVerified) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative ${className}`}>
            {/* Disabled overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 rounded-md" />
            
            {/* Disabled content */}
            <div className="opacity-50 pointer-events-none">
              {children}
            </div>
            
            {/* Verification icon */}
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-orange-100 rounded-full p-1">
                <Mail className="h-3 w-3 text-orange-600" />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default DisabledWrapper
