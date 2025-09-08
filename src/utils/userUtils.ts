// User utility functions for proper user data isolation
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export interface UserInfo {
  id: string
  email: string
  tier: 'free_trial' | 'basic' | 'standard' | 'premium'
  isDemo: boolean
}

// Helper function to create UserInfo from AuthContext data
export const createUserInfoFromAuth = (user: User | null, tier: string = 'free_trial'): UserInfo | null => {
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email || '',
    tier: tier as 'free_trial' | 'basic' | 'standard' | 'premium',
    isDemo: false
  }
}

export const getCurrentUserInfo = async (): Promise<UserInfo | null> => {
  try {
    // Get authenticated user with better error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      // Don't log warnings for missing sessions - this is normal during loading
      if (authError.message !== 'Auth session missing!') {
        console.warn('Auth error:', authError)
      }
      return null
    }
    
    if (!user) {
      // Don't log warnings for missing users - this is normal during loading
      return null
    }

    // Get user profile to check tier
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.warn('Error fetching user profile:', profileError)
      // Default to free_trial if no profile found
      return {
        id: user.id,
        email: user.email || '',
        tier: 'free_trial',
        isDemo: false
      }
    }

    return {
      id: user.id,
      email: user.email || '',
      tier: profile.tier || 'free_trial',
      isDemo: false
    }
  } catch (error) {
    // Don't log errors for missing sessions - this is normal during loading
    if (error instanceof Error && error.message !== 'Auth session missing!') {
      console.error('Error getting user info:', error)
    }
    return null
  }
}

export const hasFeatureAccess = (userTier: string, requiredTier: string): boolean => {
  const tierLevels = {
    'free_trial': 0,
    'basic': 1,
    'standard': 2,
    'premium': 3
  }

  const userLevel = tierLevels[userTier as keyof typeof tierLevels] || 0
  const requiredLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0

  return userLevel >= requiredLevel
}

export const getTierFeatures = (tier: string) => {
  const features = {
    'free_trial': [
      'POS System',
      'Basic Inventory',
      'Basic Reports',
      'Receipt Generation',
      'Single User'
    ],
    'basic': [
      'POS System',
      'Basic Inventory',
      'Basic Reports',
      'Receipt Generation',
      'Single User',
      'Customer Management'
    ],
    'standard': [
      'Everything in Basic',
      'Advanced Reports',
      'QuickBooks Integration',
      'AI Analytics',
      'Multi-user Access',
      'Tax Computation',
      'Email Notifications'
    ],
    'premium': [
      'Everything in Standard',
      'Multi-branch Management',
      'AI Forecasting',
      'Priority Support',
      'Advanced Compliance',
      'Custom Reports',
      'API Access'
    ]
  }

  return features[tier as keyof typeof features] || features.free_trial
}
