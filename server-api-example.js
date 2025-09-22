// Server-side API Example for Dedicated Server
// This shows how to handle image uploads when you move to a dedicated server

const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const AWS = require('aws-sdk')

const app = express()
app.use(express.json())

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure AWS S3 (if using S3)
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION
})

// Image upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { path: filePath } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    const storageProvider = process.env.IMAGE_STORAGE_PROVIDER || 'local'

    switch (storageProvider) {
      case 'local':
        return await handleLocalUpload(req, res, file, filePath)
      case 's3':
        return await handleS3Upload(req, res, file, filePath)
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid storage provider'
        })
    }
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    })
  }
})

// Local file storage handler
async function handleLocalUpload(req, res, file, filePath) {
  try {
    const fullPath = path.join(uploadsDir, filePath)
    const dir = path.dirname(fullPath)
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Write file to disk
    fs.writeFileSync(fullPath, file.buffer)
    
    // Generate public URL
    const publicUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${filePath}`
    
    res.json({
      success: true,
      url: publicUrl,
      path: filePath
    })
  } catch (error) {
    console.error('Local upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Local upload failed'
    })
  }
}

// S3 storage handler
async function handleS3Upload(req, res, file, filePath) {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }
    
    const result = await s3.upload(params).promise()
    
    res.json({
      success: true,
      url: result.Location,
      path: filePath
    })
  } catch (error) {
    console.error('S3 upload error:', error)
    res.status(500).json({
      success: false,
      error: 'S3 upload failed'
    })
  }
}

// Image deletion endpoint
app.delete('/api/delete', async (req, res) => {
  try {
    const { path: filePath } = req.body
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'No file path provided'
      })
    }

    const storageProvider = process.env.IMAGE_STORAGE_PROVIDER || 'local'

    switch (storageProvider) {
      case 'local':
        return await handleLocalDelete(req, res, filePath)
      case 's3':
        return await handleS3Delete(req, res, filePath)
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid storage provider'
        })
    }
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({
      success: false,
      error: 'Delete failed'
    })
  }
})

// Local file deletion handler
async function handleLocalDelete(req, res, filePath) {
  try {
    const fullPath = path.join(uploadsDir, filePath)
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Local delete error:', error)
    res.status(500).json({
      success: false,
      error: 'Local delete failed'
    })
  }
}

// S3 file deletion handler
async function handleS3Delete(req, res, filePath) {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: filePath
    }
    
    await s3.deleteObject(params).promise()
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('S3 delete error:', error)
    res.status(500).json({
      success: false,
      error: 'S3 delete failed'
    })
  }
}

// Serve uploaded files (for local storage)
app.use('/uploads', express.static(uploadsDir))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    storageProvider: process.env.IMAGE_STORAGE_PROVIDER || 'local'
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Storage provider: ${process.env.IMAGE_STORAGE_PROVIDER || 'local'}`)
})

module.exports = app




