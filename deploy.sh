#!/bin/bash

# Otic Business - Deployment Script
echo "🚀 Deploying Otic Business to Production..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Git working directory is not clean. Please commit or stash your changes first."
  exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build:prod

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Commit and push changes
  echo "📤 Pushing to GitHub..."
  git add .
  git commit -m "Deploy: Production build ready"
  git push origin main
  
  echo "🎉 Deployment initiated!"
  echo "📋 Next steps:"
  echo "1. Go to https://vercel.com"
  echo "2. Connect your GitHub repository"
  echo "3. Add environment variables:"
  echo "   - VITE_SUPABASE_URL: https://jvgiyscchxxekcbdicco.supabase.co"
  echo "   - VITE_SUPABASE_ANON_KEY: your_supabase_anon_key"
  echo "4. Deploy!"
  
else
  echo "❌ Build failed. Please fix the errors and try again."
  exit 1
fi


