# GoaTouristFlow — Design Document

**Version:** 1.0  
**Date:** March 2026  
**Status:** Draft  
**Audience:** Engineering leads, AI/ML team, UX designers

---

## 1. System Design Goals

- **Resilience over precision:** The pipeline must keep running even when individual data sources fail. A degraded prediction is better than no prediction.
- **Latency budget:** End users must receive an updated Crowd Density Score (CDS) within 2 minutes of a triggering social signal.
- **Cost consciousness:** All architectural choices prioritise free or near-free tiers at MVP scale.
- **Incremental accuracy:** The system improves each week via user-contributed ground-truth feedback.

---

## 2. High-Level Architecture

```
                    ┌─────────────────────────────────┐
                    │       External Data Sources      │
                    │  X API · Instagram · OWM ·       │
                    │  Google Places · Calendarific    │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │       Ingestion Workers          │
                    │     (Celery Beat Scheduler)      │
                    │  Fetch → Normalise → Deduplicate │
                    └──────────────┬──────────────────┘
                                   │
               ┌───────────────────▼─────────────────────┐
               │             Raw Data Lake               │
               │   PostgreSQL (raw_ingestion table)      │
               │   + Cloudflare R2 (post archive)        │
               └───────────────────┬─────────────────────┘
                                   │
               ┌───────────────────▼─────────────────────┐
               │          AI Analysis Pipeline           │
               │  LangChain SequentialChain:             │
               │  1. Clean & filter                      │
               │  2. Sentiment classification            │
               │  3. Hotspot aggregation                 │
               │  4. CDS computation                     │
               │  5. Anomaly detection                   │
               └───────────────────┬─────────────────────┘
                                   │
               ┌───────────────────▼─────────────────────┐
               │        Crowd Density Score Store        │
               │     TimescaleDB hypertable + Redis      │
               └────────┬──────────────────┬────────────┘
                        │                  │
          ┌─────────────▼────┐   ┌─────────▼──────────────┐
          │   FastAPI REST   │   │  WebSocket Broadcaster  │
          │   & Admin API    │   │  (live CDS push)        │
          └─────────┬────────┘   └─────────┬──────────────┘
                    │                       │
          ┌─────────▼───────────────────────▼──────────┐
          │              React PWA                      │
          │  Heat Map · Forecast Timeline · Alerts      │
          └─────────────────────────────────────────────┘
```

---

## 3. Data Model

### 3.1 Core Entities

```
beaches
  id               INT PK
  name             VARCHAR(120)
  slug             VARCHAR(60) UNIQUE
  latitude         NUMERIC(9,6)
  longitude        NUMERIC(9,6)
  district         VARCHAR(60)
  crz_zone         VARCHAR(20)
  created_at       TIMESTAMPTZ

raw_social_posts
  id               BIGSERIAL PK
  beach_id         INT FK → beaches
  source           ENUM('x', 'instagram', 'user_report')
  external_id      VARCHAR(80) UNIQUE   -- dedup key
  content_hash     VARCHAR(64)          -- SHA-256 of text
  raw_text         TEXT
  post_lang        VARCHAR(10)
  author_anon_id   VARCHAR(64)          -- hashed; PII-safe
  posted_at        TIMESTAMPTZ
  ingested_at      TIMESTAMPTZ
  ttl_expire       TIMESTAMPTZ          -- 30-day soft delete

weather_readings
  id               BIGSERIAL PK
  beach_id         INT FK → beaches
  recorded_at      TIMESTAMPTZ
  temp_celsius     NUMERIC(4,1)
  precipitation_mm NUMERIC(5,2)
  uv_index         NUMERIC(3,1)
  wind_kph         NUMERIC(4,1)
  condition_code   INT                  -- OWM condition code

crowd_density_scores          -- TimescaleDB hypertable
  beach_id         INT FK → beaches
  recorded_at      TIMESTAMPTZ
  cds              NUMERIC(4,2)         -- 1.00–10.00
  confidence       NUMERIC(4,2)         -- 0.00–1.00
  signal_count     INT                  -- # posts used
  model_version    VARCHAR(20)
  source           ENUM('ai','rules','user_aggregate')

users
  id               UUID PK
  email            VARCHAR(255) UNIQUE
  lang_pref        VARCHAR(10) DEFAULT 'en'
  push_endpoint    TEXT                 -- VAPID endpoint
  created_at       TIMESTAMPTZ

user_alert_prefs
  id               BIGSERIAL PK
  user_id          UUID FK → users
  beach_id         INT FK → beaches
  cds_threshold    NUMERIC(3,1)         -- alert when CDS ≤ this
  time_window_start TIME
  time_window_end  TIME
  active           BOOLEAN DEFAULT TRUE

user_crowd_reports
  id               BIGSERIAL PK
  user_id          UUID FK → users
  beach_id         INT FK → beaches
  reported_at      TIMESTAMPTZ
  crowd_rating     INT CHECK (1–5)      -- user 1-tap rating
  verified         BOOLEAN DEFAULT FALSE
```

