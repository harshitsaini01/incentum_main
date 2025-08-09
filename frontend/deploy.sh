#!/bin/bash

# Frontend deployment script for production
echo "Building frontend for production..."

# Load production environment variables
export $(cat .env.production | xargs)

# Build the frontend with production settings
npm run build

echo "Build complete! The dist folder is ready for deployment."
echo "Make sure VITE_API_URL is set to: https://api.incentum.ai"
echo ""
echo "To deploy to your VPS:"
echo "1. Copy the dist folder to your VPS"
echo "2. Serve it with your web server (nginx/apache)"
echo "3. Ensure your backend is running with NODE_ENV=production"
