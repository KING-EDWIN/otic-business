import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { isOfflineMode, getCurrentConfig } from '@/config/storageConfig'
import { SignupService } from '@/services/signupService'

interface UserProfile {
  id: string
  email: string
  business_name?: string
  phone?: string
  address?: string
  tier: 'basic' | 'standard' | 'premium'
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: any
  profile: UserProfile | null
  session: any
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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Check if we're in offline mode
  const isOffline = isOfflineMode()

  useEffect(() => {
    if (isOffline) {
      // Offline mode - load from localStorage
      loadOfflineUser()
    } else {
      // Online mode - use Supabase
      initializeSupabase()
    }
  }, [isOffline])

  const loadOfflineUser = () => {
    try {
      const savedUser = localStorage.getItem('otic_user')
      const savedProfile = localStorage.getItem('otic_profile')
      
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        const profileData = savedProfile ? JSON.parse(savedProfile) : null
        
        setUser(userData)
        setProfile(profileData)
        setSession({ user: userData })
        console.log('Loaded offline user:', userData)
      }
    } catch (error) {
      console.error('Error loading offline user:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeSupabase = async () => {
    try {
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      
      if (initialSession) {
        setSession(initialSession)
        setUser(initialSession.user)
        await loadUserProfile(initialSession.user.id)
      }
    } catch (error) {
      console.error('Error initializing Supabase:', error)
    } finally {
      setLoading(false)
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        if (session) {
          setSession(session)
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading user profile:', error)
        
        // If profile doesn't exist, try to complete missing setup
        if (error.code === 'PGRST116') {
          console.log('User profile not found, attempting to complete setup...')
          const setupResult = await SignupService.completeMissingSetup(userId, { email: user?.email })
          if (setupResult.success) {
            // Try to load profile again
            const { data: newData } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', userId)
              .single()
            
            if (newData) {
              setProfile(newData)
              return
            }
          }
        }
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, businessName: string) => {
    try {
      console.log('Starting signup process for:', email)
      
      // Use the comprehensive signup service
      const result = await SignupService.completeSignup({
        email,
        password,
        businessName
      })

      if (!result.success) {
        console.error('Signup failed:', result.error)
        return { error: { message: result.error || 'Signup failed' } }
      }

      // Set user data in context
      if (result.user && result.profile) {
        setUser(result.user)
        setProfile(result.profile)
        setSession({ user: result.user })
      }

      console.log('Signup completed successfully for:', email)
      return { error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { error: { message: 'An unexpected error occurred during signup' } }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (isOffline) {
      // Offline sign in with demo user
      if (email === 'test@oticbusiness.com' && password === 'test123456') {
        const demoUser = {
          id: '4a280b3c-f99b-4efb-b1c8-a2a93c6fb76d',
          email: 'test@oticbusiness.com',
          email_confirmed_at: '2025-09-08T11:14:31.207217Z',
          created_at: '2025-09-08T11:14:31.149382Z'
        }
        
        const demoProfile = {
          id: '4a280b3c-f99b-4efb-b1c8-a2a93c6fb76d',
          email: 'test@oticbusiness.com',
          business_name: 'Demo Business Store',
          phone: '+256 700 000 000',
          address: 'Kampala, Uganda',
          tier: 'standard' as const,
          email_verified: true,
          created_at: '2025-09-08T11:14:31.149382Z',
          updated_at: '2025-09-08T11:14:31.145986Z'
        }
        
        setUser(demoUser)
        setProfile(demoProfile)
        setSession({ user: demoUser })
        
        // Save to localStorage
        localStorage.setItem('otic_user', JSON.stringify(demoUser))
        localStorage.setItem('otic_profile', JSON.stringify(demoProfile))
        
        return { error: null }
      } else {
        return { error: { message: 'Invalid credentials for offline mode' } }
      }
    } else {
      // Online sign in with Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) return { error }

        return { error: null }
      } catch (error) {
        console.error('Sign in error:', error)
        return { error }
      }
    }
  }

  const signInWithGoogle = async () => {
    if (isOffline) {
      return { error: { message: 'Google sign in not available in offline mode' } }
    } else {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })

        if (error) return { error }

        return { error: null }
      } catch (error) {
        console.error('Google sign in error:', error)
        return { error }
      }
    }
  }

  const signOut = async () => {
    if (isOffline) {
      // Offline sign out
      setUser(null)
      setProfile(null)
      setSession(null)
      localStorage.removeItem('otic_user')
      localStorage.removeItem('otic_profile')
    } else {
      // Online sign out with Supabase
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Sign out error:', error)
      }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (isOffline) {
      // Offline profile update
      if (profile) {
        const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() }
        setProfile(updatedProfile)
        localStorage.setItem('otic_profile', JSON.stringify(updatedProfile))
      }
      return { error: null }
    } else {
      // Online profile update with Supabase
      try {
        if (!user) return { error: { message: 'No user logged in' } }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) return { error }

        // Reload profile
        await loadUserProfile(user.id)

        return { error: null }
      } catch (error) {
        console.error('Profile update error:', error)
        return { error }
      }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