### 3.2 Relationships

```
beaches 1──N raw_social_posts
beaches 1──N weather_readings
beaches 1──N crowd_density_scores
beaches 1──N user_alert_prefs
users   1──N user_alert_prefs
users   1──N user_crowd_reports
```

---

## 4. AI Pipeline Design

### 4.1 LangChain Pipeline — Step by Step

```
Input: List[RawSocialPost] for a beach in a 15-min window

Step 1 — TextCleanChain
  • Strip URLs, emojis, @mentions, #hashtags (keep hashtag text)
  • Translate non-English text via LLM if lang_pref != 'en'
  • Output: List[CleanedPost]

Step 2 — SentimentChain
  • Prompt: classify each post as one of:
      CROWD_HIGH | CROWD_LOW | CROWD_NEUTRAL | IRRELEVANT
  • Extract crowd-signal phrases (e.g., "packed", "quiet", "impossible to find parking")
  • Output: List[SentimentResult{label, confidence, key_phrases}]

Step 3 — AggregationChain
  • Weighted score per label:
      CROWD_HIGH   = +2.0
      CROWD_NEUTRAL = 0.0
      CROWD_LOW    = -2.0
      IRRELEVANT   = dropped
  • Normalise to 1–10 CDS range using sigmoid scaling
  • Blend with weather signal:
      Rain > 10mm/hr  → CDS × 0.6 (crowds disperse)
      Sunny + weekend → CDS × 1.2 (crowds amplify)
  • Blend with historical baseline (last 4 equivalent weekdays, same time slot)
  • Output: RawCDS{score, confidence, signal_count}

Step 4 — AnomalyDetectionChain
  • Check upcoming events calendar (Goa Carnival, Sunburn, public holidays)
  • If event within 24 hrs: apply event_multiplier (config-driven per event type)
  • Output: FinalCDS{score, confidence, anomaly_flag, anomaly_reason}

Step 5 — PersistenceStep (not LLM)
  • Write FinalCDS to TimescaleDB
  • Publish to Redis pub/sub channel `cds:{beach_id}`
  • Trigger alert evaluation worker
```

### 4.2 Prompt Templates (YAML, version-controlled)

**Sentiment Classification Prompt:**
```yaml
# ai/prompts/sentiment_v1.yaml
system: |
  You are a crowd-density analyst for Goa beaches.
  Classify each social media post into one of four categories:
  CROWD_HIGH, CROWD_LOW, CROWD_NEUTRAL, or IRRELEVANT.
  Also extract the top 3 crowd-signal phrases if present.
  Respond ONLY in valid JSON matching this schema:
  {"label": "CROWD_HIGH", "confidence": 0.87, "key_phrases": ["packed", "no space"]}

user: |
  Post: {post_text}
  Beach context: {beach_name}, {current_month}
```

### 4.3 Fallback Rule Engine

When LLM quota is exhausted or latency exceeds 5 seconds, the rule engine kicks in:

