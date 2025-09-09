import React from 'react'

// Mobile-specific optimizations and utilities
export const MobileOptimizations = {
  // Responsive grid classes
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3 xl:grid-cols-4'
  },
  
  // Responsive text sizes
  text: {
    mobile: 'text-sm',
    tablet: 'md:text-base',
    desktop: 'lg:text-lg'
  },
  
  // Responsive spacing
  spacing: {
    mobile: 'p-4',
    tablet: 'md:p-6',
    desktop: 'lg:p-8'
  },
  
  // Responsive card heights
  cardHeight: {
    mobile: 'h-32',
    tablet: 'md:h-40',
    desktop: 'lg:h-48'
  }
}

// Hook for detecting mobile devices
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  
  return isMobile
}

// Hook for detecting tablet devices
export const useIsTablet = () => {
  const [isTablet, setIsTablet] = React.useState(false)
  
  React.useEffect(() => {
    const checkIsTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    
    checkIsTablet()
    window.addEventListener('resize', checkIsTablet)
    
    return () => window.removeEventListener('resize', checkIsTablet)
  }, [])
  
  return isTablet
}

// Responsive container component
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

// Mobile-friendly button component
export const MobileButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-[#040458] text-white hover:bg-[#030345] focus:ring-[#040458]',
    secondary: 'bg-[#faa51a] text-white hover:bg-[#e6940a] focus:ring-[#faa51a]',
    outline: 'border-2 border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white focus:ring-[#040458]'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  )
}

// Mobile-friendly card component
export const MobileCard: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
}> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl shadow-lg p-4 md:p-6 ${
        onClick ? 'cursor-pointer hover:shadow-xl transition-shadow duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

// Mobile-friendly skeleton component
export const MobileSkeleton: React.FC<{
  height?: string
  className?: string
}> = ({ height = 'h-4', className = '' }) => {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${height} ${className}`}></div>
  )
}

// Mobile navigation component
export const MobileNav: React.FC<{
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}> = ({ isOpen, onClose, children }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#040458]">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}

// Performance optimization hook
export const usePerformanceOptimization = () => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)
  
  const ref = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true)
          setHasIntersected(true)
        }
      },
      { threshold: 0.1 }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [hasIntersected])
  
  return { ref, isVisible, hasIntersected }
}

// Data caching hook
export const useDataCache = <T,>(key: string, fetcher: () => Promise<T>, ttl: number = 300000) => {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  
  React.useEffect(() => {
    const cached = localStorage.getItem(key)
    const cachedTime = localStorage.getItem(`${key}_timestamp`)
    
    if (cached && cachedTime) {
      const now = Date.now()
      const cacheTime = parseInt(cachedTime)
      
      if (now - cacheTime < ttl) {
        setData(JSON.parse(cached))
        return
      }
    }
    
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await fetcher()
        setData(result)
        localStorage.setItem(key, JSON.stringify(result))
        localStorage.setItem(`${key}_timestamp`, Date.now().toString())
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [key, ttl])
  
  return { data, loading, error }
}

export default MobileOptimizations
