#!/bin/bash

echo "Setting up the project..."

if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example"
  if [ -f .env.example ]; then
    cp .env.example .env.local
    echo "✅ .env.local file created from .env.example"
  else
    echo "❌ .env.example file does not exist."
  fi
else
  echo "⚠️ .env.local file already exists. No changes made."
fi
echo "-------------------------------------------------"

echo "Installing dependencies..."
if [ -d "node_modules" ]; then
    echo "Removing existing node_modules directory..."
    rm -rf node_modules
fi
echo ""
npm install
echo ""
echo "✅ Dependencies installed."
echo "-------------------------------------------------"

echo "Initializing git repository..."
echo "remove git history"
rm -rf .git

echo "initialize git"
git init

echo "create initial commit"
git add .
git commit -m "initial commit"
echo "✅ Git repository initialized and initial commit created."
echo "-------------------------------------------------"

echo "🎉 Project setup complete!"
echo "🚀 Run Dev Mode:"
npm run dev
