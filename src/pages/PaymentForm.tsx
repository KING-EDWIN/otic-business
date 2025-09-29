import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface TierDetails {
  name: string;
  price: string;
  period: string;
  description: string;
}

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValid, setCouponValid] = useState(false);
  const [couponDetails, setCouponDetails] = useState<any>(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);

  // Get tier details from navigation state
  const tierDetails: TierDetails = location.state?.tierDetails || {
    name: 'Start Smart',
    price: '1,000,000 UGX',
    period: 'Per Month',
    description: 'Perfect for small businesses starting their digital transformation'
  };

  const handleCouponVerification = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (couponCode.length !== 5) {
      toast.error('Coupon code must be exactly 5 digits');
      return;
    }

    setVerifyingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_used', false)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Invalid or expired coupon code');
        setCouponValid(false);
        setCouponDetails(null);
      } else {
        setCouponValid(true);
        setCouponDetails(data);
        toast.success('Coupon code verified successfully!');
      }
    } catch (error) {
      console.error('Error verifying coupon:', error);
      toast.error('Error verifying coupon code');
      setCouponValid(false);
      setCouponDetails(null);
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const handlePayment = async () => {
    if (!couponValid || !couponDetails) {
      toast.error('Please verify a valid coupon code first');
      return;
    }

    setLoading(true);
    try {
      // Update user tier
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          tier: couponDetails.tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) {
        throw profileError;
      }

      // Mark coupon as used
      const { error: couponError } = await supabase
        .from('coupons')
        .update({ 
          is_used: true,
          used_by: user?.id,
          used_at: new Date().toISOString()
        })
        .eq('code', couponCode);

      if (couponError) {
        throw couponError;
      }

      toast.success('Payment successful! Your account has been upgraded.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlutterwavePayment = () => {
    toast.info('Flutterwave integration is currently disabled. Please use a coupon code instead.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Complete Payment</h1>
                <p className="text-gray-600">Upgrade your account to {tierDetails.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Tier Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Selected Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#040458]">{tierDetails.name}</h3>
                  <p className="text-gray-600">{tierDetails.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#faa51a]">{tierDetails.price}</div>
                  <div className="text-sm text-gray-500">{tierDetails.period}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Options</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coupon Payment */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">Coupon Code</h3>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter 5-digit coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      maxLength={5}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCouponVerification}
                      disabled={verifyingCoupon || !couponCode.trim()}
                      variant="outline"
                    >
                      {verifyingCoupon ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  
                  {couponValid && couponDetails && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-800">Coupon Verified</span>
                      </div>
                      <p className="text-sm text-green-700">
                        This coupon will upgrade you to: <strong>{couponDetails.tier}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Flutterwave Payment */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">Flutterwave Payment</h3>
                  <Badge variant="outline" className="text-gray-500">Coming Soon</Badge>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">Payment Integration Disabled</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Flutterwave payment integration is currently being set up. Please use a coupon code for now.
                  </p>
                  <Button
                    onClick={handleFlutterwavePayment}
                    disabled={true}
                    className="w-full"
                    variant="outline"
                  >
                    Pay with Flutterwave (Disabled)
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handlePayment}
                  disabled={!couponValid || loading}
                  className="flex-1 bg-[#040458] hover:bg-[#faa51a] text-white"
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
