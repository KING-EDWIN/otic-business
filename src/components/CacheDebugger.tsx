import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Trash2, Database, Clock, AlertTriangle } from 'lucide-react'
import CacheService from '@/services/cacheService'

interface CacheDebuggerProps {
  isOpen: boolean
  onClose: () => void
}

const CacheDebugger: React.FC<CacheDebuggerProps> = ({ isOpen, onClose }) => {
  const [cacheStatus, setCacheStatus] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshCacheStatus = () => {
    setIsRefreshing(true)
    const status = CacheService.getCacheStatus()
    setCacheStatus(status)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  useEffect(() => {
    if (isOpen) {
      refreshCacheStatus()
    }
  }, [isOpen])

  const clearAllCache = () => {
    CacheService.clearAllUserCache()
    refreshCacheStatus()
  }

  const refreshAllQueries = async () => {
    setIsRefreshing(true)
    await CacheService.refreshAllQueries()
    refreshCacheStatus()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'loading': return 'bg-blue-100 text-blue-800'
      case 'idle': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Cache Debugger</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCacheStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAllQueries}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllCache}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {cacheStatus ? (
            <div className="space-y-4">
              {/* Cache Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Queries</span>
                    </div>
                    <p className="text-2xl font-bold">{cacheStatus.cacheSize}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Active Queries</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {cacheStatus.queries.filter((q: any) => q.state === 'success').length}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Error Queries</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {cacheStatus.queries.filter((q: any) => q.state === 'error').length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Query Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Query Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {cacheStatus.queries.map((query: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getStatusColor(query.state)}>
                                {query.state}
                              </Badge>
                              <span className="text-sm font-mono">
                                {JSON.stringify(query.queryKey)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 space-x-4">
                              <span>Updated: {formatTimestamp(query.dataUpdatedAt)}</span>
                              {query.errorUpdatedAt && (
                                <span>Error: {formatTimestamp(query.errorUpdatedAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Cache Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cache Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Pattern Clearing</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            CacheService.clearCacheByPattern('user')
                            refreshCacheStatus()
                          }}
                        >
                          Clear User Cache
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            CacheService.clearCacheByPattern('business')
                            refreshCacheStatus()
                          }}
                        >
                          Clear Business Cache
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Debug Info</h4>
                      <div className="text-xs text-gray-600">
                        <p>• Cache automatically invalidates on auth changes</p>
                        <p>• Real-time subscriptions update cache</p>
                        <p>• Optimistic updates supported</p>
                        <p>• Background refetching enabled</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading cache status...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CacheDebugger
