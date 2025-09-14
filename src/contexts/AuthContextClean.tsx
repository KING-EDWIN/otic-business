import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

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

    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Auth loading timeout - forcing loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
        }
        
        console.log('📊 Initial session result:', { session: !!session, user: !!session?.user, error })
        
        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            console.log('👤 User found, fetching user data...')
            await fetchUserData(session.user.id)
          } else {
            console.log('❌ No user in session')
          }
          setLoading(false)
          console.log('✅ Auth loading completed')
        }
      } catch (error) {
        console.error('❌ Error getting initial session:', error)
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
        
        console.log('🔄 Auth state change:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('👤 User in state change, fetching data...')
          await fetchUserData(session.user.id)
        } else {
          console.log('❌ No user in state change, clearing data')
          setProfile(null)
          setSubscription(null)
        }
        
        setLoading(false)
        console.log('✅ Auth state change completed')
      }
    )

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserData = async (userId: string) => {
    try {
      console.log('🔍 Fetching user data for:', userId)
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError)
        return
      }

      console.log('✅ User profile fetched:', profileData)
      setProfile(profileData)

      // Fetch user subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (subscriptionError) {
        console.error('❌ Error fetching subscription:', subscriptionError)
        return
      }

      console.log('✅ Subscription fetched:', subscriptionData)
      setSubscription(subscriptionData)
    } catch (error) {
      console.error('❌ Error fetching user data:', error)
    }
  }

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

      // Update the user profile with business name if user was created
      if (data.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ business_name: businessName })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        }
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
      // Hard clear any persisted sessions (sb-*) and demo flags
      try {
        Object.keys(localStorage).forEach(k => (k.startsWith('sb-') || k.includes('demo')) && localStorage.removeItem(k))
        sessionStorage.clear()
        document.cookie.split(';').forEach(c => document.cookie = c.trim().split('=')[0]+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/')
      } catch {}
      setLoading(false)
      // Redirect to signin page
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

      // Update local state
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

