import { supabase } from '@/lib/supabase'
import { generateDemoProducts, generateDemoSales, generateDemoAnalytics } from './demoData'

export const seedDemoData = async (tier: 'free_trial' | 'basic' | 'standard' | 'premium') => {
  try {
    // Create demo user profile with tier-specific business names
    const businessNames = {
      'free_trial': "Demo Business Store",
      'basic': "Sarah's Corner Shop",
      'standard': "Kampala Electronics Hub", 
      'premium': "East Africa Supermarkets Ltd"
    }
    
    const businessDescriptions = {
      'free_trial': "A small retail store testing our platform",
      'basic': "A neighborhood corner shop selling everyday essentials",
      'standard': "An electronics retailer with multiple product lines",
      'premium': "A multi-branch supermarket chain across East Africa"
    }

    const { data: demoUser, error: userError } = await supabase
      .from('user_profiles')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@oticbusiness.com',
        business_name: businessNames[tier],
        business_description: businessDescriptions[tier],
        tier: tier,
        phone: '+256 700 000 000',
        address: tier === 'premium' ? 'Kampala, Nairobi, Dar es Salaam' : 'Kampala, Uganda',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating demo user:', userError)
      return { success: false, error: userError }
    }

    // Create demo subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: '00000000-0000-0000-0000-000000000001',
        tier: tier,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (subscriptionError) {
      console.error('Error creating demo subscription:', subscriptionError)
    }

    // Generate and insert demo products
    const products = generateDemoProducts(tier)
    const { error: productsError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' })

    if (productsError) {
      console.error('Error inserting demo products:', productsError)
    }

    // Generate and insert demo sales
    const sales = generateDemoSales(tier)
    const { error: salesError } = await supabase
      .from('sales')
      .upsert(sales, { onConflict: 'id' })

    if (salesError) {
      console.error('Error inserting demo sales:', salesError)
    }

    // Generate and insert demo analytics
    const analytics = generateDemoAnalytics(tier)
    const analyticsData = [
      {
        user_id: '00000000-0000-0000-0000-000000000001',
        metric: 'total_sales',
        value: analytics.totalSales,
        date: new Date().toISOString().split('T')[0]
      },
      {
        user_id: '00000000-0000-0000-0000-000000000001',
        metric: 'total_revenue',
        value: analytics.totalRevenue,
        date: new Date().toISOString().split('T')[0]
      },
      {
        user_id: '00000000-0000-0000-0000-000000000001',
        metric: 'total_products',
        value: analytics.totalProducts,
        date: new Date().toISOString().split('T')[0]
      },
      {
        user_id: '00000000-0000-0000-0000-000000000001',
        metric: 'low_stock_items',
        value: analytics.lowStockItems,
        date: new Date().toISOString().split('T')[0]
      }
    ]

    const { error: analyticsError } = await supabase
      .from('analytics_data')
      .upsert(analyticsData, { onConflict: 'id' })

    if (analyticsError) {
      console.error('Error inserting demo analytics:', analyticsError)
    }

    return { success: true, data: { user: demoUser, products: products.length, sales: sales.length } }
  } catch (error) {
    console.error('Error seeding demo data:', error)
    return { success: false, error }
  }
}

export const clearDemoData = async () => {
  try {
    // Clear all demo data
    await supabase.from('analytics_data').delete().eq('user_id', '00000000-0000-0000-0000-000000000001')
    await supabase.from('sales').delete().eq('user_id', '00000000-0000-0000-0000-000000000001')
    await supabase.from('products').delete().eq('user_id', '00000000-0000-0000-0000-000000000001')
    await supabase.from('subscriptions').delete().eq('user_id', '00000000-0000-0000-0000-000000000001')
    await supabase.from('user_profiles').delete().eq('id', '00000000-0000-0000-0000-000000000001')
    
    return { success: true }
  } catch (error) {
    console.error('Error clearing demo data:', error)
    return { success: false, error }
  }
}
