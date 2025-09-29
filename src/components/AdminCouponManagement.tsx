import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Copy, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface Coupon {
  id: string;
  code: string;
  tier: string;
  description: string | null;
  is_active: boolean;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  created_by: string | null;
  expires_at: string | null;
}

const AdminCouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    tier: '',
    description: '',
    expiresAt: ''
  });

  const tiers = [
    { value: 'basic', label: 'Basic' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure all coupons have required fields
      const validCoupons = (data || []).map(coupon => ({
        ...coupon,
        tier: coupon.tier || 'unknown',
        code: coupon.code || 'N/A',
        description: coupon.description || null,
        is_active: coupon.is_active ?? true,
        is_used: coupon.is_used ?? false,
        used_by: coupon.used_by || null,
        used_at: coupon.used_at || null,
        created_by: coupon.created_by || null,
        expires_at: coupon.expires_at || null
      }));
      
      setCoupons(validCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
      setCoupons([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async () => {
    if (!newCoupon.tier) {
      toast.error('Please select a tier');
      return;
    }

    try {
      setCreating(true);
      const { data, error } = await supabase.rpc('create_coupon', {
        p_tier: newCoupon.tier,
        p_description: newCoupon.description || null,
        p_expires_at: newCoupon.expiresAt ? new Date(newCoupon.expiresAt).toISOString() : null,
        p_created_by: null
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const createdCoupon = data[0];
        toast.success(`Coupon created: ${createdCoupon.code}`);
        setNewCoupon({ tier: '', description: '', expiresAt: '' });
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard');
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (coupon.is_used) {
      return <Badge variant="default" className="bg-green-500">Used</Badge>;
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="outline">Available</Badge>;
  };

  const getTierBadge = (tier: string) => {
    if (!tier) {
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
    
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      standard: 'bg-green-100 text-green-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#040458]">Coupon Management</h2>
          <p className="text-gray-600">Create and manage tier upgrade coupons</p>
        </div>
        <Button onClick={fetchCoupons} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Create New Coupon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Coupon</span>
          </CardTitle>
          <CardDescription>
            Generate a new 5-digit coupon code for tier upgrades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select value={newCoupon.tier} onValueChange={(value) => setNewCoupon(prev => ({ ...prev, tier: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={newCoupon.expiresAt}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Coupon description"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={createCoupon} disabled={creating || !newCoupon.tier}>
            {creating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>All Coupons ({coupons.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading coupons...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyCouponCode(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(coupon.tier || 'unknown')}</TableCell>
                      <TableCell>{getStatusBadge(coupon)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {coupon.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{coupon.created_at ? new Date(coupon.created_at).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.expires_at ? (
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {coupon.is_used ? (
                          <div className="flex items-center space-x-1 text-sm text-green-600">
                            <User className="h-3 w-3" />
                            <span>Used</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCouponManagement;
