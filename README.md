# 🌊 GoaTouristFlow: AI-Powered Beach Crowd Predictor

This web app forecasts tourist crowd density at Goa beaches using social media sentiment and public APIs, preventing overcrowding chaos during peak seasons. It predicts "hotspots" via LLM analysis of social media posts + real-time weather data, and users get personalized low-crowd alerts via web interface with PWA support.

## 🎯 Features

- **Real-time Crowd Predictions**: Analyzes social media sentiment to predict which beaches are crowded
- **AI-Powered Insights**: Uses OpenAI GPT-3.5-turbo to generate actionable recommendations
- **Weather Integration**: Incorporates real-time weather data (temperature, precipitation, wind) using Open-Meteo API
- **Smart Alerts**: Generates urgency-based alerts ("caution" or "avoid") for high-crowd beaches during peak hours
- **Responsive UI**: Beautiful, mobile-friendly dashboard with gradient design and smooth animations
- **PWA Ready**: Can be installed as a Progressive Web App for offline support
- **Auto-refresh**: Predictions automatically refresh every 5 minutes

## 🏗️ Architecture

### Backend (FastAPI + Python)
- `main.py`: FastAPI application with REST API endpoints
- `predictor.py`: LLM-powered crowd prediction using OpenAI
- `sentiment.py`: Social media sentiment analysis (mocked X/Instagram posts)
- `weather.py`: Real weather data from Open-Meteo API

### Frontend (React + Vite)
- `App.jsx`: Main application component
- `components/`: Reusable React components (BeachCard, AlertPanel, Header, LoadingSpinner)
- Responsive CSS with dark theme and modern styling
- Vite dev server for fast HMR development
- Vite PWA plugin for Progressive Web App support

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key (for LLM insights)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ShivamGawade-XS/GoaTouristFlow-AI-Crowd-Predictor.git
cd GoaTouristFlow-AI-Crowd-Predictor

# Create .env file with your OpenAI key
echo "OPENAI_API_KEY=your_key_here" > backend/.env

# Start with Docker Compose
docker-compose up

# Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Run the server
uvicorn main:app --reload
# Server runs on http://localhost:8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:8000/api" > .env.local

# Start dev server
npm run dev
# App runs on http://localhost:5173
```

## 📡 API Endpoints

### GET `/api/health`
Health check
```
Response: {"status": "healthy"}
```

### GET `/api/beaches`
Get predictions for all beaches
```
Response: {
  "timestamp": "2024-03-31T...",
  "beaches": [
    {
      "beach": "Calangute",
      "crowd_level": "high",
      "crowd_score": 85.5,
      "sentiment_score": 0.85,
      "temperature": 32.5,
      "precipitation_probability": 5.2,
      "recommendation": "...",
      "is_peak_hour": true,
      "is_weekend": false
    }
    ...
  ],
  "hotspot": "Calangute",
  "alerts": [
    {
      "beach": "Calangute",
      "crowd_level": "high",
      "urgency": "avoid",
      "message": "ALERT: Calangute is extremely crowded during peak hours!"
    }
  ]
}
```

### GET `/api/beach/{beach_name}`
Get detailed prediction for a specific beach
```
Example: /api/beach/Calangute
Response: Same as single beach object from /api/beaches
```

### GET `/api/beaches/available`
List all available beaches
```
Response: {"beaches": ["Calangute", "Baga", "Anjuna", "Palolem", "Vagator", "Colva"]}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
OPENAI_API_KEY=sk-...  # Your OpenAI API key
```

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:8000/api
```

## 📊 Crowd Level Calculation

The crowd score is calculated based on:
1. **Social Media Sentiment** (60% weight): Analyzed from simulated X/Instagram posts
2. **Weather Conditions** (40% weight): Temperature, precipitation, wind speed
3. **Time Factors**: Adjusted for peak hours (10 AM - 6 PM) and weekends
4. **Precipitation Impact**: Rain significantly reduces predicted crowds

Crowd Levels:
- 🟢 **Low** (0-30): Go now! Perfect time to visit
- 🟡 **Medium** (30-60): Manageable crowds, best early morning or late evening
- 🔴 **High** (60+): Very crowded, avoid peak hours or try quieter beaches

## 🔴 Alert System

Alerts are generated for high-crowd beaches with three urgency levels:

- **🟢 Safe**: Low crowds, beach is accessible
- **🟡 Caution**: High crowds, recommend off-peak hours
- **🔴 Avoid**: Extremely crowded during peak season/weekend/peak hours

## 🌈 Beaches Supported

The app covers 6 major Goa beaches:
1. **Calangute** - North Goa (often the busiest)
2. **Baga** - North Goa (party scene)
3. **Anjuna** - North Goa (flea market, quieter)
4. **Palolem** - South Goa (most peaceful)
5. **Vagator** - North Goa (hidden gem)
6. **Colva** - South Goa (moderate crowds)

## 📦 Tech Stack

**Backend:**
- FastAPI 0.111.0
- Uvicorn 0.29.0 (ASGI server)
- httpx 0.27.0 (async HTTP client)
- OpenAI 1.30.1 (LLM integration)
- Pydantic 2.7.1 (data validation)
- Python-dotenv 1.0.1 (environment config)

**Frontend:**
- React 18.3.1
- Vite 5.3.1 (build tool)
- Vite PWA 0.20.0 (Progressive Web App support)
- CSS Grid/Flexbox for responsive layout

**APIs:**
- Open-Meteo API (weather data - free, no auth needed)
- OpenAI API (GPT-3.5-turbo for insights - requires API key)

## 🚀 Deployment

### Deploy Backend (FastAPI)

#### Heroku
```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
git push heroku main
```

#### Railway, Render, OpenAI Functions, etc.
FastAPI apps are standard Python ASGI apps and work on any Python hosting platform.

### Deploy Frontend

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm run build
netlify deploy --prod --dir dist
```

## 📝 Development Roadmap

- [ ] Real X/Instagram API integration (replace mock sentiment)
- [ ] User authentication & preferences
- [ ] Email/SMS/Push notifications for alerts
- [ ] Historical crowd data & trends
- [ ] Beach capacity database
- [ ] Multi-region support (other beaches in India, world)
- [ ] Advanced ML model for better predictions
- [ ] Maps integration (show beaches on map)
- [ ] Rating system (user reviews of crowd accuracy)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Shivam Gawade**
- GitHub: [@ShivamGawade-XS](https://github.com/ShivamGawade-XS)

## 📧 Support & Contact

For issues, questions, or suggestions:
- Open an GitHub issue
- Check existing discussions

---

Made with 🌊 for Goa tourism enthusiasts. Help tourists make smarter beach choices!
