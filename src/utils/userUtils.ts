// User utility functions for proper user data isolation
import { supabase } from '@/lib/supabase'

export interface UserInfo {
  id: string
  email: string
  tier: 'free_trial' | 'basic' | 'standard' | 'premium'
  isDemo: boolean
}

export const getCurrentUserInfo = async (): Promise<UserInfo | null> => {
  try {
    // Check if we're in demo mode first
    const isDemo = sessionStorage.getItem('demo_mode') === 'true'
    
    if (isDemo) {
      // Return demo user info
      return {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@oticbusiness.com',
        tier: 'premium', // Demo has access to all features
        isDemo: true
      }
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.warn('No authenticated user found:', authError)
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
    console.error('Error getting user info:', error)
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
