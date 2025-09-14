import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import BusinessSwitcher from './BusinessSwitcher';
import BusinessRegistrationModal from './BusinessRegistrationModal';
import { useBusinessManagement } from '@/contexts/BusinessManagementContext';
import { useAuth } from '@/contexts/AuthContext';
import { businessService } from '@/services/businessService';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  activeUsers: number;
  recentActivity: any[];
}

export default function MultiBusinessDashboard() {
  const { user } = useAuth();
  const { currentBusiness, businesses: userBusinesses, loading, canCreateBusiness } = useBusinessManagement();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeUsers: 0,
    recentActivity: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) {
      loadBusinessStats();
    }
  }, [currentBusiness]);

  const loadBusinessStats = async () => {
    if (!currentBusiness) return;
    
    try {
      setStatsLoading(true);
      const businessStats = await businessService.getBusinessStats(currentBusiness.id);
      
      // Mock data for now - replace with actual API calls
      setStats({
        totalSales: 125000,
        totalOrders: 342,
        totalProducts: 156,
        activeUsers: businessStats.memberCount,
        recentActivity: [
          { id: 1, type: 'sale', description: 'New sale: UGX 15,000', time: '2 minutes ago' },
          { id: 2, type: 'product', description: 'Product "Laptop" added', time: '1 hour ago' },
          { id: 3, type: 'user', description: 'New team member joined', time: '3 hours ago' },
          { id: 4, type: 'sale', description: 'New sale: UGX 8,500', time: '5 hours ago' }
        ]
      });
    } catch (error) {
      console.error('Error loading business stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'product':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your businesses...</p>
        </div>
      </div>
    );
  }

  if (userBusinesses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Otic Business</h1>
            <p className="text-gray-600 mb-8">
              {canCreateBusiness 
                ? "Create your first business to get started with our comprehensive business management platform."
                : "You need Enterprise Advantage tier to create and manage multiple businesses."
              }
            </p>
            {canCreateBusiness ? (
              <BusinessRegistrationModal>
                <Button size="lg" className="bg-[#040458] hover:bg-[#faa51a] text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Business
                </Button>
              </BusinessRegistrationModal>
            ) : (
              <div className="space-y-4">
                <Button size="lg" className="bg-[#faa51a] hover:bg-[#040458] text-white">
                  Upgrade to Enterprise Advantage
                </Button>
                <p className="text-sm text-gray-500">
                  Get access to multi-business management, advanced analytics, and more
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#040458]">Business Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your businesses and track performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-[#faa51a] border-[#faa51a]">
                {userBusinesses.length} Business{userBusinesses.length !== 1 ? 'es' : ''}
              </Badge>
              {canCreateBusiness && (
                <BusinessRegistrationModal>
                  <Button className="bg-[#040458] hover:bg-[#faa51a] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Business
                  </Button>
                </BusinessRegistrationModal>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Business Switcher Sidebar */}
          <div className="lg:col-span-1">
            <BusinessSwitcher 
              currentBusinessId={currentBusiness?.id}
              onBusinessChange={(business) => {
                // Business switching is handled by the BusinessSwitcher component
              }}
            />
          </div>

          {/* Main Dashboard Content */}
          <div className="lg:col-span-3">
            {currentBusiness ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Business Info Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-[#040458]">
                            {currentBusiness.name}
                          </CardTitle>
                          <CardDescription className="text-lg">
                            {currentBusiness.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <Badge className={`${
                          currentBusiness.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentBusiness.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium">{currentBusiness.business_type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Industry:</span>
                          <p className="font-medium">{currentBusiness.industry || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Currency:</span>
                          <p className="font-medium">{currentBusiness.currency}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">
                            {currentBusiness.city && currentBusiness.country 
                              ? `${currentBusiness.city}, ${currentBusiness.country}`
                              : 'Not specified'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <DollarSign className="h-8 w-8 text-green-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Sales</p>
                            <p className="text-2xl font-bold text-[#040458]">
                              {formatCurrency(stats.totalSales, currentBusiness.currency)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <ShoppingCart className="h-8 w-8 text-blue-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold text-[#040458]">{stats.totalOrders}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Package className="h-8 w-8 text-purple-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Products</p>
                            <p className="text-2xl font-bold text-[#040458]">{stats.totalProducts}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-orange-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Team Members</p>
                            <p className="text-2xl font-bold text-[#040458]">{stats.activeUsers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-[#040458]" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3">
                            {getActivityIcon(activity.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-[#040458]" />
                        Business Analytics
                      </CardTitle>
                      <CardDescription>
                        Detailed analytics and insights for {currentBusiness.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Analytics Coming Soon</h3>
                        <p className="text-gray-500">
                          Advanced analytics and reporting features will be available here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="team">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-[#040458]" />
                        Team Management
                      </CardTitle>
                      <CardDescription>
                        Manage team members and permissions for {currentBusiness.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Team Management Coming Soon</h3>
                        <p className="text-gray-500">
                          Team management and collaboration features will be available here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-[#040458]" />
                        Business Settings
                      </CardTitle>
                      <CardDescription>
                        Configure settings and preferences for {currentBusiness.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Settings Coming Soon</h3>
                        <p className="text-gray-500">
                          Business configuration and settings will be available here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Business Selected</h3>
                  <p className="text-gray-500">
                    Please select a business from the sidebar to view its dashboard.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
