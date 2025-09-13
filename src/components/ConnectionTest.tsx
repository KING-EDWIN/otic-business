import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabaseClient'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export const ConnectionTest: React.FC = () => {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runTests = async () => {
    setTesting(true)
    setResults([])
    
    const tests = [
      {
        name: 'Test Access Function',
        test: async () => {
          const { data, error } = await supabase.rpc('test_access')
          return { success: !error, data, error }
        }
      },
      {
        name: 'Test User Profiles Table',
        test: async () => {
          const { data, error } = await supabase.from('user_profiles').select('id').limit(1)
          return { success: !error, data, error }
        }
      },
      {
        name: 'Test Businesses Table',
        test: async () => {
          const { data, error } = await supabase.from('businesses').select('id').limit(1)
          return { success: !error, data, error }
        }
      },
      {
        name: 'Test Products Table',
        test: async () => {
          const { data, error } = await supabase.from('products').select('id').limit(1)
          return { success: !error, data, error }
        }
      },
      {
        name: 'Test Sales Table',
        test: async () => {
          const { data, error } = await supabase.from('sales').select('id').limit(1)
          return { success: !error, data, error }
        }
      },
      {
        name: 'Test Get User Businesses RPC',
        test: async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return { success: false, error: 'No user' }
          
          const { data, error } = await supabase.rpc('get_user_businesses', {
            user_id_param: user.id
          })
          return { success: !error, data, error }
        }
      },
      {
        name: 'Test Get Business Members RPC',
        test: async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return { success: false, error: 'No user' }
          
          // Get first business ID
          const { data: businesses } = await supabase
            .from('businesses')
            .select('id')
            .limit(1)
          
          if (!businesses || businesses.length === 0) {
            return { success: false, error: 'No businesses found' }
          }
          
          const { data, error } = await supabase.rpc('get_business_members', {
            business_id_param: businesses[0].id
          })
          return { success: !error, data, error }
        }
      }
    ]

    for (const test of tests) {
      try {
        const result = await test.test()
        setResults(prev => [...prev, {
          name: test.name,
          success: result.success,
          error: result.error,
          data: result.data
        }])
      } catch (error) {
        setResults(prev => [...prev, {
          name: test.name,
          success: false,
          error: error
        }])
      }
    }
    
    setTesting(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Connection Test</CardTitle>
        <CardDescription>
          Test database connections and RPC functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Connection Tests'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <Alert key={index} className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                {result.error && (
                  <AlertDescription className="mt-2 text-sm">
                    {JSON.stringify(result.error, null, 2)}
                  </AlertDescription>
                )}
                {result.data && (
                  <AlertDescription className="mt-2 text-sm">
                    Data: {JSON.stringify(result.data, null, 2)}
                  </AlertDescription>
                )}
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ConnectionTest
