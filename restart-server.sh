#!/bin/bash

# OTIC Business Development Server Restart Script
# This script stops any running development servers and starts fresh

echo "🔄 Restarting OTIC Business Development Server..."

# Kill any existing processes on port 8082
echo "🛑 Stopping existing server on port 8082..."
lsof -ti:8082 | xargs kill -9 2>/dev/null || echo "No process found on port 8082"

# Kill any existing Vite processes
echo "🛑 Stopping existing Vite processes..."
pkill -f "vite" 2>/dev/null || echo "No Vite processes found"

# Wait a moment for processes to fully stop
sleep 2

# Navigate to the project directory
cd /Users/katambadylan/Desktop/oticbuss/otic-business

# Clear any cached files
echo "🧹 Clearing cache..."
rm -rf node_modules/.vite 2>/dev/null || echo "No Vite cache found"
rm -rf dist 2>/dev/null || echo "No dist folder found"

# Start the development server
echo "🚀 Starting development server on port 8082..."
npm run dev -- --port 8082 --host

echo "✅ Development server restarted successfully!"
echo "🌐 Server should be running at: http://localhost:8082"
