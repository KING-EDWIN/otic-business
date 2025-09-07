import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Feature {
  id: string
  name: string
  description: string
  category: 'core' | 'analytics' | 'integration' | 'support' | 'system'
}

export interface Tier {
  id: string
  name: string
  display_name: string
  tier_type: 'free_trial' | 'start_smart' | 'grow_intelligence' | 'enterprise_advantage'
  price_usd: number
  price_ugx: number
  billing_period: 'monthly' | 'yearly'
  trial_days: number
  description: string
  features: string[]
  max_users: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  tier_id: string
  status: 'active' | 'expired' | 'cancelled' | 'trial' | 'suspended'
  trial_start_date?: string
  trial_end_date?: string
  subscription_start_date?: string
  subscription_end_date?: string
  auto_renew: boolean
  payment_method?: string
  amount_paid?: number
  currency: string
  created_at: string
  updated_at: string
  tier?: Tier
}

export interface TierUsage {
  id: string
  user_id: string
  tier_id: string
  feature_name: string
  usage_count: number
  usage_limit: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface TierComparison {
  tier: Tier
  features: Feature[]
  is_popular?: boolean
  is_current?: boolean
}

export class TierService {
  // Get all available tiers
  async getTiers(): Promise<Tier[]> {
    try {
      const { data, error } = await supabase
        .from('tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching tiers:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching tiers:', error)
      return []
    }
  }

  // Get all features
  async getFeatures(): Promise<Feature[]> {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('category', { ascending: true })

      if (error) {
        console.error('Error fetching features:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching features:', error)
      return []
    }
  }

