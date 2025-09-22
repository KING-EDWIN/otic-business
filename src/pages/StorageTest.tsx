import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Upload, Database, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { testStorageConnection, testImageUpload, StorageTestResult } from '@/utils/storageTest'

const StorageTest: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<StorageTestResult[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const runStorageTest = async () => {
    setIsTesting(true)
    setTestResults([])
    
    try {
      console.log('🧪 Starting storage connection test...')
      const result = await testStorageConnection()
      setTestResults([result])
      
      if (result.success) {
        toast.success('Storage connection test passed!')
      } else {
        toast.error('Storage connection test failed')
      }
    } catch (error) {
      console.error('❌ Storage test error:', error)
      toast.error('Storage test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const runImageUploadTest = async () => {
    if (!selectedFile) {
      toast.error('Please select an image file first')
      return
    }

    setIsTesting(true)
    
    try {
      console.log('🧪 Starting image upload test...')
      const result = await testImageUpload(selectedFile)
      setTestResults(prev => [...prev, result])
      
      if (result.success) {
        toast.success('Image upload test passed!')
      } else {
        toast.error('Image upload test failed')
      }
    } catch (error) {
      console.error('❌ Image upload test error:', error)
      toast.error('Image upload test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#040458]">Storage Connection Test</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test the Supabase storage connection and troubleshoot any issues with the product-images bucket.
          </p>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Storage Connection Test */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-[#040458] flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Storage Connection Test
              </CardTitle>
              <CardDescription>
                Test the basic storage connection and bucket access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runStorageTest}
                disabled={isTesting}
                className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Test Storage Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Image Upload Test */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-[#040458] flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Image Upload Test
              </CardTitle>
              <CardDescription>
                Test uploading an image to the product-images bucket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              <Button
                onClick={runImageUploadTest}
                disabled={isTesting || !selectedFile}
                className="w-full bg-[#faa51a] hover:bg-[#faa51a]/90 text-white"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Test Image Upload
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-[#040458] flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Test Results
              </CardTitle>
              <CardDescription>
                Results from the storage connection tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <Badge 
                      className={`${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.success ? 'PASSED' : 'FAILED'}
                    </Badge>
                    <span className="font-medium">{result.message}</span>
                  </div>
                  
                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">
                        <strong>Error:</strong> {result.error}
                      </p>
                    </div>
                  )}
                  
                  {result.details && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <p className="text-sm text-gray-800">
                        <strong>Details:</strong>
                      </p>
                      <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-800 mb-3">How to Fix Storage Issues:</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1. <strong>Run the SQL scripts:</strong> Execute the storage fix scripts in Supabase SQL Editor</p>
              <p>2. <strong>Check bucket policies:</strong> Ensure the product-images bucket has proper RLS policies</p>
              <p>3. <strong>Verify permissions:</strong> Make sure authenticated users can upload to the bucket</p>
              <p>4. <strong>Check bucket visibility:</strong> The bucket should be public for image access</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StorageTest



