# 🚀 Development Setup Guide

This guide will help you set up the GoaTouristFlow project for local development.

## Prerequisites

- **Python 3.8 or higher**: https://www.python.org/downloads/
- **Node.js 16+ and npm**: https://nodejs.org/
- **Git**: https://git-scm.com/
- **OpenAI API Key**: Get one from https://platform.openai.com/api-keys (required for LLM insights)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ShivamGawade-XS/GoaTouristFlow-AI-Crowd-Predictor.git
cd GoaTouristFlow-AI-Crowd-Predictor
```

### 2. Backend Setup

#### 2.1 Create Python Virtual Environment

```bash
cd backend

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

#### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Copy from .env template (if exists) or create new
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
EOF
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

#### 2.4 Run Backend Server

```bash
# Make sure you're in the backend directory with venv activated
uvicorn main:app --reload

# Server will start at http://localhost:8000
# API docs available at http://localhost:8000/docs
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
INFO:     Started Reloader process [12346]
```

### 3. Frontend Setup

#### 3.1 Install Node Dependencies

```bash
# From the project root, navigate to frontend
cd frontend

# Install dependencies
npm install
```

#### 3.2 Set Up Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000/api
EOF
```

#### 3.3 Run Frontend Dev Server

```bash
npm run dev

# Server will start at http://localhost:5173
```

**Expected Output:**
```
  VITE v5.3.1  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/beaches
- **API Documentation**: http://localhost:8000/docs

## Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Navigate to project root
cd /path/to/GoaTouristFlow-AI-Crowd-Predictor

# Create .env file
echo "OPENAI_API_KEY=your_key_here" > backend/.env

# Start services
docker-compose up

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

## Project Structure

```
GoaTouristFlow-AI-Crowd-Predictor/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── predictor.py         # LLM crowd prediction
│   ├── sentiment.py         # Social sentiment analysis
│   ├── weather.py           # Weather API integration
│   ├── requirements.txt
│   ├── .env                 # Environment variables (your API key)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── BeachCard.jsx
│   │       ├── AlertPanel.jsx
│   │       ├── Header.jsx
│   │       └── LoadingSpinner.jsx
│   ├── public/
│   │   └── manifest.json    # PWA manifest
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.local           # Frontend API URL
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Common Issues & Solutions

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Make sure virtual environment is activated and dependencies installed
  ```bash
  source venv/bin/activate  # macOS/Linux
  pip install -r requirements.txt
  ```

**Issue**: `OPENAI_API_KEY not found`
- **Solution**: Check `.env` file exists with valid API key
  ```bash
  cat backend/.env
  # Should show: OPENAI_API_KEY=sk-...
  ```

### Frontend Issues

**Issue**: `npm: command not found`
- **Solution**: Install Node.js from https://nodejs.org/

**Issue**: `Cannot find module 'react'`
- **Solution**: Install dependencies
  ```bash
  cd frontend
  npm install
  ```

**Issue**: `API calls failing (CORS errors)`
- **Solution**: Make sure backend is running on port 8000
  ```bash
  # In backend directory
  uvicorn main:app --reload
  ```

## Development Workflow

### During Development

1. **Backend Development**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload  # Auto-reloads on code changes
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm run dev  # Fast refresh on code changes
   ```

3. **Make Changes**:
   - Edit files in `backend/*.py` or `frontend/src/**`
   - Changes hot-reload automatically

4. **Test API**:
   - Use Swagger UI at http://localhost:8000/docs
   - Or use curl: `curl http://localhost:8000/api/beaches`

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build  # Creates optimized dist/ folder
npm run preview  # Preview production build locally
```

**Backend**:
```bash
# Backend is ready for deployment as-is
# See deployment section in main README.md
```

## Useful Commands

### Backend
```bash
# Run tests (if available)
pytest

# Format code
black .

# Lint code
flake8 .
```

### Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npx prettier --write .

# Lint code
npm run lint
```

## Next Steps

1. **Set Up Git**: 
   ```bash
   git config user.name "Your Name"
   git config user.email "your@email.com"
   ```

2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make Changes and Commit**:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

4. **Push and Create PR**:
   ```bash
   git push origin feature/your-feature
   ```

## Getting Help

- Check README.md for project overview
- Review code comments in the source files
- Check backend API docs at http://localhost:8000/docs
- Open an issue on GitHub

---

Happy coding! 🚀
