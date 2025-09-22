import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthErrorRecovery } from '@/components/AuthErrorRecovery';
import { AuthStatusIndicator } from '@/components/AuthStatusIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthService } from '@/services/googleAuthService';
import { NetworkErrorHandler } from '@/services/networkErrorHandler';
import { toast } from 'sonner';
import { ArrowLeft, TestTube, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testError, setTestError] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test form data
  const [testFormData, setTestFormData] = useState({
    email: 'test@example.com',
    password: 'testpassword123',
    businessName: 'Test Business'
  });

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }));
    
    try {
      await testFn();
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
      toast.success(`${testName} test passed!`);
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
      setTestError(error);
      toast.error(`${testName} test failed!`);
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults({});
    setTestError(null);

    // Test 1: Network connectivity
    await runTest('Network Connectivity', async () => {
      if (!NetworkErrorHandler.isOnline()) {
        throw new Error('Device is offline');
      }
    });

    // Test 2: Supabase connection
    await runTest('Supabase Connection', async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { error } = await supabase.auth.getSession();
      if (error && error.message.includes('network')) {
        throw error;
      }
    });

    // Test 3: Input sanitization
    await runTest('Input Sanitization', async () => {
      const { InputSanitizationService } = await import('@/services/inputSanitizationService');
      const emailResult = InputSanitizationService.sanitizeEmail('test@example.com');
      const passwordResult = InputSanitizationService.sanitizePassword('testpassword123');
      const businessResult = InputSanitizationService.sanitizeBusinessName('Test Business');
      
      if (!emailResult.isValid || !passwordResult.isValid || !businessResult.isValid) {
        throw new Error('Input sanitization failed');
      }
    });

    // Test 4: CSRF token generation
    await runTest('CSRF Token Generation', async () => {
      const { CSRFTokenService } = await import('@/services/csrfService');
      const token = CSRFTokenService.generateToken();
      if (!token || token.length < 10) {
        throw new Error('CSRF token generation failed');
      }
    });

    // Test 5: Google Auth service
    await runTest('Google Auth Service', async () => {
      // Just test that the service can be imported and instantiated
      const service = GoogleAuthService;
      if (!service) {
        throw new Error('Google Auth Service not available');
      }
    });

    setIsRunningTests(false);
  };

  const testSignIn = async () => {
    try {
      const result = await signIn(testFormData.email, testFormData.password, 'business');
      if (result.error) {
        toast.error(`Sign in failed: ${result.error.message}`);
      } else {
        toast.success('Sign in test successful!');
      }
    } catch (error) {
      toast.error('Sign in test failed!');
    }
  };

  const testSignUp = async () => {
    try {
      const result = await signUp(testFormData.email, testFormData.password, testFormData.businessName, 'business');
      if (result.error) {
        toast.error(`Sign up failed: ${result.error.message}`);
      } else {
        toast.success('Sign up test successful!');
      }
    } catch (error) {
      toast.error('Sign up test failed!');
    }
  };

  const testGoogleAuth = async () => {
    try {
      const result = await GoogleAuthService.initiateGoogleAuth({
        userType: 'business',
        showToast: true
      });
      
      if (!result.success) {
        toast.error(`Google auth failed: ${result.error}`);
      } else {
        toast.success('Google auth initiated successfully!');
      }
    } catch (error) {
      toast.error('Google auth test failed!');
    }
  };

  const getTestIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="bg-white/90 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <TestTube className="h-6 w-6 text-white" />
              <h1 className="text-2xl font-bold text-white">Authentication Test Suite</h1>
            </div>
          </div>
          <AuthStatusIndicator showDetails={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>
                Run comprehensive authentication tests to verify system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runAllTests}
                disabled={isRunningTests}
                className="w-full"
              >
                {isRunningTests ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>

              {/* Test Results */}
              <div className="space-y-2">
                <h3 className="font-medium">Test Results:</h3>
                {Object.entries(testResults).map(([testName, status]) => (
                  <div key={testName} className="flex items-center space-x-2">
                    {getTestIcon(status)}
                    <span className="text-sm">{testName}</span>
                  </div>
                ))}
              </div>

              {/* Error Recovery */}
              {testError && (
                <AuthErrorRecovery
                  error={testError}
                  onRetry={() => runAllTests()}
                  onSignInAgain={() => navigate('/login-type')}
                />
              )}
            </CardContent>
          </Card>

          {/* Authentication Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Tests</CardTitle>
              <CardDescription>
                Test individual authentication functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="google">Google</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Email</Label>
                    <Input
                      id="test-email"
                      type="email"
                      value={testFormData.email}
                      onChange={(e) => setTestFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-password">Password</Label>
                    <Input
                      id="test-password"
                      type="password"
                      value={testFormData.password}
                      onChange={(e) => setTestFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <Button onClick={testSignIn} className="w-full">
                    Test Sign In
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={testFormData.email}
                      onChange={(e) => setTestFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={testFormData.password}
                      onChange={(e) => setTestFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-business">Business Name</Label>
                    <Input
                      id="signup-business"
                      value={testFormData.businessName}
                      onChange={(e) => setTestFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    />
                  </div>
                  <Button onClick={testSignUp} className="w-full">
                    Test Sign Up
                  </Button>
                </TabsContent>

                <TabsContent value="google" className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      This will initiate the Google OAuth flow. Make sure you have Google OAuth configured in Supabase.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={testGoogleAuth} className="w-full">
                    Test Google Authentication
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Current Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">User Status</div>
                <div className="font-medium">
                  {loading ? 'Loading...' : user ? 'Signed In' : 'Not Signed In'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Profile Status</div>
                <div className="font-medium">
                  {profile ? 'Profile Loaded' : 'No Profile'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">User Type</div>
                <div className="font-medium">
                  {profile?.user_type || 'Unknown'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <AuthStatusIndicator showDetails={true} />
      </div>
    </div>
  );
};

export default AuthTestPage;

