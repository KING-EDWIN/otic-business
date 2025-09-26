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
    let timeoutId: NodeJS.Timeout

    // Add timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout - forcing loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

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
              // Simple profile loading with proper error handling
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
                clearTimeout(timeoutId)
              }
            } catch (error) {
              console.warn('Profile fetch failed:', error)
              if (mounted) {
                setProfile(null)
                setLoading(false)
                clearTimeout(timeoutId)
              }
            }
          } else {
            setProfile(null)
            setLoading(false)
            clearTimeout(timeoutId)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
          clearTimeout(timeoutId)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes - only handle state changes, not initial loading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state change:', event, session?.user?.id)
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        // Handle sign in - load profile
        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            email_confirmed_at: session.user.email_confirmed_at,
            created_at: session.user.created_at
          })
          
          // Load profile
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError) {
              console.warn('Profile fetch error in state change:', profileError)
              setProfile(null)
            } else {
              setProfile(profileData)
            }
          } catch (error) {
            console.warn('Profile fetch failed in state change:', error)
            setProfile(null)
          }
          
          setLoading(false)
        }
        
        // Handle token refresh - just update session
        if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, userType: 'business' | 'individual' = 'business') => {
    try {
      console.log(`🔐 Signing in ${email} as ${userType}`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in failed:', error)
        return { error: { message: error.message || 'Sign in failed' } }
      }

      // Simple email verification check
      if (data.user && !data.user.email_confirmed_at) {
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
      return { error: { message: error.message || 'Sign in failed' } }
    }
  }

  const signUp = async (email: string, password: string, businessName: string, userType: 'business' | 'individual' = 'business'): Promise<{ error: any; needsEmailVerification?: boolean }> => {
    try {
      console.log(`🚀 Starting signup for ${email} (${userType})`)
      
      // Import environment service for URL generation
      const { getUrl } = await import('@/services/environmentService')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getUrl('/verify-email'),
          data: {
            business_name: businessName,
            user_type: userType,
            full_name: businessName
          }
        }
      })

      if (error) {
        console.error('Auth signup error:', error)
        return { error: { message: error.message || 'Signup failed' }, needsEmailVerification: false }
      }

      if (!data.user) {
        return { error: { message: 'No user data returned from signup' }, needsEmailVerification: false }
      }

      console.log('✅ Auth user created:', data.user.id)

      // Create user profile
      const profileData = {
        id: data.user.id,
        email: email,
        full_name: businessName,
        business_name: businessName,
        user_type: userType,
        tier: 'free_trial' as const,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return { error: { message: 'Failed to create user profile' }, needsEmailVerification: false }
      }

      console.log('✅ User profile created successfully')

      // Check if email verification is needed
      if (!data.user.email_confirmed_at) {
        console.log('📧 Email verification required')
        return { 
          error: null,
          needsEmailVerification: true 
        }
      }

      console.log('🎉 Signup completed successfully')
      return { error: null, needsEmailVerification: false }
    } catch (error: any) {
      console.error('Error in signup process:', error)
      return { error: { message: error.message || 'Signup failed' }, needsEmailVerification: false }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...')
      
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Clear storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'local' })
      
      console.log('✅ Sign out successful')
    } catch (error) {
      console.error('Sign out error:', error)
      // Force clear everything even if there's an error
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
    console.log('🔍 getDashboardRoute called:', { user: !!user, profile: !!profile, userType: profile?.user_type });
    
    if (!user) {
      console.log('🔍 No user, redirecting to login-type');
      return '/login-type';
    }
    
    if (!profile) {
      console.log('🔍 No profile, redirecting to login-type');
      return '/login-type';
    }
    
    if (profile.user_type === 'business') {
      console.log('🔍 Business user, redirecting to dashboard');
      return '/dashboard';
    } else {
      console.log('🔍 Individual user, redirecting to individual-dashboard');
      return '/individual-dashboard';
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