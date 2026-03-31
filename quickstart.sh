#!/bin/bash

# GoaTouristFlow Quick Start Script
# This script sets up the project for quick local development

set -e

echo "🌊 GoaTouristFlow - Quick Start Setup"
echo "======================================"

# Check prerequisites
echo ""
echo "✓ Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 16+"
    exit 1
fi

echo "✓ Python and Node.js found"

# Check for OpenAI key
echo ""
if [ -f "backend/.env" ]; then
    if grep -q "OPENAI_API_KEY" backend/.env; then
        echo "✓ OpenAI API key found in backend/.env"
    else
        echo "⚠ backend/.env exists but OPENAI_API_KEY not found"
    fi
else
    echo "⚠ backend/.env not found. Create one with your OpenAI API key:"
    echo "   echo 'OPENAI_API_KEY=your_key_here' > backend/.env"
fi

# Setup Backend
echo ""
echo "Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null || true

pip install -q -r requirements.txt
echo "✓ Backend dependencies installed"

cd ..

# Setup Frontend
echo ""
echo "Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    npm install -q
    echo "✓ Frontend dependencies installed"
else
    echo "✓ Frontend dependencies already installed"
fi

if [ ! -f ".env.local" ]; then
    echo "VITE_API_URL=http://localhost:8000/api" > .env.local
    echo "✓ Frontend .env.local created"
fi

cd ..

# Done
echo ""
echo "======================================"
echo "✓ Setup complete!"
echo ""
echo "To start development, run:"
echo ""
echo "  # Terminal 1 - Backend:"
echo "  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "  # Terminal 2 - Frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
