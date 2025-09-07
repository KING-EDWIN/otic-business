// Subscription Service for Tier-based Access Control
import { supabase } from '@/lib/supabase'
import { getCurrentUserInfo } from '@/utils/userUtils'
import { tierService, Tier, UserSubscription as NewUserSubscription } from './tierService'

export interface SubscriptionTier {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  maxProducts: number
  maxUsers: number
  maxStorage: number // in MB
  aiFeatures: boolean
  advancedReporting: boolean
  prioritySupport: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  tier_id: string
  status: 'active' | 'expired' | 'cancelled' | 'trial'
  start_date: string
  end_date: string
  auto_renew: boolean
  payment_method?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  subscription_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  transaction_id?: string
  created_at: string
}

export class SubscriptionService {
  private tiers: SubscriptionTier[] = [
    {
      id: 'free-trial',
      name: 'Free Trial',
      price: 0,
      currency: 'UGX',
      features: [
        '14 days free access',
        'Up to 50 products',
        'Basic POS functionality',
        'Basic reporting',
        'Email support'
      ],
      maxProducts: 50,
      maxUsers: 1,
      maxStorage: 100,
      aiFeatures: false,
      advancedReporting: false,
      prioritySupport: false
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 1000000, // 1M UGX
      currency: 'UGX',
      features: [
        'Up to 200 products',
        'Full POS system',
        'Inventory management',
        'Basic AI insights',
        'Email support',
        'Mobile app access'
      ],
      maxProducts: 200,
      maxUsers: 2,
      maxStorage: 500,
      aiFeatures: true,
      advancedReporting: false,
      prioritySupport: false
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      price: 3000000, // 3M UGX
      currency: 'UGX',
      features: [
        'Up to 1000 products',
        'Advanced POS features',
        'Full inventory management',
        'Advanced AI insights',
        'Advanced reporting',
        'Priority support',
        'API access'
      ],
      maxProducts: 1000,
      maxUsers: 5,
      maxStorage: 2000,
      aiFeatures: true,
      advancedReporting: true,
      prioritySupport: true
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 5000000, // 5M UGX
      currency: 'UGX',
      features: [
        'Unlimited products',
        'All POS features',
        'Complete inventory system',
        'Full AI suite',
        'Comprehensive reporting',
        '24/7 priority support',
        'Full API access',
        'Custom integrations'
      ],
      maxProducts: -1, // unlimited
      maxUsers: -1, // unlimited
      maxStorage: 10000,
      aiFeatures: true,
      advancedReporting: true,
      prioritySupport: true
    }
  ]

  async getTiers(): Promise<SubscriptionTier[]> {
    return this.tiers
  }

