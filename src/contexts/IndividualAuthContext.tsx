import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface IndividualUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
}

interface IndividualProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  address?: string
  tier: 'free_trial' | 'basic' | 'standard' | 'premium'
  user_type: 'individual'
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface IndividualAuthContextType {
  user: IndividualUser | null
  profile: IndividualProfile | null
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<IndividualProfile>) => Promise<{ error: any }>
}

const IndividualAuthContext = createContext<IndividualAuthContextType | undefined>(undefined)

export const IndividualAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IndividualUser | null>(null)
  const [profile, setProfile] = useState<IndividualProfile | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Only load profile if user_type is 'individual'
            const { data: profileData, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .eq('user_type', 'individual') // Only load individual profiles
              .single()
            
            if (error) {
              console.warn('Individual profile fetch error:', error)
              // If no individual profile found, sign out the user
              await supabase.auth.signOut()
              setUser(null)
              setProfile(null)
              setSession(null)
            } else if (profileData) {
              setProfile(profileData)
            }
          } else {
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
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
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            // Only load individual profiles
            const { data: profileData, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .eq('user_type', 'individual')
              .single()
            
            if (error) {
              console.warn('Individual profile fetch error:', error)
              // If no individual profile found, sign out the user
              await supabase.auth.signOut()
              setUser(null)
              setProfile(null)
              setSession(null)
              toast.error('This account is not registered as an individual account')
            } else if (profileData) {
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

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      // Verify this is an individual account
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single()

        if (profileError || profile?.user_type !== 'individual') {
          // Sign out immediately if not an individual account
          await supabase.auth.signOut()
          toast.error('This account is not registered as an individual account. Please use the business sign-in form.')
          return { 
            error: { 
              message: 'This account is not registered as an individual account. Please use the business sign-in form.' 
            } 
          }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'individual'
          }
        }
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Create individual profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            user_type: 'individual',
            tier: 'free_trial',
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Error creating individual profile:', profileError)
          return { error: profileError }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<IndividualProfile>) => {
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
        .eq('user_type', 'individual')

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

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <IndividualAuthContext.Provider value={value}>
      {children}
    </IndividualAuthContext.Provider>
  )
}

export const useIndividualAuth = () => {
  const context = useContext(IndividualAuthContext)
  if (context === undefined) {
    throw new Error('useIndividualAuth must be used within an IndividualAuthProvider')
  }
  return context
}
