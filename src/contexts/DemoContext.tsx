import React, { createContext, useContext, useEffect, useState } from 'react'
import { demoUsers, generateDemoProducts, generateDemoSales, generateDemoAnalytics, DemoUser } from '@/services/demoData'
import { seedDemoData } from '@/services/demoSeeder'

interface DemoContextType {
  isDemoMode: boolean
  demoUser: DemoUser | null
  demoData: any
  enterDemo: (tier: 'basic' | 'standard' | 'premium') => Promise<void>
  exitDemo: () => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export const useDemo = () => {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null)
  const [demoData, setDemoData] = useState<any>(null)

  useEffect(() => {
    const demoMode = sessionStorage.getItem('demo_mode') === 'true'
    const demoTier = sessionStorage.getItem('demo_tier') as 'basic' | 'standard' | 'premium'
    const demoUserData = sessionStorage.getItem('demo_user')

    if (demoMode && demoTier && demoUserData) {
      setIsDemoMode(true)
      setDemoUser(JSON.parse(demoUserData))
      generateDemoData(demoTier)
    }
  }, [])

  const generateDemoData = async (tier: 'basic' | 'standard' | 'premium') => {
    // Seed demo data in database
    const result = await seedDemoData(tier)
    if (result.success) {
      // Generate local demo data for UI
      const baseData = {
        products: generateDemoProducts(tier),
        sales: generateDemoSales(tier),
        analytics: generateDemoAnalytics(tier)
      }
      setDemoData(baseData)
    } else {
      console.error('Failed to seed demo data:', result.error)
    }
  }

  const enterDemo = async (tier: 'basic' | 'standard' | 'premium') => {
    const demoUser = demoUsers[tier]
    setDemoUser(demoUser)
    setIsDemoMode(true)
    await generateDemoData(tier)
    
    // Store in session storage
    sessionStorage.setItem('demo_mode', 'true')
    sessionStorage.setItem('demo_tier', tier)
    sessionStorage.setItem('demo_user', JSON.stringify(demoUser))
  }

  const exitDemo = () => {
    sessionStorage.removeItem('demo_mode')
    sessionStorage.removeItem('demo_tier')
    sessionStorage.removeItem('demo_user')
    setIsDemoMode(false)
    setDemoUser(null)
    setDemoData(null)
    window.location.href = '/'
  }

  const value = {
    isDemoMode,
    demoUser,
    demoData,
    enterDemo,
    exitDemo
  }

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  )
}
