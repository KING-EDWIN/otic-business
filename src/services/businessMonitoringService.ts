import { supabase } from '@/lib/supabaseClient'

export interface BusinessAlert {
  id: string
  user_id: string
  alert_type: 'low_stock' | 'high_expense' | 'payment_due' | 'sales_target' | 'inventory_value'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  is_read: boolean
  is_active: boolean
  threshold_value?: number
  current_value?: number
  created_at: string
  resolved_at?: string
  expires_at?: string
}

export interface BusinessKPI {
  id: string
  user_id: string
  kpi_name: string
  kpi_value: number
  target_value?: number
  unit: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  calculated_at: string
  previous_value?: number
  change_percentage?: number
  trend?: 'up' | 'down' | 'stable'
}

export interface CustomerSegment {
  id: string
  user_id: string
  segment_name: string
  description?: string
  criteria: any
  customer_count: number
  total_value: number
  created_at: string
  updated_at: string
}

export interface BusinessGoal {
  id: string
  user_id: string
  goal_name: string
  description?: string
  goal_type: 'revenue' | 'sales' | 'customers' | 'inventory' | 'custom'
  target_value: number
  current_value: number
  unit: string
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  progress_percentage: number
  created_at: string
  updated_at: string
}

export interface BusinessInsight {
  id: string
  user_id: string
  insight_type: 'sales_trend' | 'customer_behavior' | 'inventory_optimization' | 'financial_health'
  title: string
  description: string
  confidence_score?: number
  impact_level?: 'low' | 'medium' | 'high'
  actionable: boolean
  action_items?: any
  generated_at: string
  expires_at?: string
}

export class BusinessMonitoringService {
  // Business Alerts
  async getAlerts(userId: string, limit: number = 50): Promise<BusinessAlert[]> {
    try {
      const { data, error } = await supabase
        .from('business_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching business alerts:', error)
      throw error
    }
  }

