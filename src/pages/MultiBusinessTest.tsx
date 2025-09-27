import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Plus, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const MultiBusinessTest: React.FC = () => {
  const { user, profile } = useAuth()
  const { 
    businesses, 
    currentBusiness, 
    businessMembers, 
    loading, 
    canCreateBusiness,
    createBusiness,
    switchBusiness,
    refreshBusinesses,
    refreshMembers
  } = useBusinessManagement()

  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    runTests()
  }, [businesses, currentBusiness, businessMembers])

  const runTests = async () => {
    const results: string[] = []
    
    // Test 1: Check if user is authenticated
    if (user) {
      results.push('✅ User authenticated')
    } else {
      results.push('❌ User not authenticated')
    }

    // Test 2: Check if profile is loaded
    if (profile) {
      results.push('✅ User profile loaded')
    } else {
      results.push('❌ User profile not loaded')
    }

    // Test 3: Check if businesses are loaded
    if (businesses.length > 0) {
      results.push(`✅ ${businesses.length} businesses loaded`)
    } else {
      results.push('❌ No businesses loaded')
    }

    // Test 4: Check if current business is set
    if (currentBusiness) {
      results.push(`✅ Current business: ${currentBusiness.name}`)
    } else {
      results.push('❌ No current business set')
    }

    // Test 5: Check if business members are loaded
    if (businessMembers.length > 0) {
      results.push(`✅ ${businessMembers.length} business members loaded`)
    } else {
      results.push('❌ No business members loaded')
    }

    // Test 6: Check if can create business
    if (canCreateBusiness) {
      results.push('✅ Can create new business')
    } else {
      results.push('❌ Cannot create new business')
    }

    setTestResults(results)
  }

  const handleCreateTestBusiness = async () => {
    try {
      const result = await createBusiness({
        name: 'Test Business',
        description: 'Test business for multi-business functionality',
        business_type: 'retail',
        industry: 'technology',
        currency: 'UGX',
        timezone: 'Africa/Kampala'
      })

      if (result.success) {
        toast.success('Test business created successfully')
        await refreshBusinesses()
      } else {
        toast.error(result.error || 'Failed to create test business')
      }
    } catch (error) {
      console.error('Error creating test business:', error)
      toast.error('Failed to create test business')
    }
  }

  const handleSwitchBusiness = async (businessId: string) => {
    try {
      const result = await switchBusiness(businessId)
      if (result.success) {
        toast.success('Business switched successfully')
        await refreshBusinesses()
        await refreshMembers()
      } else {
        toast.error(result.error || 'Failed to switch business')
      }
    } catch (error) {
      console.error('Error switching business:', error)
      toast.error('Failed to switch business')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading multi-business test...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#040458] mb-2">Multi-Business System Test</h1>
          <p className="text-gray-600">Testing multi-business functionality and database connectivity</p>
        </div>

        {/* Test Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Businesses */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Businesses ({businesses.length})</span>
              </span>
              {canCreateBusiness && (
                <Button onClick={handleCreateTestBusiness} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Business
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {businesses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No businesses found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className={`p-4 border rounded-lg ${
                      currentBusiness?.id === business.id
                        ? 'border-[#040458] bg-[#040458]/5'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{business.name}</h3>
                      {currentBusiness?.id === business.id && (
                        <Badge className="bg-[#040458] text-white">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{business.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{business.business_type}</span>
                      {currentBusiness?.id !== business.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSwitchBusiness(business.id)}
                        >
                          Switch
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Members */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Business Members ({businessMembers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {businessMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No business members found</p>
            ) : (
              <div className="space-y-2">
                {businessMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{member.email}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex space-x-4">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button onClick={runTests} variant="outline">
            Refresh Tests
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MultiBusinessTest