```python
CROWD_HIGH_KEYWORDS = {"packed", "crowded", "jammed", "no parking", "full", "rush"}
CROWD_LOW_KEYWORDS  = {"empty", "peaceful", "quiet", "serene", "deserted", "uncrowded"}

def rule_based_sentiment(text: str) -> SentimentLabel:
    tokens = set(text.lower().split())
    high = len(tokens & CROWD_HIGH_KEYWORDS)
    low  = len(tokens & CROWD_LOW_KEYWORDS)
    if high > low:   return SentimentLabel.CROWD_HIGH
    if low > high:   return SentimentLabel.CROWD_LOW
    return SentimentLabel.CROWD_NEUTRAL
```

---

## 5. API Design

### 5.1 Core Endpoints

```
GET  /api/v1/beaches
     → List all beaches with current CDS

GET  /api/v1/beaches/{slug}/score
     → Current CDS + confidence for one beach

GET  /api/v1/beaches/{slug}/forecast
     ?hours=48
     → Array of predicted CDS per hour for next N hours

GET  /api/v1/beaches/{slug}/history
     ?from=ISO8601&to=ISO8601
     → Historical CDS time series (for charts)

POST /api/v1/reports
     body: {beach_id, crowd_rating (1–5)}
     → Submit user crowd report (auth required)

POST /api/v1/alerts
     body: {beach_id, cds_threshold, time_window_start, time_window_end}
     → Subscribe to alert (auth required)

DELETE /api/v1/alerts/{id}
     → Remove alert subscription

GET  /api/v1/admin/dashboard
     → Aggregate heatmap data (admin role required)

POST /api/v1/admin/advisory
     body: {beach_id, message, severity}
     → Broadcast public advisory
```

### 5.2 WebSocket

```
WS /ws/beaches/{slug}
   Server pushes: {"beach_id": 2, "cds": 7.4, "ts": "2026-03-30T14:00:00Z"}
   every time a new CDS is computed for that beach
```

### 5.3 Response Shape (CDS)

```json
{
  "beach_id": 1,
  "beach_name": "Calangute",
  "slug": "calangute",
  "cds": 8.2,
  "confidence": 0.74,
  "label": "HIGH",
  "signal_count": 142,
  "weather": { "temp_c": 33, "condition": "Sunny", "uv": 9 },
  "anomaly": null,
  "recorded_at": "2026-03-30T14:15:00Z",
  "forecast_available": true
}
```

---

## 6. Frontend Design

### 6.1 Page Map

```
/                   → Landing page + quick beach selector
/map                → Full-screen heat map (primary UX)
/beaches/{slug}     → Beach detail: live CDS, 48-hr chart, weather
/alerts             → Manage alert subscriptions (auth required)
/report             → Quick crowd report form (auth required)
/admin              → Tourism board dashboard (role-gated)
/about              → How it works, data sources, accuracy note
```

### 6.2 Component Hierarchy (Map Screen)

```
<App>
  <NavBar />
  <MapPage>
    <LeafletMap>
      <HeatmapLayer data={cdsPoints} />
      <BeachMarker *n onClick→BeachPopup />
    </LeafletMap>
    <BeachPopup beach={selected}>
      <CrowdGauge cds={score} />
      <WeatherBadge />
      <AlertToggle />
      <ForecastMiniChart />
    </BeachPopup>
    <FilterBar>
      <TimeSlider />        ← scrub forecast hour
      <CrowdFilter />       ← show only LOW / MED / HIGH
    </FilterBar>
  </MapPage>
</App>
```

### 6.3 Crowd Density Visual Language

| CDS Range | Colour | Label | Heat Map Intensity |
|-----------|--------|-------|--------------------|
| 1.0 – 3.0 | `#22C55E` Green | LOW | Low opacity |
| 3.1 – 6.0 | `#F59E0B` Amber | MODERATE | Medium opacity |
| 6.1 – 8.0 | `#F97316` Orange | HIGH | High opacity |
| 8.1 – 10.0 | `#EF4444` Red | VERY HIGH | Maximum opacity |

