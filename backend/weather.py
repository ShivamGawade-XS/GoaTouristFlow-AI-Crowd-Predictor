import httpx

# Goa beach coordinates
BEACH_COORDS = {
    "Calangute": (15.5440, 73.7528),
    "Baga": (15.5553, 73.7517),
    "Anjuna": (15.5739, 73.7404),
    "Palolem": (15.0100, 74.0232),
    "Vagator": (15.5994, 73.7362),
    "Colva": (15.2793, 73.9120),
}

async def get_weather(beach: str) -> dict:
    lat, lon = BEACH_COORDS.get(beach, (15.5440, 73.7528))
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,precipitation,windspeed_10m,weathercode"
        f"&hourly=temperature_2m,precipitation_probability"
        f"&forecast_days=1"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()

    current = data["current"]
    hourly = data["hourly"]

    # Next 6 hours precipitation probability average
    precip_probs = hourly["precipitation_probability"][:6]
    avg_precip = sum(precip_probs) / len(precip_probs) if precip_probs else 0

    return {
        "temperature": current["temperature_2m"],
        "precipitation": current["precipitation"],
        "windspeed": current["windspeed_10m"],
        "weathercode": current["weathercode"],
        "avg_precip_next6h": avg_precip,
        "beach": beach,
    }
