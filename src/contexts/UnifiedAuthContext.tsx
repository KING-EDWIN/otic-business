import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
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

        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ? {
            id: session.user.id,
            email: session.user.email || '',
            email_confirmed_at: session.user.email_confirmed_at,
            created_at: session.user.created_at
          } : null)
          
          if (session?.user) {
            try {
              // Simple profile loading - no retry to avoid complexity
              const { data: profileData, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (mounted) {
                if (error) {
                  console.warn('Profile fetch error:', error)
                  setProfile(null)
                } else {
                  setProfile(profileData)
                }
                setLoading(false)
              }
            } catch (error) {
              console.warn('Profile fetch failed:', error)
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
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          email_confirmed_at: session.user.email_confirmed_at,
          created_at: session.user.created_at
        } : null)
        
        if (session?.user) {
          try {
            // Simple profile loading - no retry to avoid complexity
            const { data: profileData, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (error) {
              console.warn('Profile fetch error:', error)
              setProfile(null)
            } else {
              setProfile(profileData)
            }
          } catch (error) {
            console.warn('Profile fetch failed:', error)
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in failed:', error)
        return { error: { message: error.message || 'Sign in failed' } }
      }

      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        return { 
          error: { 
            message: 'Please verify your email before signing in. Check your inbox for a verification link.' 
          } 
        }
      }

      // Check account type - fetch profile to verify user type
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.warn('Profile fetch error during sign in:', profileError)
          // Continue with sign in if profile fetch fails
        } else if (profileData && profileData.user_type !== userType) {
          // Wrong account type
          return {
            error: {
              message: `This account is registered as a ${profileData.user_type} account. Please use the ${profileData.user_type === 'business' ? 'Business' : 'Individual'} Sign In form.`,
              accountType: profileData.user_type
            }
          }
        }
      } catch (profileError) {
        console.warn('Profile validation error during sign in:', profileError)
        // Continue with sign in if profile validation fails
      }

      return { error: null, data }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { error: { message: error.message || 'Sign in failed' } }
    }
  }

  const signUp = async (email: string, password: string, businessName: string, userType: 'business' | 'individual' = 'business') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
            user_type: userType,
            full_name: businessName
          }
        }
      })

      if (error) {
        return { error: { message: error.message || 'Signup failed' } }
      }

      if (data.user && !data.user.email_confirmed_at) {
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
      // Clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear storage
      localStorage.clear()
      sessionStorage.clear()
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Clear everything even if there's an error
      setUser(null)
      setProfile(null)
      setSession(null)
      localStorage.clear()
      sessionStorage.clear()
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