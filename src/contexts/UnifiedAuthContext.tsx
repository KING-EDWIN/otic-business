import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { clearProblematicSession, checkForProblematicSession } from '@/utils/sessionCleanup'
import { ProfessionalSignupService } from '@/services/professionalSignup'
import { EnhancedEmailVerificationService } from '@/services/enhancedEmailVerificationWithDB'
import { 
  testSupabaseConnectionWithRetry, 
  clearAuthStorage, 
  fetchProfileWithRetry,
  signInWithRetry,
  getSessionWithRetry,
  isNetworkError,
  isOnline,
  waitForOnline
} from '@/utils/networkResilience'
import { toast } from 'sonner'

interface UnifiedUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
}

interface UnifiedProfile {
  id: string
  email: string
  full_name: string
  business_name?: string
  phone?: string
  address?: string
  tier: 'free_trial' | 'start_smart' | 'grow_intelligence' | 'enterprise_advantage'
  user_type: 'business' | 'individual'
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null
  profile: UnifiedProfile | null
  session: any
  loading: boolean
  signIn: (email: string, password: string, userType?: 'business' | 'individual') => Promise<{ error: any }>
  signUp: (email: string, password: string, businessName: string, userType?: 'business' | 'individual') => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UnifiedProfile>) => Promise<{ error: any }>
  getDashboardRoute: () => string
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined)

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UnifiedUser | null>(null)
  const [profile, setProfile] = useState<UnifiedProfile | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        // Check for problematic session first
        const isProblematic = await checkForProblematicSession()
        if (isProblematic) {
          console.log('🚨 Clearing problematic session...')
          await clearProblematicSession()
          if (mounted) {
            setUser(null)
            setProfile(null)
            setSession(null)
            setLoading(false)
          }
          return
        }

        const { data: { session } } = await getSessionWithRetry()
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            try {
              // Use robust profile loading with retry
              const profileData = await fetchProfileWithRetry(session.user.id)
              
              if (mounted) {
                setProfile(profileData)
                setLoading(false)
              }
            } catch (error) {
              console.warn('Profile fetch failed after retries:', error)
              if (mounted) {
                setProfile(null)
                setLoading(false)
              }
            }
          } else {
            setProfile(null)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        // Simplified logging
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('Auth state change:', event, session?.user?.id)
        }
        
        // Prevent rapid state changes during sign-out
        if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            // Use robust profile loading with retry
            const profileData = await fetchProfileWithRetry(session.user.id)
            setProfile(profileData)
          } catch (error) {
            console.warn('Profile fetch failed after retries:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, userType: 'business' | 'individual' = 'business') => {
    try {
      console.log(`🔐 Starting sign in for ${email} as ${userType}`)
      
      // Test network connectivity first
      const isConnected = await testSupabaseConnectionWithRetry()
      if (!isConnected) {
        console.error('❌ Network connectivity test failed')
        return { error: { message: 'Network connection failed. Please check your internet connection and try again.' } }
      }
      
      // Clear any problematic sessions before attempting sign in
      clearAuthStorage()
      
      // Use robust sign in with retry
      const { data, error } = await signInWithRetry(email, password)

      if (error) {
        console.error('Sign in failed:', error)
        return { error }
      }

      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        console.log('⚠️ Email not verified, preventing login')
        return { 
          error: { 
            message: 'Please verify your email before signing in. Check your inbox for a verification link.' 
          } 
        }
      }

      console.log('✅ Sign in successful')
      return { error: null, data }
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      // Handle network errors specifically
      if (isNetworkError(error)) {
        return { 
          error: { 
            message: 'Network connection failed. Please check your internet connection and try again.' 
          } 
        }
      }
      
      return { error: { message: error.message || 'Sign in failed' } }
    }
  }

  const signUp = async (email: string, password: string, businessName: string, userType: 'business' | 'individual' = 'business') => {
    try {
      console.log(`🚀 Starting professional signup for ${email} (${userType})`)
      
      // Use the professional signup service
      const result = await ProfessionalSignupService.signup({
        email,
        password,
        businessName,
        userType,
        fullName: businessName // Use business name as full name for now
      })

      if (!result.success) {
        return { error: { message: result.error } }
      }

      if (result.needsEmailVerification) {
        toast.success('Account created! Please check your email to verify your account.')
        return { 
          error: null,
          needsEmailVerification: true 
        }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Error in signup process:', error)
      return { error: { message: error.message || 'Signup failed' } }
    }
  }

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      
      console.log('✅ Sign out successful')
      
    } catch (error) {
      console.error('❌ Sign out error:', error)
      // Even if there's an error, clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
      window.location.href = '/'
    }
  }

  const updateProfile = async (updates: Partial<UnifiedProfile>) => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } }
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        return { error }
      }

      // Update local profile state
      if (profile) {
        setProfile({ ...profile, ...updates })
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const getDashboardRoute = () => {
    if (!profile) return '/'
    
    if (profile.user_type === 'business') {
      return '/dashboard'
    } else {
      return '/individual-dashboard'
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    getDashboardRoute
  }

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(UnifiedAuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a UnifiedAuthProvider')
  }
  return context
}