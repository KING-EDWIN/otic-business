import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Building2, 
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

const BusinessEdit: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { businesses, updateBusiness } = useBusinessManagement()
  
  const [formData, setFormData] = useState({
    name: '',
    business_type: '',
    industry: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    registration_number: '',
    tax_id: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const businessTypes = [
    'Retail Store',
    'Restaurant',
    'Service Provider',
    'Manufacturing',
    'Wholesale',
    'E-commerce',
    'Consulting',
    'Healthcare',
    'Education',
    'Other'
  ]

  const industries = [
    'Agriculture',
    'Technology',
    'Healthcare',
    'Education',
    'Finance',
    'Manufacturing',
    'Retail',
    'Food & Beverage',
    'Construction',
    'Transportation',
    'Entertainment',
    'Other'
  ]

  // Load business data
  useEffect(() => {
    if (businessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === businessId)
      if (business) {
        setFormData({
          name: business.name || '',
          business_type: business.business_type || '',
          industry: business.industry || '',
          description: business.description || '',
          address: business.address || '',
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
          registration_number: business.registration_number || '',
          tax_id: business.tax_id || ''
        })
      }
      setInitialLoading(false)
    }
  }, [businessId, businesses])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Business name is required')
      return
    }
    
    if (!formData.business_type) {
      toast.error('Business type is required')
      return
    }
    
    if (!formData.industry) {
      toast.error('Industry is required')
      return
    }

    if (!businessId) {
      toast.error('Business ID not found')
      return
    }

    try {
      setLoading(true)
      console.log('Updating business with data:', formData)
      
      const result = await updateBusiness(businessId, formData)
      
      if (result.success) {
        toast.success('Business updated successfully!')
        navigate('/business-management')
      } else {
        console.error('Failed to update business:', result.error)
        toast.error(result.error || 'Failed to update business')
      }
    } catch (error) {
      console.error('Error updating business:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentBusiness = businesses.find(b => b.id === businessId)
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h2>
          <p className="text-gray-600 mb-6">The business you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/business-management')}>
            Back to Business Management
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/business-management')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Business Management</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Business</h1>
              <p className="text-gray-600 mt-1">
                Update {currentBusiness.name} information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Business Information</span>
            </CardTitle>
            <CardDescription>
              Update the details for {currentBusiness.name}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter business name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => handleInputChange('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleInputChange('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    placeholder="Enter registration number"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business..."
                  rows={3}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <span>Contact Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter business address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter business email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tax Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID / TIN</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => handleInputChange('tax_id', e.target.value)}
                    placeholder="Enter tax identification number"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/business-management')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BusinessEdit
