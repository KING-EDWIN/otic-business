import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MobileIconProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const MobileIcon: React.FC<MobileIconProps> = ({ 
  icon: Icon, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 sm:h-5 sm:w-5',
    md: 'h-5 w-5 sm:h-6 sm:w-6',
    lg: 'h-6 w-6 sm:h-8 sm:w-8'
  }

  return (
    <Icon 
      className={`${sizeClasses[size]} ${className}`}
    />
  )
}
