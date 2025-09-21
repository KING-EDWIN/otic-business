import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { NetworkErrorHandler } from '@/services/networkErrorHandler';
import { toast } from 'sonner';

interface AuthErrorRecoveryProps {
  error: any;
  onRetry: () => void;
  onSignInAgain: () => void;
  className?: string;
}

export const AuthErrorRecovery: React.FC<AuthErrorRecoveryProps> = ({
  error,
  onRetry,
  onSignInAgain,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check initial network status
    setNetworkStatus(NetworkErrorHandler.isOnline() ? 'online' : 'offline');

    // Listen for network changes
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const analyzeError = () => {
    return NetworkErrorHandler.handleAuthError(error);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Wait for network if offline
      if (networkStatus === 'offline') {
        const connected = await NetworkErrorHandler.waitForConnection(10000);
        if (!connected) {
          toast.error('Still offline. Please check your internet connection.');
          setIsRetrying(false);
          return;
        }
        setNetworkStatus('online');
      }

      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
      toast.error('Retry failed. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const errorInfo = analyzeError();

  const getStatusIcon = () => {
    switch (networkStatus) {
      case 'online':
        return <Wifi className="h-5 w-5 text-green-600" />;
      case 'offline':
        return <WifiOff className="h-5 w-5 text-red-600" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-yellow-600 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (networkStatus) {
      case 'online':
        return 'Connected';
      case 'offline':
        return 'Offline';
      case 'checking':
        return 'Checking...';
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-50 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-red-600">Authentication Failed</CardTitle>
        <CardDescription className="text-gray-600">
          {errorInfo.userMessage}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Network Status</span>
          </div>
          <span className={`text-sm font-medium ${
            networkStatus === 'online' ? 'text-green-600' : 
            networkStatus === 'offline' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {getStatusText()}
          </span>
        </div>

        {/* Error Details */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Error Type:</strong> {errorInfo.action === 'retry' ? 'Network Issue' : 'Authentication Issue'}</p>
              <p><strong>Suggested Action:</strong> {errorInfo.action === 'retry' ? 'Try again' : 'Sign in again'}</p>
              {retryCount > 0 && (
                <p><strong>Retry Attempts:</strong> {retryCount}</p>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="space-y-3">
          {errorInfo.shouldRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying || networkStatus === 'offline'}
              className="w-full"
              variant="default"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}

          <Button
            onClick={onSignInAgain}
            variant="outline"
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Sign In Again
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          {networkStatus === 'offline' ? (
            <p>Please check your internet connection and try again.</p>
          ) : errorInfo.action === 'retry' ? (
            <p>This appears to be a temporary network issue. Try again in a moment.</p>
          ) : (
            <p>If the problem persists, please contact support.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
