import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { businessManagementService, Business, BusinessMember } from '@/services/businessManagementService'
import { supabase } from '@/lib/supabase'

interface BusinessManagementContextType {
  businesses: Business[]
  currentBusiness: Business | null
  businessMembers: BusinessMember[]
  loading: boolean
  canCreateBusiness: boolean
  createBusiness: (data: any) => Promise<{ success: boolean; error?: string }>
  updateBusiness: (id: string, data: any) => Promise<{ success: boolean; error?: string }>
  deleteBusiness: (id: string) => Promise<{ success: boolean; error?: string }>
  switchBusiness: (id: string) => Promise<{ success: boolean; error?: string }>
  inviteUser: (email: string, role: string) => Promise<{ success: boolean; error?: string }>
  removeUser: (userId: string) => Promise<{ success: boolean; error?: string }>
  updateUserRole: (userId: string, role: string) => Promise<{ success: boolean; error?: string }>
  refreshBusinesses: () => Promise<void>
  refreshMembers: () => Promise<void>
}

const BusinessManagementContext = createContext<BusinessManagementContextType | undefined>(undefined)

export const useBusinessManagement = () => {
  const context = useContext(BusinessManagementContext)
  if (context === undefined) {
    throw new Error('useBusinessManagement must be used within a BusinessManagementProvider')
  }
  return context
}

export const BusinessManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [businessMembers, setBusinessMembers] = useState<BusinessMember[]>([])
  const [loading, setLoading] = useState(true)
  const [canCreateBusiness, setCanCreateBusiness] = useState(false)

  // Load businesses when user changes
  useEffect(() => {
    if (user) {
      loadBusinesses()
    } else {
      setBusinesses([])
      setCurrentBusiness(null)
      setBusinessMembers([])
      setLoading(false)
    }
  }, [user])

  // Set current business from localStorage on mount
  useEffect(() => {
    const savedBusinessId = localStorage.getItem('current_business_id')
    if (savedBusinessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === savedBusinessId)
      if (business) {
        setCurrentBusiness(business)
        loadBusinessMembers(business.id)
      }
    } else if (businesses.length > 0) {
      // Set first business as current if none selected
      setCurrentBusiness(businesses[0])
      loadBusinessMembers(businesses[0].id)
    }
  }, [businesses])

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      const userBusinesses = await businessManagementService.getUserBusinesses()
      
      // If user has no businesses, create a default one
      if (userBusinesses.length === 0 && user) {
        console.log('No businesses found, creating default business')
        await createDefaultBusiness()
        // Reload businesses after creating default
        const updatedBusinesses = await businessManagementService.getUserBusinesses()
        setBusinesses(updatedBusinesses)
      } else {
        setBusinesses(userBusinesses)
      }
      
      // Check if user can create more businesses
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        const { data: canCreate } = await supabase.rpc('can_create_business', {
          user_id_param: currentUser.id
        })
        setCanCreateBusiness(canCreate || false)
      }
    } catch (error) {
      console.error('Error loading businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultBusiness = async () => {
    try {
      if (!user || !profile) return

      const defaultBusinessData = {
        name: profile.business_name || 'My Business',
        description: 'Your main business account',
        business_type: 'retail',
        industry: 'general',
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: 'Kampala',
        country: 'Uganda'
      }

      const result = await businessManagementService.createBusiness(defaultBusinessData)
      if (result.success) {
        console.log('Default business created successfully')
      } else {
        console.error('Failed to create default business:', result.error)
      }
    } catch (error) {
      console.error('Error creating default business:', error)
    }
  }

  const loadBusinessMembers = async (businessId: string) => {
    try {
      const members = await businessManagementService.getBusinessMembers(businessId)
      setBusinessMembers(members)
    } catch (error) {
      console.error('Error loading business members:', error)
    }
  }

  const createBusiness = async (data: any) => {
    try {
      const result = await businessManagementService.createBusiness(data)
      if (result.success) {
        await loadBusinesses()
        if (result.business) {
          setCurrentBusiness(result.business)
          localStorage.setItem('current_business_id', result.business.id)
        }
      }
      return result
    } catch (error) {
      console.error('Error creating business:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const updateBusiness = async (id: string, data: any) => {
    try {
      const result = await businessManagementService.updateBusiness(id, data)
      if (result.success) {
        await loadBusinesses()
        // Update current business if it's the one being updated
        if (currentBusiness?.id === id) {
          const updatedBusiness = businesses.find(b => b.id === id)
          if (updatedBusiness) {
            setCurrentBusiness(updatedBusiness)
          }
        }
      }
      return result
    } catch (error) {
      console.error('Error updating business:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const deleteBusiness = async (id: string) => {
    try {
      const result = await businessManagementService.deleteBusiness(id)
      if (result.success) {
        await loadBusinesses()
        // If we deleted the current business, switch to another one
        if (currentBusiness?.id === id) {
          if (businesses.length > 1) {
            const remainingBusinesses = businesses.filter(b => b.id !== id)
            setCurrentBusiness(remainingBusinesses[0])
            localStorage.setItem('current_business_id', remainingBusinesses[0].id)
            loadBusinessMembers(remainingBusinesses[0].id)
          } else {
            setCurrentBusiness(null)
            setBusinessMembers([])
            localStorage.removeItem('current_business_id')
          }
        }
      }
      return result
    } catch (error) {
      console.error('Error deleting business:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const switchBusiness = async (id: string) => {
    try {
      const result = await businessManagementService.switchBusinessContext(id)
      if (result.success) {
        const business = businesses.find(b => b.id === id)
        if (business) {
          setCurrentBusiness(business)
          localStorage.setItem('current_business_id', id)
          await loadBusinessMembers(id)
        }
      }
      return result
    } catch (error) {
      console.error('Error switching business:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const inviteUser = async (email: string, role: string) => {
    if (!currentBusiness) {
      return { success: false, error: 'No business selected' }
    }

    try {
      const result = await businessManagementService.inviteUserToBusiness(
        currentBusiness.id,
        email,
        role as any
      )
      if (result.success) {
        await loadBusinesses()
      }
      return result
    } catch (error) {
      console.error('Error inviting user:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const removeUser = async (userId: string) => {
    if (!currentBusiness) {
      return { success: false, error: 'No business selected' }
    }

    try {
      const result = await businessManagementService.removeUserFromBusiness(
        currentBusiness.id,
        userId
      )
      if (result.success) {
        await loadBusinessMembers(currentBusiness.id)
      }
      return result
    } catch (error) {
      console.error('Error removing user:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    if (!currentBusiness) {
      return { success: false, error: 'No business selected' }
    }

    try {
      const result = await businessManagementService.updateUserRole(
        currentBusiness.id,
        userId,
        role as any
      )
      if (result.success) {
        await loadBusinessMembers(currentBusiness.id)
      }
      return result
    } catch (error) {
      console.error('Error updating user role:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const refreshBusinesses = async () => {
    await loadBusinesses()
  }

  const refreshMembers = async () => {
    if (currentBusiness) {
      await loadBusinessMembers(currentBusiness.id)
    }
  }

  const value = {
    businesses,
    currentBusiness,
    businessMembers,
    loading,
    canCreateBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    switchBusiness,
    inviteUser,
    removeUser,
    updateUserRole,
    refreshBusinesses,
    refreshMembers
  }

  return (
    <BusinessManagementContext.Provider value={value}>
      {children}
    </BusinessManagementContext.Provider>
  )
}
