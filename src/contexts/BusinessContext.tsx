import React, { createContext, useContext, useEffect, useState } from 'react';
import { businessService, Business } from '@/services/businessService';
import { useAuth } from './AuthContext';

interface BusinessContextType {
  currentBusiness: Business | null;
  userBusinesses: Business[];
  loading: boolean;
  switchBusiness: (business: Business) => Promise<void>;
  refreshBusinesses: () => Promise<void>;
  canCreateBusiness: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreateBusiness, setCanCreateBusiness] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserBusinesses();
      checkBusinessCreationPermission();
    } else {
      setCurrentBusiness(null);
      setUserBusinesses([]);
      setCanCreateBusiness(false);
      setLoading(false);
    }
  }, [user]);

  const loadUserBusinesses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const businesses = await businessService.getUserBusinesses(user.id);
      setUserBusinesses(businesses);
      
      // Set first business as current if none selected
      if (businesses.length > 0 && !currentBusiness) {
        setCurrentBusiness(businesses[0]);
      }
    } catch (error) {
      console.error('Error loading user businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBusinessCreationPermission = async () => {
    if (!user) return;
    
    try {
      const canCreate = await businessService.canCreateBusiness(user.id);
      setCanCreateBusiness(canCreate);
    } catch (error) {
      console.error('Error checking business creation permission:', error);
    }
  };

  const switchBusiness = async (business: Business) => {
    if (!user) return;
    
    try {
      await businessService.switchBusinessContext(business.id, user.id);
      setCurrentBusiness(business);
    } catch (error) {
      console.error('Error switching business:', error);
      throw error;
    }
  };

  const refreshBusinesses = async () => {
    await loadUserBusinesses();
  };

  const value: BusinessContextType = {
    currentBusiness,
    userBusinesses,
    loading,
    switchBusiness,
    refreshBusinesses,
    canCreateBusiness
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
