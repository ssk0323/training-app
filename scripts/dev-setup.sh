#!/bin/bash

# Development setup script for Training Record App

echo "🏋️ Setting up Training Record App development environment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Create local D1 database
echo "📦 Creating local D1 database..."
if ! wrangler d1 create training-app-db-local 2>/dev/null; then
    echo "⚠️  Database might already exist, continuing..."
fi

# Run migrations
echo "🗄️  Running database migrations..."
wrangler d1 migrations apply training-app-db --local

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo "🔧 Please update the database configuration in .env.local"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🚀 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update wrangler.toml with your database ID"
echo "2. Run 'npm run dev' to start the frontend"
echo "3. Run 'wrangler dev' to start the Workers development server"
echo "4. Set VITE_USE_API=true in .env.local to use the API"
echo ""
echo "Useful commands:"
echo "- npm run dev          # Start frontend dev server"
echo "- wrangler dev         # Start Workers dev server"
echo "- npm run db:migrate   # Run database migrations"
echo "- npm run test         # Run tests"