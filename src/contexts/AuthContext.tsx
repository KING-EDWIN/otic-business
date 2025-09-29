import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
}

interface Profile {
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

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: any
  loading: boolean
  signIn: (email: string, password: string, userType?: 'business' | 'individual') => Promise<{ error: any }>
  signUp: (email: string, password: string, businessName: string, userType?: 'business' | 'individual') => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  getDashboardRoute: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return
    initialized.current = true

    let mounted = true
    let authStateChangeHandled = false

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth state...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          if (mounted) {
            setLoading(false)
            setUser(null)
            setProfile(null)
            setSession(null)
          }
          return
        }

        if (session?.user) {
          console.log('✅ Session found for user:', session.user.email)
          
          if (mounted) {
            setSession(session)
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              email_confirmed_at: session.user.email_confirmed_at,
              created_at: session.user.created_at
            })
          }

          // Load profile
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (mounted) {
              if (profileError) {
                console.warn('Profile fetch error:', profileError)
                setProfile(null)
              } else {
                console.log('✅ Profile loaded:', profileData.email)
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
          console.log('ℹ️ No session found')
          if (mounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setLoading(false)
          setUser(null)
          setProfile(null)
          setSession(null)
        }
      }
    }

    initializeAuth()

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth loading timeout - setting loading to false')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        // Skip if this is the initial session load (already handled by initializeAuth)
        if (event === 'INITIAL_SESSION') {
          if (!authStateChangeHandled) {
            authStateChangeHandled = true
            console.log('🔄 Initial session event - skipping (already handled by initializeAuth)')
            return
          }
        }
        
        console.log('🔄 Auth state change:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out')
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('✅ User signed in/refreshed:', session.user.email)
            
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
                console.warn('Profile fetch error:', profileError)
                setProfile(null)
              } else {
                console.log('✅ Profile loaded:', profileData.email)
                setProfile(profileData)
              }
            } catch (error) {
              console.warn('Profile fetch failed:', error)
              setProfile(null)
            }
          } else {
            setSession(null)
            setUser(null)
            setProfile(null)
          }
          
          setLoading(false)
        } else if (event === 'INITIAL_SESSION') {
          // Handle initial session properly
          if (session?.user) {
            console.log('🔄 Initial session with user:', session.user.email)
            // Don't duplicate the work done in initializeAuth
            // Just ensure loading is false
            setLoading(false)
          } else {
            console.log('🔄 Initial session - no user')
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
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
      return { error: { message: error.message || 'Sign in failed' } }
    }
  }

  const signUp = async (email: string, password: string, businessName: string, userType: 'business' | 'individual' = 'business') => {
    try {
      console.log(`🚀 Starting signup for ${email} (${userType})`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            business_name: businessName
          }
        }
      })

      if (authError) {
        console.error('Auth signup failed:', authError)
        return { error: authError }
      }

      if (!authData.user) {
        console.error('No user returned from signup')
        return { error: { message: 'Signup failed - no user created' } }
      }

      console.log('✅ Auth user created:', authData.user.email)

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: businessName,
          business_name: userType === 'business' ? businessName : undefined,
          user_type: userType,
          tier: 'free_trial',
          email_verified: false
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation failed:', profileError)
        return { error: profileError }
      }

      console.log('✅ Profile created:', profileData.email)
      return { error: null, data: { user: authData.user, profile: profileData } }
    } catch (error: any) {
      console.error('Error in signup process:', error)
      return { error: { message: error.message || 'Signup failed' } }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user')
      await supabase.auth.signOut()
      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Profile update failed:', error)
        return { error }
      }

      setProfile(data)
      console.log('✅ Profile updated successfully')
      return { error: null, data }
    } catch (error: any) {
      console.error('Profile update error:', error)
      return { error: { message: error.message || 'Profile update failed' } }
    }
  }

  const getDashboardRoute = () => {
    if (!profile) return '/login-type'
    
    switch (profile.user_type) {
      case 'business':
        return '/dashboard'
      case 'individual':
        return '/individual-dashboard'
      default:
        return '/login-type'
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}