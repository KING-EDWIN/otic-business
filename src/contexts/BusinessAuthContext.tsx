import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

interface BusinessUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
}

interface BusinessProfile {
  id: string
  email: string
  business_name: string
  full_name: string
  phone?: string
  address?: string
  tier: 'free_trial' | 'basic' | 'standard' | 'premium'
  user_type: 'business'
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface BusinessAuthContextType {
  user: BusinessUser | null
  profile: BusinessProfile | null
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, businessName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<BusinessProfile>) => Promise<{ error: any }>
}

const BusinessAuthContext = createContext<BusinessAuthContextType | undefined>(undefined)

export const BusinessAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BusinessUser | null>(null)
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
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
            // Only load profile if user_type is 'business'
            const { data: profileData, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .eq('user_type', 'business') // Only load business profiles
              .single()
            
            if (error) {
              console.warn('Business profile fetch error:', error)
              // If no business profile found, sign out the user
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
            // Only load business profiles
            const { data: profileData, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .eq('user_type', 'business')
              .single()
            
            if (error) {
              console.warn('Business profile fetch error:', error)
              // If no business profile found, sign out the user
              await supabase.auth.signOut()
              setUser(null)
              setProfile(null)
              setSession(null)
              toast.error('This account is not registered as a business account')
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

      // Verify this is a business account
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single()

        if (profileError || profile?.user_type !== 'business') {
          // Sign out immediately if not a business account
          await supabase.auth.signOut()
          toast.error('This account is not registered as a business account. Please use the individual sign-in form.')
          return { 
            error: { 
              message: 'This account is not registered as a business account. Please use the individual sign-in form.' 
            } 
          }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, businessName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
            user_type: 'business'
          }
        }
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Create business profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            business_name: businessName,
            full_name: businessName,
            user_type: 'business',
            tier: 'free_trial',
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Error creating business profile:', profileError)
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

  const updateProfile = async (updates: Partial<BusinessProfile>) => {
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
        .eq('user_type', 'business')

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
    <BusinessAuthContext.Provider value={value}>
      {children}
    </BusinessAuthContext.Provider>
  )
}

export const useBusinessAuth = () => {
  const context = useContext(BusinessAuthContext)
  if (context === undefined) {
    throw new Error('useBusinessAuth must be used within a BusinessAuthProvider')
  }
  return context
}
