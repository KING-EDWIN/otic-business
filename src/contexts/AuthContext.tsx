import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, User as AppUser } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  appUser: AppUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, businessName: string, tier?: 'free_trial' | 'basic' | 'standard' | 'premium') => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signUpWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: any }>
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
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Get initial session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Real user session found - fetch their profile
        fetchUserProfile(session.user.id)
      } else {
        // No real session - check if we should use demo mode
        // Only enable demo mode if no real user session exists
        if (window.location.hostname.includes('vercel.app') && 
            !window.location.pathname.startsWith('/internal-admin-portal') &&
            !sessionStorage.getItem('demo_mode_disabled')) {
          console.log('🌐 Deployed app detected - setting demo mode as fallback')
          sessionStorage.setItem('demo_mode', 'true')
          
          // Set demo user directly
          const demoUser = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'demo@oticbusiness.com',
            created_at: new Date().toISOString()
          }
          
          setUser(demoUser)
          setAppUser({
            id: '00000000-0000-0000-0000-000000000001',
            email: 'demo@oticbusiness.com',
            tier: 'premium',
            business_name: 'Demo Business Store',
            phone: '+256 700 000 000',
            address: 'Kampala, Uganda',
            created_at: new Date().toISOString(),
            email_verified: true
          })
        }
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth state change:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Real user session - disable demo mode and fetch profile
          sessionStorage.removeItem('demo_mode')
          sessionStorage.setItem('demo_mode_disabled', 'true')
          await fetchUserProfile(session.user.id)
        } else {
          // No session - clear user and re-enable demo mode if appropriate
          setAppUser(null)
          sessionStorage.removeItem('demo_mode_disabled')
          
          // Re-enable demo mode for deployed apps if no real session
          if (window.location.hostname.includes('vercel.app') && 
              !window.location.pathname.startsWith('/internal-admin-portal')) {
            console.log('🌐 No real session - re-enabling demo mode')
            sessionStorage.setItem('demo_mode', 'true')
            
            const demoUser = {
              id: '00000000-0000-0000-0000-000000000001',
              email: 'demo@oticbusiness.com',
              created_at: new Date().toISOString()
            }
            
            setUser(demoUser)
            setAppUser({
              id: '00000000-0000-0000-0000-000000000001',
              email: 'demo@oticbusiness.com',
              tier: 'premium',
              business_name: 'Demo Business Store',
              phone: '+256 700 000 000',
              address: 'Kampala, Uganda',
              created_at: new Date().toISOString(),
              email_verified: true
            })
          }
          setLoading(false)
        }
      }
    )

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth loading timeout - setting loading to false')
        setLoading(false)
      }
    }, 15000) // 15 second timeout

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        // If no profile found, user might be OAuth user who needs to complete profile
        if (error.code === 'PGRST116') {
          // No profile found - redirect to complete profile
          setLoading(false) // Set loading to false before redirect
          window.location.href = '/complete-profile'
          return
        }
        // For other errors, set loading to false
        setLoading(false)
        return
      }

      // Check if email is verified
      if (data.email_verified === false) {
        // Email not verified - show verification message
        setAppUser(data)
        setLoading(false)
        return
      }

      setAppUser(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, businessName: string, tier: 'free_trial' | 'basic' | 'standard' | 'premium' = 'free_trial') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            business_name: businessName,
            tier: tier
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          return { error: profileError }
        }

        // Create subscription for free trial
        if (tier === 'free_trial') {
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: data.user.id,
              tier: 'free_trial',
              status: 'trial',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })

          if (subscriptionError) {
            console.error('Error creating trial subscription:', subscriptionError)
          }
        }

        // Create subscription for paid plans
        if (tier !== 'free_trial') {
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: data.user.id,
              tier: tier,
              status: 'active',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            })

          if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError)
          }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Check if this is a demo login
      if (email === 'demo@oticbusiness.com' && password === 'demo123456') {
        // Create a demo user session without actual auth
        const demoUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'demo@oticbusiness.com',
          created_at: new Date().toISOString()
        }
        
        // Set the demo user in state
        setUser(demoUser)
        
        // Create demo user profile if it doesn't exist
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single()

        if (!existingProfile) {
          // Create demo profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: '00000000-0000-0000-0000-000000000001',
              email: 'demo@oticbusiness.com',
              tier: 'free_trial',
              business_name: 'Demo Business Store',
              phone: '+256 700 000 000',
              address: 'Kampala, Uganda',
              created_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Error creating demo profile:', profileError)
          }

          // Create demo subscription
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert({
              id: 'demo-sub-12345',
              user_id: '00000000-0000-0000-0000-000000000001',
              tier: 'free_trial',
              status: 'trial',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString()
            })

          if (subscriptionError) {
            console.error('Error creating demo subscription:', subscriptionError)
          }
        }
        
        // Set the demo user profile directly to avoid waiting
        setAppUser({
          id: '00000000-0000-0000-0000-000000000001',
          email: 'demo@oticbusiness.com',
          tier: 'free_trial',
          business_name: 'Demo Business Store',
          phone: '+256 700 000 000',
          address: 'Kampala, Uganda',
          created_at: new Date().toISOString()
        })
        
        setLoading(false)
        
        return { error: null }
      }
      
      // Disable demo mode when real user tries to log in
      sessionStorage.removeItem('demo_mode')
      sessionStorage.setItem('demo_mode_disabled', 'true')
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      // Clear all state first
      setUser(null)
      setAppUser(null)
      setSession(null)
      setLoading(false)
      
      // Clear demo mode flags
      sessionStorage.removeItem('demo_mode')
      sessionStorage.removeItem('demo_mode_disabled')
      
      // Then sign out from Supabase
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates: Partial<AppUser>) => {
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
      setAppUser(prev => prev ? { ...prev, ...updates } : null)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('Initiating Google sign-in...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        console.error('Google sign-in error:', error)
      } else {
        console.log('Google sign-in initiated successfully:', data)
      }
      
      return { error }
    } catch (error) {
      console.error('Google sign-in exception:', error)
      return { error }
    }
  }

  const signUpWithGoogle = async () => {
    try {
      console.log('Initiating Google sign-up...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/complete-profile`
        }
      })
      
      if (error) {
        console.error('Google sign-up error:', error)
      } else {
        console.log('Google sign-up initiated successfully:', data)
      }
      
      return { error }
    } catch (error) {
      console.error('Google sign-up exception:', error)
      return { error }
    }
  }

  const value = {
    user,
    appUser,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
