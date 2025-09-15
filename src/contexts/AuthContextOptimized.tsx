import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { isOfflineMode, getCurrentConfig } from '@/config/storageConfig'
// import { SignupService } from '@/services/signupService'

interface UserProfile {
  id: string
  email: string
  full_name?: string
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
  user: any
  profile: UserProfile | null
  session: any
  loading: boolean
  signUp: (email: string, password: string, businessName: string, userType?: 'business' | 'individual') => Promise<{ error: any }>
  signIn: (email: string, password: string, userType?: 'business' | 'individual') => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  getDashboardRoute: () => string
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
  const [pendingUserType, setPendingUserType] = useState<'business' | 'individual' | null>(null)

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
        
        // Save to localStorage for persistence
        localStorage.setItem('otic_user', JSON.stringify(initialSession.user))
        
        // Load profile asynchronously without blocking
        loadUserProfileAsync(initialSession.user.id)
      } else {
        // No session - user needs to sign in
        setUser(null)
        setProfile(null)
        setSession(null)
        console.log('No active session - user needs to sign in')
      }
    } catch (error) {
      console.error('Error initializing Supabase:', error)
      
      // On error, clear everything and require fresh login
      setUser(null)
      setProfile(null)
      setSession(null)
      localStorage.removeItem('otic_user')
      localStorage.removeItem('otic_profile')
    } finally {
      setLoading(false)
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session')
        
        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Save user to localStorage for persistence
          localStorage.setItem('otic_user', JSON.stringify(session.user))
          
          // Load profile asynchronously without blocking
          loadUserProfileAsync(session.user.id)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
          
          // Clear localStorage when signed out
          localStorage.removeItem('otic_user')
          localStorage.removeItem('otic_profile')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }

  // Non-blocking profile loading
  const loadUserProfileAsync = async (userId: string) => {
    try {
      console.log('loadUserProfileAsync: Starting profile load for user:', userId)
      
      // Get the current user from session to access metadata
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      console.log('loadUserProfileAsync: Current user metadata:', currentUser?.user_metadata)

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Profile access error, using fallback:', error.message)
        
        // Create a basic profile if access fails
        const basicProfile = {
          id: userId,
          email: currentUser?.email || '',
          full_name: currentUser?.user_metadata?.full_name || '',
          tier: 'free_trial' as const,
          user_type: (currentUser?.user_metadata?.user_type as 'business' | 'individual') || 'business',
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('loadUserProfileAsync: Setting fallback profile with user_type:', basicProfile.user_type)
        setProfile(basicProfile)
        localStorage.setItem('otic_profile', JSON.stringify(basicProfile))
        return
      }

      // Keep original profile data, don't override display name
      const enhancedProfile = {
        ...data
      }
      
      console.log('Profile loading - User email:', currentUser?.email)
      console.log('Profile loading - Database profile user_type:', data.user_type)
      console.log('Profile loading - Enhanced profile user_type:', enhancedProfile.user_type)
      
      setProfile(enhancedProfile)
      localStorage.setItem('otic_profile', JSON.stringify(enhancedProfile))
      setPendingUserType(null)
    } catch (error) {
      console.warn('Profile loading error, using fallback:', error)
      
      // Get the current user from session to access metadata
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      
      // Create a basic profile on error
      const basicProfile = {
        id: userId,
        email: currentUser?.email || '',
        full_name: currentUser?.user_metadata?.full_name || '',
        tier: 'free_trial' as const,
        user_type: (currentUser?.user_metadata?.user_type as 'business' | 'individual') || 'business',
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('loadUserProfileAsync: Setting error fallback profile with user_type:', basicProfile.user_type)
      setProfile(basicProfile)
      localStorage.setItem('otic_profile', JSON.stringify(basicProfile))
    }
  }

  const signUp = async (email: string, password: string, businessName: string, userType: 'business' | 'individual' = 'business') => {
    try {
      setPendingUserType(userType)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
            user_type: userType
          }
        }
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string, userType: 'business' | 'individual' = 'business') => {
    try {
      setPendingUserType(userType)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      
      // Clear all state
      setUser(null)
      setProfile(null)
      setSession(null)
      setPendingUserType(null)
      
      // Clear localStorage
      localStorage.removeItem('otic_user')
      localStorage.removeItem('otic_profile')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return { error }
      }

      setProfile(data)
      localStorage.setItem('otic_profile', JSON.stringify(data))
      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error }
    }
  }

  const getDashboardRoute = () => {
    if (!profile) return '/'
    
    if (profile.user_type === 'business') {
      return '/business-dashboard'
    } else {
      return '/individual-dashboard'
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
    updateProfile,
    getDashboardRoute
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}