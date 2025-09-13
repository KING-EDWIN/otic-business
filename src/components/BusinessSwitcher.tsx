import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Building2, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

interface BusinessAccess {
  business_id: string;
  business_name: string;
  business_description: string;
  access_level: string;
  granted_at: string;
  is_active: boolean;
}

interface BusinessSwitcherProps {
  currentBusinessId?: string;
  onBusinessChange?: (businessId: string) => void;
}

const BusinessSwitcher: React.FC<BusinessSwitcherProps> = ({ 
  currentBusinessId, 
  onBusinessChange 
}) => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase.rpc('get_individual_businesses', {
        user_id_param: user.id
      });

      if (fetchError) {
        console.error('Error loading businesses:', fetchError);
        setError('Failed to load businesses');
        return;
      }

      setBusinesses(data || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
      setError('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelect = (businessId: string) => {
    if (onBusinessChange) {
      onBusinessChange(businessId);
    }
    // Navigate to the business dashboard
    navigate(`/business-dashboard/${businessId}`);
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full':
        return 'text-green-600 bg-green-50';
      case 'standard':
        return 'text-blue-600 bg-blue-50';
      case 'limited':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'full':
        return <CheckCircle className="h-3 w-3" />;
      case 'standard':
        return <Users className="h-3 w-3" />;
      case 'limited':
        return <Building2 className="h-3 w-3" />;
      default:
        return <Building2 className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Error loading businesses</span>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">No business access</span>
      </div>
    );
  }

  const currentBusiness = businesses.find(b => b.business_id === currentBusinessId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {currentBusiness ? currentBusiness.business_name : 'Select Business'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="text-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Your Business Access</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.business_id}
            onClick={() => handleBusinessSelect(business.business_id)}
            className="flex flex-col items-start space-y-2 p-4 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-[#040458]" />
                <span className="font-medium text-[#040458]">
                  {business.business_name}
                </span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getAccessLevelColor(business.access_level)}`}>
                {getAccessLevelIcon(business.access_level)}
                <span className="capitalize">{business.access_level}</span>
              </div>
            </div>
            
            {business.business_description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {business.business_description}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Access Level: {business.access_level}</span>
              <span>•</span>
              <span>
                Joined: {new Date(business.granted_at).toLocaleDateString()}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/individual-dashboard')}
          className="text-center text-gray-600"
        >
          Back to Individual Dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BusinessSwitcher;