  async getCurrentSubscription(userId?: string): Promise<UserSubscription | null> {
    // Get current user info if userId not provided
    let currentUserId = userId
    if (!currentUserId) {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        console.error('User not authenticated')
        return null
      }
      currentUserId = userInfo.id
    }
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return null
    }

    return data
  }

  async createSubscription(userId: string, tierId: string, paymentData?: {
    payment_method: string
    transaction_id?: string
  }): Promise<UserSubscription> {
    const tier = this.tiers.find(t => t.id === tierId)
    if (!tier) {
      throw new Error('Invalid subscription tier')
    }

    const startDate = new Date()
    const endDate = new Date()
    
    if (tierId === 'free-trial') {
      endDate.setDate(endDate.getDate() + 14) // 14 days trial
    } else {
      endDate.setMonth(endDate.getMonth() + 1) // Monthly subscription
    }

    const subscription: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      tier_id: tierId,
      status: tierId === 'free-trial' ? 'trial' : 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      auto_renew: tierId !== 'free-trial',
      payment_method: paymentData?.payment_method,
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([subscription])
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      throw error
    }

    // Create payment record if payment data provided
    if (paymentData) {
      await this.createPayment(userId, data.id, tier.price, tier.currency, paymentData)
    }

    return data
  }

  async createPayment(
    userId: string, 
    subscriptionId: string, 
    amount: number, 
    currency: string, 
    paymentData: {
      payment_method: string
      transaction_id?: string
    }
  ): Promise<Payment> {
    const payment: Omit<Payment, 'id' | 'created_at'> = {
      user_id: userId,
      subscription_id: subscriptionId,
      amount,
      currency,
      status: 'completed',
      payment_method: paymentData.payment_method,
      transaction_id: paymentData.transaction_id
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single()

    if (error) {
      console.error('Error creating payment:', error)
      throw error
    }

    return data
  }

  async checkSubscriptionStatus(userId: string): Promise<{
    hasAccess: boolean
    tier: SubscriptionTier | null
    subscription: UserSubscription | null
    daysRemaining: number
  }> {
    const subscription = await this.getCurrentSubscription(userId)
    
    if (!subscription) {
      return {
        hasAccess: false,
        tier: null,
        subscription: null,
        daysRemaining: 0
      }
    }

    const tier = this.tiers.find(t => t.id === subscription.tier_id)
    const now = new Date()
    const endDate = new Date(subscription.end_date)
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Check if subscription is expired
    if (daysRemaining <= 0 && subscription.status !== 'trial') {
      await this.expireSubscription(subscription.id)
      return {
        hasAccess: false,
        tier,
        subscription,
        daysRemaining: 0
      }
    }

    return {
      hasAccess: true,
      tier,
      subscription,
      daysRemaining: Math.max(0, daysRemaining)
    }
  }

  async expireSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ status: 'expired' })
      .eq('id', subscriptionId)

    if (error) {
      console.error('Error expiring subscription:', error)
    }
  }

  async upgradeSubscription(userId: string, newTierId: string, paymentData?: {
    payment_method: string
    transaction_id?: string
  }): Promise<UserSubscription> {
    // Cancel current subscription
    const currentSub = await this.getCurrentSubscription(userId)
    if (currentSub) {
      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', currentSub.id)
    }

    // Create new subscription
    return await this.createSubscription(userId, newTierId, paymentData)
  }

  async getSubscriptionUsage(userId: string): Promise<{
    products: number
    users: number
    storage: number
    limits: {
      maxProducts: number
      maxUsers: number
      maxStorage: number
    }
  }> {
    // Use the known demo user ID for now
    const demoUserId = '00000000-0000-0000-0000-000000000001'
    const { tier } = await this.checkSubscriptionStatus(demoUserId)
    
    if (!tier) {
      return {
        products: 0,
        users: 0,
        storage: 0,
        limits: { maxProducts: 0, maxUsers: 0, maxStorage: 0 }
      }
    }

    // Get actual usage from database
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', demoUserId)

    const { data: users } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', demoUserId)

    // For now, return mock storage usage
    const storage = 50 // Mock storage usage in MB

    return {
      products: products?.length || 0,
      users: users?.length || 0,
      storage,
      limits: {
        maxProducts: tier.maxProducts,
        maxUsers: tier.maxUsers,
        maxStorage: tier.maxStorage
      }
    }
  }

  // New methods that integrate with the tier system
  async getNewTiers(): Promise<Tier[]> {
    return await tierService.getTiers()
  }

  async getNewUserSubscription(userId: string): Promise<NewUserSubscription | null> {
    return await tierService.getUserSubscription(userId)
  }

  async hasFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    return await tierService.hasFeatureAccess(userId, featureName)
  }

  async createNewSubscription(
    userId: string,
    tierId: string,
    paymentMethod?: string,
    amountPaid?: number,
    currency: string = 'UGX'
  ): Promise<{ success: boolean; subscription?: NewUserSubscription; error?: string }> {
    return await tierService.createSubscription(userId, tierId, paymentMethod, amountPaid, currency)
  }

  async getTierComparison(currentUserId?: string) {
    return await tierService.getTierComparison(currentUserId)
  }

  async canUpgradeToTier(userId: string, targetTierId: string) {
    return await tierService.canUpgradeToTier(userId, targetTierId)
  }

  async trackFeatureUsage(userId: string, featureName: string, increment: number = 1) {
    return await tierService.trackFeatureUsage(userId, featureName, increment)
  }
}

export const subscriptionService = new SubscriptionService()
