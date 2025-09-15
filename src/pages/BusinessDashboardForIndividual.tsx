import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import BusinessSwitcher from '@/components/BusinessSwitcher';

interface BusinessInfo {
  id: string;
  name: string;
  description: string;
  business_type: string;
  industry: string;
}

interface UserPermissions {
  page_name: string;
  page_path: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface BusinessStats {
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_sales_today: number;
}

const BusinessDashboardForIndividual: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions[]>([]);
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (businessId) {
      loadBusinessData();
    }
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Load business info
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, description, business_type, industry')
        .eq('id', businessId)
        .single();

      if (businessError) {
        console.error('Error loading business:', businessError);
        setError('Business not found or access denied');
        return;
      }

      setBusinessInfo(businessData);

      // Load user permissions
      const { data: permissionsData, error: permissionsError } = await supabase.rpc(
        'get_user_business_permissions',
        {
          user_id_param: user.id,
          business_id_param: businessId
        }
      );

      if (permissionsError) {
        console.error('Error loading permissions:', permissionsError);
        setError('Failed to load permissions');
        return;
      }

      setPermissions(permissionsData || []);

      // Load business stats (if user has permission)
      if (permissionsData?.some(p => p.page_name === 'Dashboard' && p.can_view)) {
        await loadBusinessStats();
      }
    } catch (error) {
      console.error('Error loading business data:', error);
      setError('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessStats = async () => {
    try {
      // Load basic stats
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('current_stock, min_stock')
        .eq('business_id', businessId);

      if (productsError) {
        console.error('Error loading products:', productsError);
        return;
      }

      const totalProducts = productsData?.length || 0;
      const lowStockProducts = productsData?.filter(p => (p.current_stock || 0) <= (p.min_stock || 0)).length || 0;
      const outOfStockProducts = productsData?.filter(p => (p.current_stock || 0) <= 0).length || 0;

      setStats({
        total_products: totalProducts,
        low_stock_products: lowStockProducts,
        out_of_stock_products: outOfStockProducts,
        total_sales_today: 0 // This would need to be calculated from sales data
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handlePageNavigation = (pagePath: string) => {
    navigate(pagePath);
  };

  const getPermissionIcon = (permission: UserPermissions) => {
    if (permission.can_edit) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (permission.can_view) return <Shield className="h-4 w-4 text-blue-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getPermissionBadge = (permission: UserPermissions) => {
    if (permission.can_edit) return <Badge className="bg-green-100 text-green-800">Full Access</Badge>;
    if (permission.can_view) return <Badge className="bg-blue-100 text-blue-800">View Only</Badge>;
    return <Badge className="bg-red-100 text-red-800">No Access</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/individual-dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Individual Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">{businessInfo?.name}</h1>
                <p className="text-sm text-gray-600">{businessInfo?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BusinessSwitcher currentBusinessId={businessId} />
              <Button
                variant="outline"
                onClick={() => navigate('/individual-dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Personal</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.low_stock_products}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.out_of_stock_products}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Sales Today</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.total_sales_today.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accessible Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Your Access Permissions</span>
              </CardTitle>
              <CardDescription>
                Pages you can access in this business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permissions.map((permission) => (
                  <div key={permission.page_name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getPermissionIcon(permission)}
                      <div>
                        <p className="font-medium">{permission.page_name}</p>
                        <p className="text-sm text-gray-600">{permission.page_path}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPermissionBadge(permission)}
                      {permission.can_view && (
                        <Button
                          size="sm"
                          onClick={() => handlePageNavigation(permission.page_path)}
                          className="bg-[#faa51a] hover:bg-[#040458] text-white"
                        >
                          Access
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Business Information</span>
              </CardTitle>
              <CardDescription>
                Details about this business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Business Type</p>
                  <p className="text-lg font-semibold text-gray-900">{businessInfo?.business_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="text-lg font-semibold text-gray-900">{businessInfo?.industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-900">{businessInfo?.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardForIndividual;

