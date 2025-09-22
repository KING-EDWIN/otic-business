import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { isOfflineMode, getCurrentConfig } from '@/config/storageConfig'
import { GoogleAuthService } from '@/services/googleAuthService'
import { InputSanitizationService } from '@/services/inputSanitizationService'
import { NetworkErrorHandler } from '@/services/networkErrorHandler'
import { toast } from 'sonner'
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
  signInWithGoogle: (userType?: 'business' | 'individual') => Promise<{ error: any }>
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
  const [profileLoading, setProfileLoading] = useState(false)
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
    if (profileLoading) return // Prevent multiple simultaneous profile loads
    try {
      setProfileLoading(true)
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
        console.error('❌ Profile access error - must use live backend:', error.message)
        throw new Error(`Failed to load user profile: ${error.message}`)
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
    } finally {
      setProfileLoading(false)
      
    }
  }

  const signUp = async (email: string, password: string, businessName: string, userType: 'business' | 'individual' = 'business') => {
    try {
      // Sanitize inputs
      const emailResult = InputSanitizationService.sanitizeEmail(email)
      const passwordResult = InputSanitizationService.sanitizePassword(password)
      const businessNameResult = InputSanitizationService.sanitizeBusinessName(businessName)

      // Check for validation errors
      if (!emailResult.isValid) {
        toast.error(`Email error: ${emailResult.errors.join(', ')}`)
        return { error: { message: emailResult.errors.join(', ') } }
      }

      if (!passwordResult.isValid) {
        toast.error(`Password error: ${passwordResult.errors.join(', ')}`)
        return { error: { message: passwordResult.errors.join(', ') } }
      }

      if (!businessNameResult.isValid) {
        toast.error(`Business name error: ${businessNameResult.errors.join(', ')}`)
        return { error: { message: businessNameResult.errors.join(', ') } }
      }

      // Show warnings if any
      if (emailResult.warnings.length > 0) {
        toast.warning(`Email warning: ${emailResult.warnings.join(', ')}`)
      }
      if (passwordResult.warnings.length > 0) {
        toast.warning(`Password warning: ${passwordResult.warnings.join(', ')}`)
      }
      if (businessNameResult.warnings.length > 0) {
        toast.warning(`Business name warning: ${businessNameResult.warnings.join(', ')}`)
      }

      setPendingUserType(userType)
      const { data, error } = await supabase.auth.signUp({
        email: emailResult.sanitizedValue,
        password: passwordResult.sanitizedValue,
        options: {
          data: {
            business_name: businessNameResult.sanitizedValue,
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
      // Sanitize inputs
      const emailResult = InputSanitizationService.sanitizeEmail(email)
      const passwordResult = InputSanitizationService.sanitizePassword(password)

      // Check for validation errors
      if (!emailResult.isValid) {
        toast.error(`Email error: ${emailResult.errors.join(', ')}`)
        return { error: { message: emailResult.errors.join(', ') } }
      }

      if (!passwordResult.isValid) {
        toast.error(`Password error: ${passwordResult.errors.join(', ')}`)
        return { error: { message: passwordResult.errors.join(', ') } }
      }

      // Show warnings if any
      if (emailResult.warnings.length > 0) {
        toast.warning(`Email warning: ${emailResult.warnings.join(', ')}`)
      }
      if (passwordResult.warnings.length > 0) {
        toast.warning(`Password warning: ${passwordResult.warnings.join(', ')}`)
      }

      setPendingUserType(userType)
      
      const { data, error } = await NetworkErrorHandler.withRetry(async () => {
        const result = await supabase.auth.signInWithPassword({
          email: emailResult.sanitizedValue,
          password: passwordResult.sanitizedValue,
        })

        if (result.error) {
          throw result.error
        }

        return result
      })

      if (error) {
        const errorInfo = NetworkErrorHandler.handleAuthError(error)
        toast.error(errorInfo.userMessage)
        return { error: { message: errorInfo.userMessage } }
      }

      // Validate account type after successful authentication
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile for type validation:', profileError)
          toast.error('Account validation failed. Please try again.')
          return { error: { message: 'Account validation failed' } }
        }

        if (profile?.user_type !== userType) {
          const correctForm = profile?.user_type === 'business' ? 'Business Sign In' : 'Individual Sign In'
          toast.error(`Account doesn't exist for this account type. Please use the ${correctForm} form.`)
          return { 
            error: { 
              message: `Account doesn't exist for this account type. Please use the ${correctForm} form.`,
              accountType: profile?.user_type,
              requestedType: userType
            } 
          }
        }
      }

      return { error: null }
    } catch (error) {
      NetworkErrorHandler.logError(error, 'AuthContext.signIn')
      const errorInfo = NetworkErrorHandler.handleAuthError(error)
      toast.error(errorInfo.userMessage)
      return { error: { message: errorInfo.userMessage } }
    }
  }

  const signInWithGoogle = async (userType: 'business' | 'individual' = 'business') => {
    try {
      const result = await GoogleAuthService.initiateGoogleAuth({
        userType,
        showToast: true
      })

      if (!result.success) {
        return { error: { message: result.error } }
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