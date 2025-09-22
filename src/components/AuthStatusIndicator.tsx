import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { NetworkErrorHandler } from '@/services/networkErrorHandler';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface AuthStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  onStatusChange?: (status: 'connected' | 'disconnected' | 'error') => void;
}

export const AuthStatusIndicator: React.FC<AuthStatusIndicatorProps> = ({
  className = '',
  showDetails = false,
  onStatusChange
}) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error' | 'checking'>('checking');
  const [isOnline, setIsOnline] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setLastChecked(new Date());

      // Check network connectivity
      if (!NetworkErrorHandler.isOnline()) {
        setIsOnline(false);
        setStatus('disconnected');
        setErrorMessage('No internet connection');
        onStatusChange?.('disconnected');
        return;
      }

      setIsOnline(true);

      // Test Supabase connection
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        const errorInfo = NetworkErrorHandler.handleAuthError(error);
        setStatus('error');
        setErrorMessage(errorInfo.userMessage);
        onStatusChange?.('error');
      } else {
        setStatus('connected');
        setErrorMessage('');
        onStatusChange?.('connected');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Connection test failed');
      onStatusChange?.('error');
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    // Listen for network changes
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus('disconnected');
      setErrorMessage('No internet connection');
      onStatusChange?.('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onStatusChange]);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      case 'checking':
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'checking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getStatusIcon()}
        <Badge variant="outline" className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`w-full max-w-sm ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">Connection Status</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkConnection}
              disabled={status === 'checking'}
            >
              <RefreshCw className={`h-4 w-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Status Badge */}
          <Badge variant="outline" className={`w-full justify-center ${getStatusColor()}`}>
            {getStatusText()}
          </Badge>

          {/* Network Status */}
          <div className="flex items-center justify-between text-sm">
            <span>Network:</span>
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {errorMessage}
            </div>
          )}

          {/* Last Checked */}
          <div className="text-xs text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