  async createAlert(alert: Omit<BusinessAlert, 'id' | 'created_at'>): Promise<BusinessAlert> {
    try {
      const { data, error } = await supabase
        .from('business_alerts')
        .insert([alert])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating business alert:', error)
      throw error
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('business_alerts')
        .update({ is_read: true })
        .eq('id', alertId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking alert as read:', error)
      throw error
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('business_alerts')
        .update({ 
          is_active: false, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId)

      if (error) throw error
    } catch (error) {
      console.error('Error resolving alert:', error)
      throw error
    }
  }

  // Business KPIs
  async getKPIs(userId: string, period?: string): Promise<BusinessKPI[]> {
    try {
      let query = supabase
        .from('business_kpis')
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })

      if (period) {
        query = query.eq('period', period)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching business KPIs:', error)
      throw error
    }
  }

  async createKPI(kpi: Omit<BusinessKPI, 'id' | 'calculated_at'>): Promise<BusinessKPI> {
    try {
      const { data, error } = await supabase
        .from('business_kpis')
        .insert([kpi])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating business KPI:', error)
      throw error
    }
  }

  // Customer Segments
  async getCustomerSegments(userId: string): Promise<CustomerSegment[]> {
    try {
      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching customer segments:', error)
      throw error
    }
  }

  async createCustomerSegment(segment: Omit<CustomerSegment, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerSegment> {
    try {
      const { data, error } = await supabase
        .from('customer_segments')
        .insert([segment])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating customer segment:', error)
      throw error
    }
  }

  // Business Goals
  async getBusinessGoals(userId: string): Promise<BusinessGoal[]> {
    try {
      const { data, error } = await supabase
        .from('business_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching business goals:', error)
      throw error
    }
  }

  async createBusinessGoal(goal: Omit<BusinessGoal, 'id' | 'created_at' | 'updated_at'>): Promise<BusinessGoal> {
    try {
      const { data, error } = await supabase
        .from('business_goals')
        .insert([goal])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating business goal:', error)
      throw error
    }
  }

  async updateBusinessGoal(goalId: string, updates: Partial<BusinessGoal>): Promise<BusinessGoal> {
    try {
      const { data, error } = await supabase
        .from('business_goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating business goal:', error)
      throw error
    }
  }

  // Business Insights
  async getBusinessInsights(userId: string, limit: number = 20): Promise<BusinessInsight[]> {
    try {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching business insights:', error)
      throw error
    }
  }

  async createBusinessInsight(insight: Omit<BusinessInsight, 'id' | 'generated_at'>): Promise<BusinessInsight> {
    try {
      const { data, error } = await supabase
        .from('business_insights')
        .insert([insight])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating business insight:', error)
      throw error
    }
  }

  // Generate Business Insights
  async generateBusinessInsights(userId: string): Promise<BusinessInsight[]> {
    try {
      // This would analyze business data and generate insights
      // For now, we'll create some sample insights
      const insights: Omit<BusinessInsight, 'id' | 'generated_at'>[] = [
        {
          user_id: userId,
          insight_type: 'sales_trend',
          title: 'Sales Performance Analysis',
          description: 'Your sales have increased by 15% this month compared to last month. This is primarily driven by increased demand for electronics.',
          confidence_score: 0.85,
          impact_level: 'high',
          actionable: true,
          action_items: [
            'Increase inventory for high-demand products',
            'Consider expanding marketing efforts',
            'Monitor competitor pricing'
          ]
        },
        {
          user_id: userId,
          insight_type: 'customer_behavior',
          title: 'Customer Retention Opportunity',
          description: 'You have 23 customers who haven\'t made a purchase in the last 30 days. Consider reaching out with targeted offers.',
          confidence_score: 0.92,
          impact_level: 'medium',
          actionable: true,
          action_items: [
            'Send personalized email campaigns',
            'Offer special discounts to inactive customers',
            'Follow up with phone calls'
          ]
        },
        {
          user_id: userId,
          insight_type: 'inventory_optimization',
          title: 'Inventory Optimization Suggestion',
          description: 'You have 5 products with low stock levels that are frequently ordered. Consider increasing reorder points.',
          confidence_score: 0.78,
          impact_level: 'medium',
          actionable: true,
          action_items: [
            'Review and update reorder points',
            'Set up automated low stock alerts',
            'Consider bulk purchasing for high-demand items'
          ]
        }
      ]

      const createdInsights: BusinessInsight[] = []
      for (const insight of insights) {
        const created = await this.createBusinessInsight(insight)
        createdInsights.push(created)
      }

      return createdInsights
    } catch (error) {
      console.error('Error generating business insights:', error)
      throw error
    }
  }

  // Dashboard Summary
  async getDashboardSummary(userId: string): Promise<{
    totalAlerts: number
    unreadAlerts: number
    activeGoals: number
    completedGoals: number
    recentInsights: number
    kpiCount: number
  }> {
    try {
      // Get alerts count
      const { count: totalAlerts } = await supabase
        .from('business_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true)

      const { count: unreadAlerts } = await supabase
        .from('business_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_read', false)

      // Get goals count
      const { count: activeGoals } = await supabase
        .from('business_goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')

      const { count: completedGoals } = await supabase
        .from('business_goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')

      // Get recent insights count (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { count: recentInsights } = await supabase
        .from('business_insights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('generated_at', sevenDaysAgo.toISOString())

      // Get KPIs count
      const { count: kpiCount } = await supabase
        .from('business_kpis')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      return {
        totalAlerts: totalAlerts || 0,
        unreadAlerts: unreadAlerts || 0,
        activeGoals: activeGoals || 0,
        completedGoals: completedGoals || 0,
        recentInsights: recentInsights || 0,
        kpiCount: kpiCount || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      throw error
    }
  }
}

export const businessMonitoringService = new BusinessMonitoringService()

