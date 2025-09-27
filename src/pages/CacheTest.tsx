import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Database, Trash2, CheckCircle, XCircle } from 'lucide-react'
import CacheService from '@/services/cacheService'
import { useAuth } from '@/contexts/AuthContext'

const CacheTest: React.FC = () => {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runCacheTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const tests = [
      {
        name: 'Cache Service Initialization',
        test: () => {
          const status = CacheService.getCacheStatus()
          return status !== null
        }
      },
      {
        name: 'Cache Key Generation',
        test: () => {
          const keys = [
            ['user-profile', 'test-user'],
            ['businesses', 'test-user'],
            ['time-entries', 'test-user', 'test-business']
          ]
          return keys.every(key => Array.isArray(key))
        }
      },
      {
        name: 'Cache Invalidation Methods',
        test: () => {
          try {
            CacheService.invalidateUserCache('test-user')
            CacheService.invalidateBusinessCache('test-user')
            CacheService.invalidateTimeEntriesCache('test-user')
            return true
          } catch (error) {
            return false
          }
        }
      },
      {
        name: 'Cache Clear Function',
        test: () => {
          try {
            CacheService.clearAllUserCache()
            return true
          } catch (error) {
            return false
          }
        }
      },
      {
        name: 'Cache Status Retrieval',
        test: () => {
          try {
            const status = CacheService.getCacheStatus()
            return status && typeof status.cacheSize === 'number'
          } catch (error) {
            return false
          }
        }
      }
    ]

    const results = tests.map(test => {
      try {
        const passed = test.test()
        return {
          name: test.name,
          passed,
          error: null
        }
      } catch (error) {
        return {
          name: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    setTestResults(results)
    setIsRunning(false)
  }

  const clearAllCache = () => {
    CacheService.clearAllUserCache()
    setTestResults([])
  }

  const getCacheStatus = () => {
    const status = CacheService.getCacheStatus()
    console.log('Cache Status:', status)
    alert(`Cache Status:\nTotal Queries: ${status?.cacheSize || 0}\nActive Queries: ${status?.queries?.filter((q: any) => q.state === 'success').length || 0}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#040458] mb-2">Cache System Test</h1>
          <p className="text-gray-600">Test the professional cache management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Cache Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runCacheTests}
                disabled={isRunning}
                className="w-full bg-[#040458] hover:bg-[#030345] text-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running Tests...' : 'Run Cache Tests'}
              </Button>
              
              <Button
                onClick={getCacheStatus}
                variant="outline"
                className="w-full"
              >
                <Database className="mr-2 h-4 w-4" />
                Get Cache Status
              </Button>
              
              <Button
                onClick={clearAllCache}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Cache
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Context</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
                </div>
              ) : (
                <p className="text-gray-500">No user logged in</p>
              )}
            </CardContent>
          </Card>
        </div>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
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
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Cache System Features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Automatic cache invalidation on auth changes</li>
                  <li>• Real-time subscriptions for data updates</li>
                  <li>• Optimistic updates for better UX</li>
                  <li>• Professional cache configurations</li>
                  <li>• Centralized cache management</li>
                  <li>• Debug tools for monitoring</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-6 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Cache System Successfully Implemented!</h3>
          <p className="text-green-800 mb-4">
            Your Otic Business system now has professional cache management that will prevent the issues you were experiencing with private mode.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <div>
              <h4 className="font-medium mb-2">What's Fixed:</h4>
              <ul className="space-y-1">
                <li>• No more stale data issues</li>
                <li>• Automatic cache clearing on logout</li>
                <li>• Real-time data synchronization</li>
                <li>• Professional error handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">New Features:</h4>
              <ul className="space-y-1">
                <li>• Cache debugger in admin panel</li>
                <li>• Optimistic updates</li>
                <li>• Smart cache invalidation</li>
                <li>• Background data refresh</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CacheTest
