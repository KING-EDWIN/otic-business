import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Database, 
  Mail, 
  Wifi, 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw
} from 'lucide-react'
import SystemHealthService, { SystemHealth } from '@/services/systemHealthService'

interface SystemStatusWidgetProps {
  compact?: boolean
  onOpenHealthMonitor?: () => void
}

const SystemStatusWidget: React.FC<SystemStatusWidgetProps> = ({ 
  compact = false, 
  onOpenHealthMonitor 
}) => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Get initial health status
    refreshHealth()

    // Subscribe to health updates
    const unsubscribe = SystemHealthService.onHealthUpdate((healthData) => {
      setHealth(healthData)
    })

    return unsubscribe
  }, [])

  const refreshHealth = async () => {
    setIsRefreshing(true)
    try {
      const healthData = await SystemHealthService.triggerHealthCheck()
      setHealth(healthData)
    } catch (error) {
      console.error('Failed to refresh health:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthPercentage = (health: SystemHealth) => {
    const services = Object.values(health).filter(h => h.status !== 'unknown')
    const healthyCount = services.filter(h => h.status === 'healthy').length
    return Math.round((healthyCount / services.length) * 100)
  }

  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">System Health</div>
                <div className="text-sm text-blue-700">
                  {health ? `${getHealthPercentage(health)}% Healthy` : 'Checking...'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {health && getStatusIcon(health.overall.status)}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshHealth}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>System Status</span>
          {health && (
            <Badge className={getStatusColor(health.overall.status)}>
              {health.overall.status.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshHealth}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {onOpenHealthMonitor && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHealthMonitor}
            >
              View Details
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {health ? (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {getHealthPercentage(health)}%
              </div>
              <div className="text-sm text-gray-600">Overall Health</div>
              <div className="text-xs text-gray-500 mt-1">
                {health.overall.message}
              </div>
            </div>

            {/* Service Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(health).filter(([key]) => key !== 'overall').map(([service, status]) => (
                <div key={service} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-1">
                    {service === 'database' && <Database className="h-3 w-3" />}
                    {service === 'smtp' && <Mail className="h-3 w-3" />}
                    {service === 'network' && <Wifi className="h-3 w-3" />}
                    {service === 'api' && <Server className="h-3 w-3" />}
                    {service === 'storage' && <Server className="h-3 w-3" />}
                    {service === 'auth' && <Server className="h-3 w-3" />}
                    {service === 'realtime' && <Activity className="h-3 w-3" />}
                    {getStatusIcon(status.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium capitalize truncate">
                      {service}
                    </div>
                    <div className="text-xs text-gray-500">
                      {status.responseTime ? `${status.responseTime}ms` : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {Object.values(health).filter(h => h.status === 'healthy').length}
                </div>
                <div className="text-xs text-gray-600">Healthy</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {Object.values(health).filter(h => h.status === 'warning').length}
                </div>
                <div className="text-xs text-gray-600">Warning</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {Object.values(health).filter(h => h.status === 'error').length}
                </div>
                <div className="text-xs text-gray-600">Error</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Loading system status...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SystemStatusWidget
