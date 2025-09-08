import React, { createContext, useContext, useEffect, useState } from 'react'

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already signed in (from localStorage)
    const savedUser = localStorage.getItem('otic_user')
    const savedProfile = localStorage.getItem('otic_profile')
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        const profileData = savedProfile ? JSON.parse(savedProfile) : null
        
        setUser(userData)
        setProfile(profileData)
        setSession({ user: userData })
        console.log('Loaded user from localStorage:', userData)
      } catch (error) {
        console.error('Error loading saved user:', error)
        localStorage.removeItem('otic_user')
        localStorage.removeItem('otic_profile')
      }
    }
  }, [])

  const signUp = async (email: string, password: string, businessName: string) => {
    // Simulate sign up
    const newUser = {
      id: 'offline-user-' + Date.now(),
      email,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    
    const newProfile = {
      id: newUser.id,
      email,
      business_name: businessName,
      phone: '',
      tier: 'free_trial' as const,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setUser(newUser)
    setProfile(newProfile)
    setSession({ user: newUser })
    
    // Save to localStorage
    localStorage.setItem('otic_user', JSON.stringify(newUser))
    localStorage.setItem('otic_profile', JSON.stringify(newProfile))
    
    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    // Simulate sign in with demo user
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
      
      console.log('Signed in offline user:', demoUser)
      return { error: null }
    }
    
    return { error: new Error('Invalid credentials') }
  }

  const signInWithGoogle = async () => {
    return { error: new Error('Google sign in not available in offline mode') }
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setSession(null)
    
    // Clear localStorage
    localStorage.removeItem('otic_user')
    localStorage.removeItem('otic_profile')
    
    console.log('Signed out offline user')
    window.location.href = '/signin'
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    const updatedProfile = { ...profile, ...updates }
    setProfile(updatedProfile)
    
    // Save to localStorage
    localStorage.setItem('otic_profile', JSON.stringify(updatedProfile))
    
    return { error: null }
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
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
