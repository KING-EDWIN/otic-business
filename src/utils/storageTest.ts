// =====================================================
// STORAGE CONNECTION TEST UTILITY
// =====================================================
// This utility tests the Supabase storage connection

import { supabase } from '@/lib/supabaseClient'

export interface StorageTestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export const testStorageConnection = async (): Promise<StorageTestResult> => {
  try {
    console.log('🔍 Testing Supabase storage connection...')
    
    // Test 1: Check if we can list buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      return {
        success: false,
        message: 'Failed to list storage buckets',
        error: bucketsError.message
      }
    }
    
    console.log('✅ Successfully listed buckets:', buckets)
    
    // Test 2: Check if product-images bucket exists
    const productImagesBucket = buckets?.find(bucket => bucket.name === 'product-images')
    
    if (!productImagesBucket) {
      return {
        success: false,
        message: 'product-images bucket not found',
        details: { availableBuckets: buckets?.map(b => b.name) }
      }
    }
    
    console.log('✅ product-images bucket found:', productImagesBucket)
    
    // Test 3: Check if bucket is public
    if (!productImagesBucket.public) {
      return {
        success: false,
        message: 'product-images bucket is not public',
        details: productImagesBucket
      }
    }
    
    console.log('✅ product-images bucket is public')
    
    // Test 4: Try to upload a small test file
    const testFileName = `test-${Date.now()}.txt`
    const testContent = 'This is a test file for storage connection'
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      })
    
    if (uploadError) {
      return {
        success: false,
        message: 'Failed to upload test file',
        error: uploadError.message
      }
    }
    
    console.log('✅ Successfully uploaded test file:', uploadData)
    
    // Test 5: Try to get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(testFileName)
    
    console.log('✅ Successfully got public URL:', urlData.publicUrl)
    
    // Test 6: Try to download the file
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('product-images')
      .download(testFileName)
    
    if (downloadError) {
      return {
        success: false,
        message: 'Failed to download test file',
        error: downloadError.message
      }
    }
    
    console.log('✅ Successfully downloaded test file')
    
    // Test 7: Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove([testFileName])
    
    if (deleteError) {
      console.warn('⚠️ Failed to delete test file:', deleteError)
    } else {
      console.log('✅ Successfully cleaned up test file')
    }
    
    return {
      success: true,
      message: 'Storage connection test passed successfully!',
      details: {
        bucket: productImagesBucket,
        publicUrl: urlData.publicUrl,
        testFileUploaded: true,
        testFileDownloaded: true
      }
    }
    
  } catch (error) {
    console.error('❌ Storage connection test failed:', error)
    return {
      success: false,
      message: 'Storage connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const testImageUpload = async (file: File): Promise<StorageTestResult> => {
  try {
    console.log('🖼️ Testing image upload...')
    
    const fileExt = file.name.split('.').pop()
    const fileName = `test-image-${Date.now()}.${fileExt}`
    
    // Upload the image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)
    
    if (uploadError) {
      return {
        success: false,
        message: 'Failed to upload image',
        error: uploadError.message
      }
    }
    
    console.log('✅ Successfully uploaded image:', uploadData)
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)
    
    console.log('✅ Successfully got image public URL:', urlData.publicUrl)
    
    // Test if the URL is accessible
    try {
      const response = await fetch(urlData.publicUrl, { method: 'HEAD' })
      if (!response.ok) {
        return {
          success: false,
          message: 'Image URL is not accessible',
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (fetchError) {
      return {
        success: false,
        message: 'Failed to verify image URL accessibility',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }
    }
    
    // Clean up test image
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove([fileName])
    
    if (deleteError) {
      console.warn('⚠️ Failed to delete test image:', deleteError)
    } else {
      console.log('✅ Successfully cleaned up test image')
    }
    
    return {
      success: true,
      message: 'Image upload test passed successfully!',
      details: {
        fileName: uploadData.path,
        publicUrl: urlData.publicUrl,
        fileSize: file.size,
        fileType: file.type
      }
    }
    
  } catch (error) {
    console.error('❌ Image upload test failed:', error)
    return {
      success: false,
      message: 'Image upload test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}


