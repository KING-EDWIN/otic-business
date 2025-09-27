import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Database,
  Mail,
  Wifi,
  Server,
  HardDrive,
  Shield,
  Zap
} from 'lucide-react'
import SystemHealthService, { SystemHealth } from '@/services/systemHealthService'
import SystemStatusWidget from '@/components/SystemStatusWidget'
import SystemHealthMonitor from '@/components/SystemHealthMonitor'

const SystemHealthTest: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [showFullMonitor, setShowFullMonitor] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    // Start monitoring when component mounts
    startMonitoring()
    return () => {
      SystemHealthService.stopMonitoring()
    }
  }, [])

  const startMonitoring = () => {
    setIsMonitoring(true)
    SystemHealthService.startMonitoring()
    
    const unsubscribe = SystemHealthService.onHealthUpdate((healthData) => {
      setHealth(healthData)
    })

    return unsubscribe
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    SystemHealthService.stopMonitoring()
  }

  const runHealthTests = async () => {
    setTestResults([])
    
    const tests = [
      {
        name: 'Database Connectivity',
        test: async () => {
          const health = await SystemHealthService.triggerHealthCheck()
          return health.database.status === 'healthy'
        }
      },
      {
        name: 'SMTP Service',
        test: async () => {
          const health = await SystemHealthService.triggerHealthCheck()
          return health.smtp.status === 'healthy' || health.smtp.status === 'warning'
        }
      },
      {
        name: 'Network Speed',
        test: async () => {
          const health = await SystemHealthService.triggerHealthCheck()
          return health.network.status === 'healthy' || health.network.status === 'warning'
        }
      },
      {
        name: 'API Endpoints',
        test: async () => {
          const health = await SystemHealthService.triggerHealthCheck()
          return health.api.status === 'healthy' || health.api.status === 'warning'
        }
      },
      {
        name: 'Storage Service',
        test: async () => {
          const health = await SystemHealthService.triggerHealthCheck()
          return health.storage.status === 'healthy' || health.storage.status === 'warning'
        }
      },
      {
        name: 'Authentication',
        test: async () => {
          const health = await SystemHealthService.triggerHealthCheck()
          return health.auth.status === 'healthy' || health.auth.status === 'warning'
        }
      },
      {
        name: 'Realtime Service',
        test: async () => {
          const health = await SystemHealthService.triggerHealthCheck()
          return health.realtime.status === 'healthy' || health.realtime.status === 'warning'
        }
      }
    ]

    const results = []
    for (const test of tests) {
      try {
        const passed = await test.test()
        results.push({
          name: test.name,
          passed,
          error: null
        })
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    setTestResults(results)
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
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'database':
        return <Database className="h-4 w-4" />
      case 'smtp':
        return <Mail className="h-4 w-4" />
      case 'network':
        return <Wifi className="h-4 w-4" />
      case 'api':
        return <Server className="h-4 w-4" />
      case 'storage':
        return <HardDrive className="h-4 w-4" />
      case 'auth':
        return <Shield className="h-4 w-4" />
      case 'realtime':
        return <Zap className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#040458] mb-2">System Health Test</h1>
          <p className="text-gray-600">Test the comprehensive system health monitoring system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* System Status Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Live System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SystemStatusWidget 
                onOpenHealthMonitor={() => setShowFullMonitor(true)}
              />
            </CardContent>
          </Card>

          {/* Monitoring Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Monitoring</span>
                <Badge variant={isMonitoring ? 'default' : 'outline'}>
                  {isMonitoring ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={startMonitoring}
                  disabled={isMonitoring}
                  className="flex-1"
                >
                  Start Monitoring
                </Button>
                <Button
                  onClick={stopMonitoring}
                  disabled={!isMonitoring}
                  variant="outline"
                  className="flex-1"
                >
                  Stop Monitoring
                </Button>
              </div>

              <Button
                onClick={runHealthTests}
                className="w-full bg-[#040458] hover:bg-[#030345] text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Health Tests
              </Button>

              <Button
                onClick={() => setShowFullMonitor(true)}
                variant="outline"
                className="w-full"
              >
                Open Full Monitor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Health Status */}
        {health && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current System Health</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {health.overall.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(health).filter(([key]) => key !== 'overall').map(([service, status]) => (
                  <div key={service} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getServiceIcon(service)}
                      {getStatusIcon(status.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium capitalize">{service}</div>
                      <div className="text-xs text-gray-500">
                        {status.responseTime ? `${status.responseTime}ms` : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Health Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {result.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <Badge variant={result.passed ? 'default' : 'destructive'}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Health Monitor Modal */}
        <SystemHealthMonitor 
          isOpen={showFullMonitor}
          onClose={() => setShowFullMonitor(false)}
        />

        {/* Success Message */}
        <div className="mt-8 p-6 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">✅ System Health Monitoring Successfully Implemented!</h3>
          <p className="text-green-800 mb-4">
            Your Otic Business system now has comprehensive real-time health monitoring that tracks all critical components.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <div>
              <h4 className="font-medium mb-2">Monitored Services:</h4>
              <ul className="space-y-1">
                <li>• Database connectivity & table status</li>
                <li>• SMTP email service health</li>
                <li>• Network speed & latency</li>
                <li>• API endpoints status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Real-time status updates</li>
                <li>• Response time monitoring</li>
                <li>• Overall health scoring</li>
                <li>• Admin dashboard integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemHealthTest
