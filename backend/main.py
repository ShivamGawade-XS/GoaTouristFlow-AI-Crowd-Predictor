from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from weather import get_weather
from sentiment import get_sentiment
from predictor import predict_crowd
import asyncio
import datetime

app = FastAPI(title="GoaTouristFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BEACHES = ["Calangute", "Baga", "Anjuna", "Palolem", "Vagator", "Colva"]

class AlertRequest(BaseModel):
    beach: str
    threshold: float = 0.4
    email: str = ""

@app.get("/")
def root():
    return {"message": "GoaTouristFlow API is running", "beaches": BEACHES}

@app.get("/predict/{beach}")
async def predict(beach: str):
    if beach not in BEACHES:
        raise HTTPException(status_code=404, detail=f"Beach {beach} not found")
    try:
        weather, sentiment = await asyncio.gather(
            get_weather(beach),
            asyncio.to_thread(get_sentiment, beach),
        )
        result = await predict_crowd(beach, weather, sentiment)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/beaches")
async def list_beaches():
    """Get predictions for all beaches"""
    tasks = [predict(beach) for beach in BEACHES]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    beaches = []
    alerts = []
    errors = []
    
    for result in results:
        if isinstance(result, Exception):
            errors.append(str(result))
            continue
        
        crowd_level_name = result.get("crowd_level", "Unknown")
        beach_data = {
            "beach": result.get("beach"),
            "crowd_level": crowd_level_name.lower() if crowd_level_name != "Unknown" else "unknown",
            "crowd_score": round((result.get("crowd_score", 0) * 100), 1),
            "sentiment_score": result.get("crowd_score", 0),
            "temperature": result.get("weather_summary", {}).get("temp", 0),
            "precipitation_probability": result.get("weather_summary", {}).get("rain", 0),
            "recommendation": result.get("advice", ""),
            "is_peak_hour": False,
            "is_weekend": False,
        }
        beaches.append(beach_data)
        
        if crowd_level_name in ["High", "Very High"]:
            alerts.append({
                "beach": result.get("beach"),
                "crowd_level": beach_data["crowd_level"],
                "urgency": "avoid" if crowd_level_name == "Very High" else "caution",
                "message": result.get("advice", ""),
            })
    
    return {
        "timestamp": datetime.datetime.now().isoformat(),
        "beaches": beaches,
        "alerts": alerts,
        "hotspot": beaches[0]["beach"] if beaches else None,
    }

@app.post("/alert/subscribe")
async def subscribe_alert(req: AlertRequest):
    if req.beach not in BEACHES:
        raise HTTPException(status_code=404, detail="Beach not found")
    return {
        "status": "subscribed",
        "beach": req.beach,
        "threshold": req.threshold,
        "message": f"You will be alerted when {req.beach} crowd score drops below {req.threshold}",
    }

@app.get("/health")
def health():
    return {"status": "ok"}
