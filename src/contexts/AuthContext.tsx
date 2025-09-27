import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import CacheService from '@/services/cacheService'

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
        
        console.log('Auth state change:', event, session?.user?.id)
        
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
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      })

      if (authError) {
        return { error: authError }
      }

      if (!authData.user) {
        return { error: { message: 'Failed to create user account' } }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: businessName,
          business_name: userType === 'business' ? businessName : null,
          tier: 'free_trial',
          user_type: userType,
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return { error: { message: 'Failed to create user profile' } }
      }

      toast.success('Account created! Please check your email to verify your account.')
      return { 
        error: null,
        needsEmailVerification: true 
      }
    } catch (error: any) {
      console.error('Error in signup process:', error)
      return { error: { message: error.message || 'Signup failed' } }
    }
  }

  const signOut = async () => {
    try {
      // Clear all cache first
      CacheService.clearAllUserCache()
      
      // Clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      
      console.log('✅ Sign out successful - cache cleared')
      
    } catch (error) {
      console.error('❌ Sign out error:', error)
      // Even if there's an error, clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
      window.location.href = '/'
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
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
    if (!user) {
      return '/login-type'
    }
    
    // If user exists but profile is still loading, wait a bit
    if (!profile && loading) {
      return '/login-type'
    }
    
    // If user exists but no profile after loading is complete, go to login
    if (!profile && !loading) {
      return '/login-type'
    }
    
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
