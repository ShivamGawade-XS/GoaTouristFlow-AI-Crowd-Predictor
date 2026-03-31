import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CROWD_LEVELS = {
    (0.0, 0.25): ("Low", "green", "Great time to visit! Very few crowds expected."),
    (0.25, 0.50): ("Moderate", "yellow", "Manageable crowds. Go early morning for best experience."),
    (0.50, 0.75): ("High", "orange", "Busy beach. Consider visiting after 5 PM or try nearby alternatives."),
    (0.75, 1.01): ("Very High", "red", "Extremely crowded. Strongly recommend alternative beaches."),
}

def get_crowd_level(score: float) -> tuple:
    for (low, high), info in CROWD_LEVELS.items():
        if low <= score < high:
            return info
    return ("Unknown", "gray", "No data available.")

async def predict_crowd(beach: str, weather: dict, sentiment: dict) -> dict:
    crowd_score_raw = (sentiment["crowd_sentiment_score"] * 0.6) + (
        (1 - min(weather["avg_precip_next6h"] / 100, 1)) * 0.4
    )
    # Rain reduces crowds
    if weather["precipitation"] > 2:
        crowd_score_raw *= 0.6
    if weather["weathercode"] in [61, 63, 65, 80, 81, 82]:  # Rain codes
        crowd_score_raw *= 0.7

    crowd_score = round(min(1.0, max(0.0, crowd_score_raw)), 2)
    level, color, advice = get_crowd_level(crowd_score)

    # LLM insight
    llm_insight = await _get_llm_insight(beach, weather, sentiment, level)

    # Best time recommendation
    best_times = _get_best_times(crowd_score, weather)

    return {
        "beach": beach,
        "crowd_score": crowd_score,
        "crowd_level": level,
        "color": color,
        "advice": advice,
        "best_times": best_times,
        "llm_insight": llm_insight,
        "weather_summary": {
            "temp": weather["temperature"],
            "wind": weather["windspeed"],
            "rain": weather["precipitation"],
        },
        "social_posts": sentiment["sample_posts"],
    }

async def _get_llm_insight(beach: str, weather: dict, sentiment: dict, level: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key == "your_openai_api_key_here":
        return _fallback_insight(beach, weather, sentiment, level)

    try:
        prompt = f"""You are a Goa tourism assistant. Analyze crowd conditions at {beach} beach.

Data:
- Crowd level: {level}
- Social sentiment score: {sentiment['crowd_sentiment_score']} (0=empty, 1=packed)
- Temperature: {weather['temperature']}°C
- Wind: {weather['windspeed']} km/h  
- Precipitation: {weather['precipitation']} mm
- Peak hour: {sentiment['is_peak_hour']}, Weekend: {sentiment['is_weekend']}
- Sample posts: {sentiment['sample_posts'][:2]}

Give a 2-sentence actionable insight for a tourist. Be specific and helpful."""

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return _fallback_insight(beach, weather, sentiment, level)

def _fallback_insight(beach: str, weather: dict, sentiment: dict, level: str) -> str:
    temp = weather["temperature"]
    wind = weather["windspeed"]
    rain = weather["precipitation"]

    if rain > 2:
        return f"{beach} beach has reduced crowds due to rainfall ({rain}mm). Perfect for a quiet walk, but carry an umbrella."
    if level == "Low":
        return f"{beach} is pleasantly uncrowded right now with {temp}°C weather. Ideal time to visit and enjoy the beach peacefully."
    if level == "Very High":
        return f"{beach} is extremely crowded. With {temp}°C and {wind} km/h winds, consider Vagator or Anjuna for a calmer experience."
    return f"{beach} has {level.lower()} crowds at {temp}°C. {'Winds are strong at ' + str(wind) + ' km/h — good for water sports.' if wind > 20 else 'Conditions are pleasant for a beach visit.'}"

def _get_best_times(score: float, weather: dict) -> list:
    if score < 0.3:
        return ["Now is a great time!", "Early morning (6-9 AM)", "Late evening (6-8 PM)"]
    if score < 0.6:
        return ["Early morning (6-9 AM)", "Late evening (6-8 PM)", "Weekday mornings"]
    return ["Early morning (6-8 AM)", "Post-monsoon weekdays", "Late evening after 7 PM"]
