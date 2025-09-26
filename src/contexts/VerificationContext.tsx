import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface VerificationContextType {
  isEmailVerified: boolean
  isLoading: boolean
  checkVerificationStatus: () => Promise<void>
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined)

export const useVerification = () => {
  const context = useContext(VerificationContext)
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider')
  }
  return context
}

interface VerificationProviderProps {
  children: React.ReactNode
}

export const VerificationProvider: React.FC<VerificationProviderProps> = ({ children }) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if email is verified
        const verified = user.email_confirmed_at !== null
        setIsEmailVerified(verified)
        console.log('📧 Email verification status:', verified ? 'Verified' : 'Not verified')
      } else {
        setIsEmailVerified(false)
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
      setIsEmailVerified(false)
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'No user found' }
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!
      })

      if (error) {
        console.error('Error resending verification email:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Exception resending verification email:', error)
      return { success: false, error: error.message || 'Failed to resend verification email' }
    }
  }

  useEffect(() => {
    checkVerificationStatus()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkVerificationStatus()
      } else if (event === 'SIGNED_OUT') {
        setIsEmailVerified(false)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: VerificationContextType = {
    isEmailVerified,
    isLoading,
    checkVerificationStatus,
    resendVerificationEmail
  }

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  )
}