  // Get tier with features
  async getTierWithFeatures(tierId: string): Promise<TierComparison | null> {
    try {
      const { data: tier, error: tierError } = await supabase
        .from('tiers')
        .select('*')
        .eq('id', tierId)
        .single()

      if (tierError || !tier) {
        console.error('Error fetching tier:', tierError)
        return null
      }

      const { data: features, error: featuresError } = await supabase
        .from('features')
        .select('*')
        .in('name', tier.features)

      if (featuresError) {
        console.error('Error fetching features:', featuresError)
        return null
      }

      return {
        tier,
        features: features || []
      }
    } catch (error) {
      console.error('Error fetching tier with features:', error)
      return null
    }
  }

  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:tiers(*)
        `)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user subscription:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  }

  // Create or update user subscription
  async createSubscription(
    userId: string,
    tierId: string,
    paymentMethod?: string,
    amountPaid?: number,
    currency: string = 'UGX'
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
    try {
      // Get tier details
      const { data: tier, error: tierError } = await supabase
        .from('tiers')
        .select('*')
        .eq('id', tierId)
        .single()

      if (tierError || !tier) {
        return { success: false, error: 'Tier not found' }
      }

      const now = new Date()
      const isTrial = tier.tier_type === 'free_trial'
      const trialEndDate = isTrial ? new Date(now.getTime() + tier.trial_days * 24 * 60 * 60 * 1000) : null
      const subscriptionEndDate = isTrial ? null : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days for paid tiers

      const subscriptionData = {
        user_id: userId,
        tier_id: tierId,
        status: isTrial ? 'trial' : 'active',
        trial_start_date: isTrial ? now.toISOString() : null,
        trial_end_date: trialEndDate?.toISOString() || null,
        subscription_start_date: !isTrial ? now.toISOString() : null,
        subscription_end_date: subscriptionEndDate?.toISOString() || null,
        auto_renew: !isTrial,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        currency
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData, { onConflict: 'user_id' })
        .select(`
          *,
          tier:tiers(*)
        `)
        .single()

      if (error) {
        console.error('Error creating subscription:', error)
        return { success: false, error: 'Failed to create subscription' }
      }

      return { success: true, subscription: data }
    } catch (error) {
      console.error('Error creating subscription:', error)
      return { success: false, error: 'Failed to create subscription' }
    }
  }

  // Check if user has access to a feature
  async hasFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription || !subscription.tier) {
        return false
      }

      // Check if feature is included in tier
      const hasFeature = subscription.tier.features.includes(featureName)
      
      // If it's a trial, check if trial is still valid
      if (subscription.status === 'trial' && subscription.trial_end_date) {
        const trialEnd = new Date(subscription.trial_end_date)
        const now = new Date()
        if (now > trialEnd) {
          return false
        }
      }

      // If subscription is expired, deny access
      if (subscription.status === 'expired' || subscription.status === 'cancelled') {
        return false
      }

      return hasFeature
    } catch (error) {
      console.error('Error checking feature access:', error)
      return false
    }
  }

  // Get user's tier usage for a feature
  async getFeatureUsage(userId: string, featureName: string): Promise<TierUsage | null> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription) {
        return null
      }

      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1) // First day of current month
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of current month

      const { data, error } = await supabase
        .from('tier_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('tier_id', subscription.tier_id)
        .eq('feature_name', featureName)
        .gte('period_start', periodStart.toISOString())
        .lte('period_end', periodEnd.toISOString())
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching feature usage:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching feature usage:', error)
      return null
    }
  }

  // Track feature usage
  async trackFeatureUsage(
    userId: string,
    featureName: string,
    increment: number = 1
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId)
      if (!subscription) {
        return { success: false, error: 'No active subscription' }
      }

      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      // Get or create usage record
      const { data: existingUsage, error: fetchError } = await supabase
        .from('tier_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('tier_id', subscription.tier_id)
        .eq('feature_name', featureName)
        .gte('period_start', periodStart.toISOString())
        .lte('period_end', periodEnd.toISOString())
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching usage:', fetchError)
        return { success: false, error: 'Failed to fetch usage data' }
      }

      if (existingUsage) {
        // Update existing usage
        const { error: updateError } = await supabase
          .from('tier_usage_tracking')
          .update({
            usage_count: existingUsage.usage_count + increment,
            updated_at: now.toISOString()
          })
          .eq('id', existingUsage.id)

        if (updateError) {
          console.error('Error updating usage:', updateError)
          return { success: false, error: 'Failed to update usage' }
        }
      } else {
        // Create new usage record
        const { error: insertError } = await supabase
          .from('tier_usage_tracking')
          .insert({
            user_id: userId,
            tier_id: subscription.tier_id,
            feature_name: featureName,
            usage_count: increment,
            usage_limit: -1, // Will be set based on tier
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString()
          })

        if (insertError) {
          console.error('Error creating usage record:', insertError)
          return { success: false, error: 'Failed to create usage record' }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error tracking feature usage:', error)
      return { success: false, error: 'Failed to track usage' }
    }
  }

  // Get tier comparison for pricing page
  async getTierComparison(currentUserId?: string): Promise<TierComparison[]> {
    try {
      const tiers = await this.getTiers()
      const features = await this.getFeatures()
      const currentSubscription = currentUserId ? await this.getUserSubscription(currentUserId) : null

      const comparisons: TierComparison[] = []

      for (const tier of tiers) {
        const tierFeatures = features.filter(feature => 
          tier.features.includes(feature.name)
        )

        comparisons.push({
          tier,
          features: tierFeatures,
          is_popular: tier.tier_type === 'grow_intelligence',
          is_current: currentSubscription?.tier_id === tier.id
        })
      }

      return comparisons
    } catch (error) {
      console.error('Error getting tier comparison:', error)
      return []
    }
  }

  // Check if user can upgrade to a tier
  async canUpgradeToTier(userId: string, targetTierId: string): Promise<{ canUpgrade: boolean; reason?: string }> {
    try {
      const currentSubscription = await this.getUserSubscription(userId)
      const { data: targetTier, error } = await supabase
        .from('tiers')
        .select('*')
        .eq('id', targetTierId)
        .single()

      if (error || !targetTier) {
        return { canUpgrade: false, reason: 'Target tier not found' }
      }

      if (!currentSubscription) {
        return { canUpgrade: true }
      }

      // Check if target tier is higher than current
      const tierOrder = ['free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage']
      const currentTierIndex = tierOrder.indexOf(currentSubscription.tier?.tier_type || 'free_trial')
      const targetTierIndex = tierOrder.indexOf(targetTier.tier_type)

      if (targetTierIndex <= currentTierIndex) {
        return { canUpgrade: false, reason: 'Target tier is not higher than current tier' }
      }

      return { canUpgrade: true }
    } catch (error) {
      console.error('Error checking upgrade eligibility:', error)
      return { canUpgrade: false, reason: 'Error checking upgrade eligibility' }
    }
  }

  // Format price for display
  formatPrice(amount: number, currency: string = 'UGX'): string {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount)
    }

    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Get tier benefits for display
  getTierBenefits(tier: Tier): string[] {
    const benefits: { [key: string]: string[] } = {
      free_trial: [
        '30 days free trial',
        'Full access to all features',
        'POS system with barcode scanning',
        'Complete inventory management',
        'AI analytics and insights',
        'Multi-user access',
        'All payment methods',
        'Priority support during trial'
      ],
      start_smart: [
        'Perfect for small businesses',
        'Mobile POS with barcode scanning',
        'Basic inventory management',
        'Sales reporting (daily, weekly, monthly)',
        'Single user dashboard',
        'Receipt generation',
        'CSV/PDF exports',
        'Email support'
      ],
      grow_intelligence: [
        'Everything in Start Smart',
        'QuickBooks API integration',
        'Tax computation & VAT analysis',
        'AI sales trend analytics',
        'Multi-user access (up to 5 users)',
        'Role-based permissions',
        'Automated financial reports',
        'Priority support'
      ],
      enterprise_advantage: [
        'Everything in Grow with Intelligence',
        'Multi-branch synchronization',
        'AI financial forecasting',
        'Advanced compliance reporting',
        'Unlimited users',
        'Third-party API integrations',
        'Audit logs & advanced permissions',
        'Dedicated account manager',
        '24/7 phone support'
      ]
    }

    return benefits[tier.tier_type] || []
  }
}

export const tierService = new TierService()
