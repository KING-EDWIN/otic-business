import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

interface EmployeeRouteGuardProps {
  children: React.ReactNode
  allowedPages: string[]
}

const EmployeeRouteGuard: React.FC<EmployeeRouteGuardProps> = ({ 
  children, 
  allowedPages 
}) => {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && profile) {
      // Check if user is an employee
      if (profile.user_type === 'employee') {
        // Get current path
        const currentPath = window.location.pathname
        
        // Check if current path is allowed for employees
        const isAllowed = allowedPages.some(page => currentPath.includes(page))
        
        if (!isAllowed) {
          // Redirect to POS (first allowed page)
          navigate('/pos')
        }
      }
    }
  }, [user, profile, loading, navigate])

  // Show loading while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // If user is not an employee, show the page normally
  if (!profile || profile.user_type !== 'employee') {
    return <>{children}</>
  }

  // If user is an employee, check if current page is allowed
  const currentPath = window.location.pathname
  const isAllowed = allowedPages.some(page => currentPath.includes(page))

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. 
            As an employee, you can only access POS, Inventory, Accounting, and Customers pages.
          </p>
          <button
            onClick={() => navigate('/pos')}
            className="bg-[#040458] text-white px-6 py-2 rounded-lg hover:bg-[#040458]/90 transition-colors"
          >
            Go to POS
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default EmployeeRouteGuard
