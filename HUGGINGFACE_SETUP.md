# Hugging Face API Setup Guide

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Get Hugging Face API Key**
1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Sign up/Login to Hugging Face
3. Click "New token"
4. Name it "OTIC Vision API"
5. Select "Read" permissions
6. Copy the token (starts with `hf_...`)

### **Step 2: Add to Environment Variables**
Create/update `.env.local` file in your project root:

```bash
# Hugging Face API Key for OTIC Vision
VITE_HUGGINGFACE_API_KEY=hf_your_token_here
```

### **Step 3: Restart Development Server**
```bash
npm run dev
```

## 🎯 **What This Gives You:**

- ✅ **FREE tier**: 1000 requests/month
- ✅ **Mobile optimized**: Fast, lightweight
- ✅ **Accurate detection**: Detects 80+ object types
- ✅ **No battery drain**: Cloud processing
- ✅ **Easy setup**: Just an API key

## 📱 **Perfect for Mobile Retailers:**

- **Take photos** of products with phone camera
- **Upload images** from gallery
- **Instant detection** of bottles, books, electronics, phones
- **Confidence scores** for each detection
- **Bounding boxes** showing object locations

## 🔧 **API Details:**

- **Model**: `facebook/detr-resnet-50`
- **Endpoint**: `https://api-inference.huggingface.co/models/facebook/detr-resnet-50`
- **Rate Limit**: 1000 requests/month (free tier)
- **Response Time**: ~1-3 seconds
- **Supported Formats**: JPEG, PNG, WebP

## 💰 **Pricing:**

- **Free Tier**: 1000 requests/month
- **Pro Tier**: $9/month for 10,000 requests
- **Enterprise**: Custom pricing

## 🚨 **Important Notes:**

1. **API Key Security**: Never commit API keys to git
2. **Rate Limits**: Free tier has 1000 requests/month
3. **Image Size**: Keep images under 10MB for best performance
4. **Network**: Requires internet connection

## 🎉 **Ready to Test!**

Once you've added the API key:
1. Go to `http://localhost:8081/otic-vision-mobile`
2. Take a photo or upload an image
3. Click "Detect Objects"
4. Watch the magic happen! ✨



