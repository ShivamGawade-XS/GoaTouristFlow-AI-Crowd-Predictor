import random
from datetime import datetime

# Simulated social media posts per beach (mocking X/Instagram scraping)
MOCK_POSTS = {
    "Calangute": [
        "Calangute beach is absolutely packed today! Can barely move 😩 #Goa #Calangute",
        "Huge crowd at Calangute, avoid if you want peace #GoaTourism",
        "Calangute is buzzing with tourists! Great vibe but very crowded 🌊",
        "So many people at Calangute beach today, parking nightmare",
        "Calangute beach crowd is insane this weekend #overcrowded",
    ],
    "Baga": [
        "Baga beach party scene is wild tonight! Tons of people #Baga",
        "Baga is moderately busy, still found a good spot 🏖️",
        "Nice morning at Baga, not too crowded yet",
        "Baga beach shacks are full, long wait times #GoaLife",
    ],
    "Anjuna": [
        "Anjuna flea market day, beach is quieter than usual 😊",
        "Peaceful morning at Anjuna, highly recommend #HiddenGem",
        "Anjuna beach is perfect today, very few tourists",
        "Loved the calm vibes at Anjuna this afternoon",
    ],
    "Palolem": [
        "Palolem is paradise! Not too crowded, crystal clear water 🌴",
        "Palolem beach is serene and beautiful today",
        "Fewer tourists at Palolem, best beach in South Goa!",
        "Palolem is getting popular but still manageable crowds",
    ],
    "Vagator": [
        "Vagator beach is stunning and relatively empty today!",
        "Great sunset at Vagator, only a handful of people",
        "Vagator is the hidden gem of North Goa 🌅",
    ],
    "Colva": [
        "Colva beach is quite busy today with local tourists",
        "Colva is moderately crowded, decent beach day",
        "Colva beach shacks are lively this evening",
    ],
}

def get_sentiment(beach: str) -> dict:
    posts = MOCK_POSTS.get(beach, MOCK_POSTS["Calangute"])
    # Add time-based variation
    hour = datetime.now().hour
    is_peak_hour = 10 <= hour <= 18
    is_weekend = datetime.now().weekday() >= 5

    # Simulate sentiment scores (-1 negative/empty to +1 positive/crowded)
    base_scores = {
        "Calangute": 0.85,
        "Baga": 0.70,
        "Anjuna": 0.30,
        "Palolem": 0.25,
        "Vagator": 0.15,
        "Colva": 0.55,
    }
    base = base_scores.get(beach, 0.5)
    noise = random.uniform(-0.1, 0.1)
    peak_boost = 0.15 if is_peak_hour else 0
    weekend_boost = 0.10 if is_weekend else 0

    crowd_score = min(1.0, max(0.0, base + noise + peak_boost + weekend_boost))

    # Pick relevant posts
    sample_posts = random.sample(posts, min(3, len(posts)))

    return {
        "beach": beach,
        "crowd_sentiment_score": round(crowd_score, 2),
        "post_count_simulated": random.randint(120, 800),
        "sample_posts": sample_posts,
        "is_peak_hour": is_peak_hour,
        "is_weekend": is_weekend,
    }
