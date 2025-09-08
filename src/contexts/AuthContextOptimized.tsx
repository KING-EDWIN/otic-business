import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  business_name?: string
  phone?: string
  tier: 'free_trial' | 'start_smart' | 'grow_intelligence' | 'enterprise_advantage'
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface Subscription {
  id: string
  user_id: string
  tier: string
  status: string
  starts_at: string
  expires_at?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  subscription: Subscription | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, businessName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Quick timeout to prevent long loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false)
      }
    }, 2000) // 2 second max loading time

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Auth session error:', error.message)
        }
        
        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Fetch user data in parallel for better performance
            const [profileResult, subscriptionResult] = await Promise.allSettled([
              supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single(),
              supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
            ])
            
            if (profileResult.status === 'fulfilled' && profileResult.value.data) {
              setProfile(profileResult.value.data)
            }
            
            if (subscriptionResult.status === 'fulfilled' && subscriptionResult.value.data) {
              setSubscription(subscriptionResult.value.data)
            }
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user data in parallel
          const [profileResult, subscriptionResult] = await Promise.allSettled([
            supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single(),
            supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
          ])
          
          if (profileResult.status === 'fulfilled' && profileResult.value.data) {
            setProfile(profileResult.value.data)
          }
          
          if (subscriptionResult.status === 'fulfilled' && subscriptionResult.value.data) {
            setSubscription(subscriptionResult.value.data)
          }
        } else {
          setProfile(null)
          setSubscription(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, businessName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/signin`
        }
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Create user profile
        await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            business_name: businessName,
            tier: 'free_trial',
            email_verified: false
          })
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSubscription(null)
      setSession(null)
      setLoading(false)
      window.location.href = '/signin'
    } catch (error) {
      console.error('Error signing out:', error)
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') }
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error }
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    profile,
    subscription,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
