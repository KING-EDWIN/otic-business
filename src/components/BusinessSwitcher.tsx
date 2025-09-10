import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Settings, 
  Users, 
  BarChart3, 
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { businessService, Business } from '@/services/businessService';
import { useAuth } from '@/contexts/AuthContext';
import BusinessRegistrationModal from './BusinessRegistrationModal';
import { toast } from 'sonner';

interface BusinessSwitcherProps {
  currentBusinessId?: string;
  onBusinessChange?: (business: Business) => void;
  className?: string;
}

export default function BusinessSwitcher({ 
  currentBusinessId, 
  onBusinessChange, 
  className = '' 
}: BusinessSwitcherProps) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [canCreateBusiness, setCanCreateBusiness] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserBusinesses();
      checkBusinessCreationPermission();
    }
  }, [user]);

  useEffect(() => {
    if (currentBusinessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === currentBusinessId);
      if (business) {
        setCurrentBusiness(business);
      }
    } else if (businesses.length > 0 && !currentBusiness) {
      // Set first business as current if none selected
      setCurrentBusiness(businesses[0]);
      onBusinessChange?.(businesses[0]);
    }
  }, [currentBusinessId, businesses]);

  const loadUserBusinesses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userBusinesses = await businessService.getUserBusinesses(user.id);
      setBusinesses(userBusinesses);
    } catch (error) {
      console.error('Error loading user businesses:', error);
      toast.error('Failed to load businesses');
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

  const handleBusinessSwitch = async (business: Business) => {
    if (!user) return;
    
    try {
      setSwitching(true);
      await businessService.switchBusinessContext(business.id, user.id);
      setCurrentBusiness(business);
      onBusinessChange?.(business);
      toast.success(`Switched to ${business.name}`);
    } catch (error) {
      console.error('Error switching business:', error);
      toast.error('Failed to switch business');
    } finally {
      setSwitching(false);
    }
  };

  const handleBusinessCreated = (newBusiness: Business) => {
    setBusinesses(prev => [newBusiness, ...prev]);
    setCurrentBusiness(newBusiness);
    onBusinessChange?.(newBusiness);
  };

  const getBusinessInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBusinessTypeColor = (businessType: string) => {
    const colors: Record<string, string> = {
      retail: 'bg-blue-100 text-blue-800',
      restaurant: 'bg-orange-100 text-orange-800',
      service: 'bg-green-100 text-green-800',
      manufacturing: 'bg-purple-100 text-purple-800',
      ecommerce: 'bg-pink-100 text-pink-800',
      wholesale: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[businessType] || colors.other;
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading businesses...</span>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Businesses Found</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              {canCreateBusiness 
                ? "Create your first business to get started with Otic Business."
                : "You need Enterprise Advantage tier to create multiple businesses."
              }
            </p>
            {canCreateBusiness ? (
              <BusinessRegistrationModal onBusinessCreated={handleBusinessCreated}>
                <Button className="bg-[#040458] hover:bg-[#faa51a] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Business
                </Button>
              </BusinessRegistrationModal>
            ) : (
              <Button className="bg-[#faa51a] hover:bg-[#040458] text-white">
                Upgrade to Enterprise Advantage
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Business Display */}
      {currentBusiness && (
        <Card className="border-[#040458]/20 bg-gradient-to-r from-[#040458]/5 to-[#faa51a]/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentBusiness.logo_url} />
                <AvatarFallback className="bg-[#040458] text-white">
                  {getBusinessInitials(currentBusiness.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#040458] truncate">
                  {currentBusiness.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getBusinessTypeColor(currentBusiness.business_type)}`}>
                    {currentBusiness.business_type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {currentBusiness.city && currentBusiness.country 
                      ? `${currentBusiness.city}, ${currentBusiness.country}`
                      : 'Location not set'
                    }
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[#faa51a] border-[#faa51a]">
                Current
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Switcher */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Switch Business</h4>
          {canCreateBusiness && (
            <BusinessRegistrationModal onBusinessCreated={handleBusinessCreated}>
              <Button size="sm" variant="outline" className="text-[#040458] border-[#040458] hover:bg-[#040458] hover:text-white">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </BusinessRegistrationModal>
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {businesses.map((business) => (
            <Card 
              key={business.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                currentBusiness?.id === business.id 
                  ? 'ring-2 ring-[#faa51a] bg-[#faa51a]/5' 
                  : 'hover:border-[#040458]/30'
              }`}
              onClick={() => handleBusinessSwitch(business)}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={business.logo_url} />
                    <AvatarFallback className="bg-[#040458] text-white text-xs">
                      {getBusinessInitials(business.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-sm truncate">
                        {business.name}
                      </h5>
                      {currentBusiness?.id === business.id && (
                        <Check className="h-3 w-3 text-[#faa51a]" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getBusinessTypeColor(business.business_type)}`}>
                        {business.business_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {business.status === 'active' ? 'Active' : business.status}
                      </span>
                    </div>
                  </div>
                  {switching && currentBusiness?.id === business.id && (
                    <Loader2 className="h-3 w-3 animate-spin text-[#faa51a]" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Stats */}
      {currentBusiness && (
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-[#040458]">
                  {businesses.length}
                </div>
                <div className="text-xs text-gray-500">Total Businesses</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-[#faa51a]">
                  {currentBusiness.currency}
                </div>
                <div className="text-xs text-gray-500">Currency</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
