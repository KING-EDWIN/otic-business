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

    // Listen for auth changes (this also gets the initial session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth state change:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Real user session - fetch profile
          await fetchUserProfile(session.user.id)
        } else {
          // No session - clear user and loading
          setAppUser(null)
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
    }, 30000) // 30 second timeout

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)
      
      // Use user_profiles table directly
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
          setLoading(false)
          window.location.href = '/complete-profile'
          return
        }
        // For other errors, set loading to false
        setLoading(false)
        return
      }

      console.log('Raw user profile data:', data)
      
      // Handle email_verified field properly - it's a boolean in the database
      let emailVerified = true // Default to true
      
      if (data.email_verified !== undefined && data.email_verified !== null) {
        // Convert to boolean explicitly
        emailVerified = data.email_verified === true || data.email_verified === 'true'
      }
      
      console.log('Processed email_verified:', emailVerified, 'type:', typeof emailVerified)

      const userData = {
        ...data,
        email_verified: emailVerified
      }
      
      console.log('Final user data:', userData)
      console.log('Final email_verified value:', userData.email_verified, 'type:', typeof userData.email_verified)
      
      setAppUser(userData)
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
            tier: tier,
            email_verified: true // Set new users as verified
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Handle email confirmation error
      if (error && error.message.includes('email not confirmed')) {
        // Check if user exists in our database and is verified there
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('email_verified')
          .eq('email', email)
          .single()
        
        if (userProfile?.email_verified) {
          // User is verified in our system, but not in Supabase auth
          // Try to resend confirmation email as a workaround
          console.log('User is verified in our system but not in Supabase auth, resending confirmation...')
          await supabase.auth.resend({
            type: 'signup',
            email: email
          })
          
          return { 
            error: { 
              message: 'Email confirmation sent. Please check your email and click the confirmation link, then try signing in again.' 
            } 
          }
        }
      }
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      // Set loading to true during sign out
      setLoading(true)
      
      // Clear all state
      setUser(null)
      setAppUser(null)
      setSession(null)
      
      // Then sign out from Supabase
      await supabase.auth.signOut()
      
      // Set loading to false after sign out
      setLoading(false)
      
      // Redirect to login page after sign out
      window.location.href = '/signin'
    } catch (error) {
      console.error('Error signing out:', error)
      setLoading(false)
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
