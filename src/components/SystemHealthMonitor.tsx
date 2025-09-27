import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Database, 
  Mail, 
  Wifi, 
  Server, 
  HardDrive, 
  Shield, 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Activity,
  TrendingUp,
  Globe
} from 'lucide-react'
import SystemHealthService, { SystemHealth, HealthStatus } from '@/services/systemHealthService'

interface SystemHealthMonitorProps {
  isOpen: boolean
  onClose: () => void
}

const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      startMonitoring()
    } else {
      stopMonitoring()
    }

    return () => {
      stopMonitoring()
    }
  }, [isOpen])

  const startMonitoring = () => {
    setIsMonitoring(true)
    SystemHealthService.startMonitoring()
    
    const unsubscribe = SystemHealthService.onHealthUpdate((healthData) => {
      setHealth(healthData)
      setLastUpdate(new Date())
    })

    return unsubscribe
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    SystemHealthService.stopMonitoring()
  }

  const refreshHealth = async () => {
    setIsRefreshing(true)
    try {
      const healthData = await SystemHealthService.triggerHealthCheck()
      setHealth(healthData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to refresh health:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'database':
        return <Database className="h-5 w-5" />
      case 'smtp':
        return <Mail className="h-5 w-5" />
      case 'network':
        return <Wifi className="h-5 w-5" />
      case 'api':
        return <Server className="h-5 w-5" />
      case 'storage':
        return <HardDrive className="h-5 w-5" />
      case 'auth':
        return <Shield className="h-5 w-5" />
      case 'realtime':
        return <Zap className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const formatResponseTime = (time?: number) => {
    if (!time) return 'N/A'
    return `${time}ms`
  }

  const getHealthPercentage = (health: SystemHealth) => {
    const services = Object.values(health).filter(h => h.status !== 'unknown')
    const healthyCount = services.filter(h => h.status === 'healthy').length
    return Math.round((healthyCount / services.length) * 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Health Monitor</span>
            {isMonitoring && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live
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
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {health ? (
            <div className="space-y-6">
              {/* Overall System Status */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(health.overall.status)}
                      <div>
                        <h3 className="text-lg font-semibold">Overall System Health</h3>
                        <p className="text-sm text-gray-600">{health.overall.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {getHealthPercentage(health)}%
                      </div>
                      <div className="text-sm text-gray-500">Health Score</div>
                    </div>
                  </div>
                  <Progress 
                    value={getHealthPercentage(health)} 
                    className="h-2"
                  />
                </CardContent>
              </Card>

              {/* Service Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(health).filter(([key]) => key !== 'overall').map(([service, status]) => (
                  <Card key={service} className={`border-2 ${getStatusColor(status.status)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getServiceIcon(service)}
                          <span className="font-medium capitalize">{service}</span>
                        </div>
                        {getStatusIcon(status.status)}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm">{status.message}</p>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Response: {formatResponseTime(status.responseTime)}</span>
                          <span>{new Date(status.lastChecked).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {status.details && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <ScrollArea className="h-20">
                            <div className="text-xs space-y-1">
                              {Object.entries(status.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-500">{key}:</span>
                                  <span className="font-mono">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {health.database.responseTime || 0}ms
                      </div>
                      <div className="text-sm text-gray-600">Database Response</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {health.network.responseTime || 0}ms
                      </div>
                      <div className="text-sm text-gray-600">Network Latency</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {health.api.responseTime || 0}ms
                      </div>
                      <div className="text-sm text-gray-600">API Response</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Environment</h4>
                      <div className="space-y-1 text-gray-600">
                        <div>Environment: {import.meta.env.MODE}</div>
                        <div>Version: {import.meta.env.VITE_APP_VERSION || '1.0.0'}</div>
                        <div>Build: {import.meta.env.VITE_BUILD_DATE || 'Unknown'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Monitoring</h4>
                      <div className="space-y-1 text-gray-600">
                        <div>Status: {isMonitoring ? 'Active' : 'Inactive'}</div>
                        <div>Last Update: {lastUpdate?.toLocaleString() || 'Never'}</div>
                        <div>Check Interval: 30 seconds</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-lg font-medium">Loading system health...</p>
                <p className="text-sm text-gray-500 mt-2">Checking all services and components</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemHealthMonitor
