<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GoaTouristFlow-AI-Crowd-Predictor

This web app forecasts tourist crowd density at beaches (e.g., Calangute) using social media sentiment and public APIs, preventing overcrowding chaos during peak seasons. Predicts "hotspots" via LLM analysis of X/Instagram posts + weather data; users get personalized low-crowd alerts via web/PWA.

## Features

- **Real-time Crowd Density (CDS) Monitoring**: Track live crowd levels across major Goa beaches.
- **AI-Powered Forecasting**: Predicts future crowd density using social media trends and historical data.
- **Interactive Map**: Visualize hotspots and beach statuses at a glance.
- **Push Notifications (PWA)**: Get alerts when your favorite beaches have low crowd levels.
- **Admin Dashboard**: For authorities to monitor and manage crowd flow.

## Project Structure

- `src/`: React frontend (Vite, Tailwind CSS, Zustand, Lucide Icons).
- `server.ts`: Express backend with WebSocket support for real-time updates.
- `DESIGN_DOC.md`: Detailed technical architecture and design decisions.
- `PROJECT_REQUIREMENTS.md`: Functional and non-functional requirements.
- `TECH_STACK.md`: Full list of technologies used.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file based on `.env.example`.
   ```bash
   cp .env.example .env
   ```
   Set your `GEMINI_API_KEY` for AI features.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, TanStack Query.
- **Backend**: Express, WebSocket (ws), JWT, Bcrypt.
- **AI**: Google Gemini API.
- **Deployment**: PWA compatible, production-ready Express server.
