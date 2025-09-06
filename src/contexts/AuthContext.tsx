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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setAppUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
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
        // Don't set loading to false here, let the component handle it
        return
      }

      setAppUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
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
              expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
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
              expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
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

  const value = {
    user,
    appUser,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
