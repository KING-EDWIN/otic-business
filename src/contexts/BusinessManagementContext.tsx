import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { businessManagementService, Business, BusinessMember } from '@/services/businessManagementService'
import { supabase } from '@/lib/supabaseClient'

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
  const loadedBusinessMembersRef = useRef<string | null>(null)

  // Load businesses when user changes
  useEffect(() => {
    console.log('BusinessManagementContext - useEffect triggered:', { user: !!user })
    
    if (user) {
      console.log('User available, loading businesses')
      loadBusinesses()
    } else {
      console.log('User not available, clearing businesses...')
      setBusinesses([])
      setCurrentBusiness(null)
      setBusinessMembers([])
      setLoading(false)
    }
  }, [user?.id])

  // Set current business from localStorage on mount
  useEffect(() => {
    const savedBusinessId = localStorage.getItem('current_business_id')
    if (savedBusinessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === savedBusinessId)
      if (business && (!currentBusiness || currentBusiness.id !== business.id)) {
        setCurrentBusiness(business)
        if (loadedBusinessMembersRef.current !== business.id) {
          loadBusinessMembers(business.id)
          loadedBusinessMembersRef.current = business.id
        }
      }
    } else if (businesses.length > 0 && !currentBusiness) {
      // Set first business as current if none selected
      setCurrentBusiness(businesses[0])
      if (loadedBusinessMembersRef.current !== businesses[0].id) {
        loadBusinessMembers(businesses[0].id)
        loadedBusinessMembersRef.current = businesses[0].id
      }
    } else if (businesses.length === 0 && user && profile) {
      // If no businesses found but user is authenticated, try to create a default one
      console.log('No businesses found for authenticated user, will create default business')
    }
  }, [businesses.length]) // Remove user and profile dependencies to prevent double loading

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      console.log('Loading businesses for user:', user?.id)
      
      // Get user businesses directly - no timeout complexity
      const userBusinesses = await businessManagementService.getUserBusinesses()
      console.log('Loaded businesses:', userBusinesses.length, userBusinesses)
      
      // If user has no businesses, create a default one
      if (userBusinesses.length === 0 && user) {
        console.log('No businesses found, creating default business')
        await createDefaultBusiness()
        // Reload businesses after creating default
        const updatedBusinesses = await businessManagementService.getUserBusinesses()
        console.log('Updated businesses after creation:', updatedBusinesses.length, updatedBusinesses)
        setBusinesses(updatedBusinesses)
      } else {
        setBusinesses(userBusinesses)
      }
      
      // Check if user can create more businesses
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        try {
          const { data: canCreate } = await supabase.rpc('can_create_business', {
            user_id_param: authUser.id
          })
          setCanCreateBusiness(canCreate || false)
        } catch (rpcError) {
          console.error('RPC can_create_business failed:', rpcError)
          setCanCreateBusiness(false)
        }
      }
      
      // Set current business if none selected
      if (userBusinesses.length > 0 && !currentBusiness) {
        setCurrentBusiness(userBusinesses[0])
      }
      
    } catch (error) {
      console.error('Error loading businesses:', error)
      setBusinesses([])
      setCanCreateBusiness(false)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultBusiness = async () => {
    try {
      if (!user || !profile) {
        console.log('Cannot create default business: user or profile missing', { user: !!user, profile: !!profile })
        return
      }

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

      console.log('Creating default business with data:', defaultBusinessData)
      const result = await businessManagementService.createBusiness(defaultBusinessData)
      if (result.success) {
        console.log('Default business created successfully:', result.business)
      } else {
        console.error('Failed to create default business:', result.error)
      }
    } catch (error) {
      console.error('Error creating default business:', error)
    }
  }

  const loadBusinessMembers = async (businessId: string) => {
    try {
      if (!businessId) {
        console.log('No businessId provided, skipping member load')
        setBusinessMembers([])
        return
      }
      
      console.log('Loading business members for:', businessId)
      const members = await businessManagementService.getBusinessMembers(businessId)
      console.log('Loaded business members:', members.length)
      setBusinessMembers(members)
      loadedBusinessMembersRef.current = businessId
    } catch (error) {
      console.error('Error loading business members:', error)
      
      // Handle specific RLS recursion error
      if (error instanceof Error && error.message.includes('infinite recursion')) {
        console.warn('RLS recursion detected, skipping member load')
        setBusinessMembers([])
        return
      }
      
      // Set empty array on error to prevent undefined issues
      setBusinessMembers([])
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
            loadedBusinessMembersRef.current = remainingBusinesses[0].id
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
          loadedBusinessMembersRef.current = id
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