### 6.4 Alert Flow

```
User lands on BeachPopup
→ Taps "Alert me when quiet"
→ Auth check (redirect to login if needed)
→ Alert config sheet slides up:
    Beach: Calangute (pre-filled)
    Notify me when crowd ≤ [slider: 3.0 LOW]
    Between [08:00] and [18:00]
→ Confirm → POST /api/v1/alerts
→ PWA push permission requested (if not yet granted)
→ Success toast: "You'll be notified when Calangute is quiet"

When CDS drops below threshold:
→ Alert worker queries user_alert_prefs
→ Web Push notification sent:
    "🌊 Calangute is now QUIET (CDS 2.8) — good time to head over!"
```

---

## 7. Notification Architecture

```
CDS written to DB
       ↓
Alert Worker (Celery task: check_alerts)
  • Queries users with active prefs for this beach
  • Filters by time_window (current IST time)
  • Filters where new CDS ≤ threshold AND previous CDS > threshold (edge trigger)
       ↓
Web Push Sender
  • Uses py-webpush library + VAPID keys
  • Payload: {title, body, url, badge, icon}
  • Retry on 5xx; remove subscription on 410 Gone
```

---

## 8. Weekly Model Improvement Loop

```
Monday 02:00 IST — Automated Retraining Job

1. Pull last 7 days of (cds_predicted, crowd_rating_actual) pairs
   where user_crowd_reports.verified = TRUE
2. Compute accuracy metrics:
   MAE, correlation between CDS and crowd_rating (1–5 → 2–10 scale)
3. If MAE > 1.5:
   a. Re-tune sentiment prompt weights
   b. Adjust weather multipliers
   c. Adjust baseline blend ratio
4. Write new model_version to config
5. Run back-test on held-out last 48 hrs
6. If back-test MAE improves: promote; else: roll back
7. Post metrics to Grafana dashboard + Slack webhook
```

---

## 9. Security Design

| Concern | Approach |
|---------|---------|
| Authentication | JWT (15-min access token + 7-day refresh token) via FastAPI-Users |
| Admin authorisation | Role field on users table; middleware checks `role == 'admin'` |
| Social post PII | `author_anon_id` = SHA-256(platform + user_id); raw user_id never stored |
| Post TTL | All raw_social_posts auto-deleted after 30 days via Celery cleanup job |
| API keys | Stored in Fly.io secrets; injected as env vars; never in codebase |
| HTTPS | Enforced at Cloudflare edge; HSTS header set |
| Rate limiting | 100 req/min per IP on public endpoints; 20 req/min on auth endpoints |
| CORS | Only `goatouristflow.in` and `localhost:5173` (dev) allowed |
| Input validation | All inputs parsed through Pydantic v2; SQL via SQLAlchemy ORM (no raw queries) |

---

## 10. Observability

| Signal | Tool | Alert Threshold |
|--------|------|-----------------|
| API p95 latency | Grafana Cloud | > 800 ms for 5 min |
| Ingestion worker failures | Sentry | Any unhandled exception |
| CDS staleness | Custom metric | Last update > 30 min for any beach |
| LLM error rate | LangSmith | > 10% failure in 1-hr window |
| Push delivery failure rate | Custom metric | > 20% failure rate |
| DB connection pool | Grafana | Pool saturation > 80% |

---

## 11. Open Design Questions

| # | Question | Decision Owner | Target By |
|---|---------|---------------|-----------|
| 1 | Should forecast use a fine-tuned regression model instead of pure LLM aggregation at v1.1? | AI Lead | Week 10 |
| 2 | Do we need a CCTV / computer vision fallback for ground truth when user reports are sparse? | Product | Week 8 |
| 3 | Should admin advisory notifications use WhatsApp Business API for wider reach among local operators? | Product + Business | Week 12 |
| 4 | Can we partner with Paytm/MakeMyTrip to receive anonymised booking density signals? | Business Dev | Week 14 |

---

*End of Design Document*
