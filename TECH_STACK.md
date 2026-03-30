# GoaTouristFlow — Tech Stack Reference

**Version:** 1.0  
**Date:** March 2026  
**Audience:** Engineering team, DevOps, technical reviewers

---

## 1. Architecture Overview

GoaTouristFlow is a three-tier web application built on a microservices-leaning monolith at MVP scale, with clear module boundaries to enable decomposition later.

```
┌──────────────────────────────────────────────────┐
│              Client Layer (PWA)                  │
│         React 18 · Vite · Tailwind CSS           │
└───────────────────┬──────────────────────────────┘
                    │ HTTPS / REST / WebSocket
┌───────────────────▼──────────────────────────────┐
│             API Layer (FastAPI)                  │
│    Auth · Crowd Score · Alerts · Admin           │
└──────┬────────────────────────┬──────────────────┘
       │                        │
┌──────▼──────┐        ┌────────▼──────────────┐
│  AI / LLM   │        │  Data Ingestion Workers│
│  LangChain  │        │  (Celery + Redis)      │
│  + LLM APIs │        │  X · Instagram · OWM   │
└──────┬──────┘        └────────┬───────────────┘
       │                        │
┌──────▼────────────────────────▼───────────────┐
│              Persistence Layer                 │
│   PostgreSQL (TimescaleDB) · Redis · S3        │
└───────────────────────────────────────────────┘
```

---

## 2. Frontend

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Framework | **React 18** | Component model ideal for real-time map updates and alert state management |
| Build tool | **Vite 5** | Sub-second HMR; tree-shaking for lean PWA bundles |
| Styling | **Tailwind CSS 3** | Utility-first; mobile-first responsive design out of the box |
| Map rendering | **Leaflet.js + react-leaflet** | Open-source, free tile layers (OpenStreetMap); no API costs |
| Heat map layer | **Leaflet.heat** | Lightweight client-side crowd density visualisation |
| State management | **Zustand** | Minimal boilerplate; suitable for crowd score and alert preference state |
| Data fetching | **TanStack Query (React Query)** | Cache, background refetch, and stale-while-revalidate for live CDS data |
| PWA | **Vite PWA Plugin (Workbox)** | Service worker, offline caching, install prompt |
| Push notifications | **Web Push API + VAPID** | Standards-based; no third-party push vendor needed at MVP |
| Charts / graphs | **Recharts** | Declarative, responsive; used for 48-hr forecast timeline |
| Internationalisation | **react-i18next** | English, Hindi, Konkani support |
| Form validation | **React Hook Form + Zod** | Type-safe; minimal re-renders |

---

## 3. Backend API

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Framework | **FastAPI 0.111** | Async-native; auto OpenAPI docs; Python ecosystem parity with AI libs |
| ASGI server | **Uvicorn + Gunicorn** | Production-grade process management |
| Authentication | **FastAPI-Users + JWT** | OAuth2 password / social login flows |
| Validation | **Pydantic v2** | Runtime type safety; used across API + internal data models |
| Task queue | **Celery 5** | Distributed periodic ingestion jobs; retry logic for API failures |
| Message broker | **Redis 7** | Celery broker + result backend; also used for pub/sub on live CDS updates |
| WebSockets | **FastAPI WebSocket** | Push live CDS updates to connected browser clients |
| API versioning | `/api/v1/` prefix routing | Forward-compatible for third-party integrations |
| Rate limiting | **slowapi** | Per-IP + per-user limits to protect ingestion budget |
| CORS | **FastAPI CORS middleware** | Configured per-environment |

---

## 4. AI / LLM Layer

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Orchestration | **LangChain 0.2** | Chain-based pipeline: ingest → clean → sentiment → score → store |
| LLM provider | **Anthropic Claude 3 Haiku** (primary) / **OpenAI GPT-4o-mini** (fallback) | Cost-efficient for high-volume social post analysis |
| Embeddings | **sentence-transformers (MiniLM-L6)** | Local, free; used for semantic deduplication of social posts |
| Sentiment analysis | LangChain `LLMChain` with structured output parser | Extracts crowd sentiment + crowd-signal keywords from posts |
| Hotspot detection | Custom `SequentialChain` | Aggregates sentiment scores by beach + time window → CDS computation |
| Prompt management | **LangChain PromptTemplate** | Version-controlled prompts stored as YAML in `/ai/prompts/` |
| Observability | **LangSmith** (free tier) | Trace LLM calls; catch prompt regressions |
| Fallback | Rule-based heuristics (keyword matching) | If LLM quota exhausted, rules keep the pipeline alive |
| Vector store (future) | **Chroma** (planned v1.1) | For semantic search over historical post archive |

---

## 5. Data Ingestion

| Source | Library / Method | Cadence |
|--------|-----------------|---------|
| X (Twitter) API v2 | `tweepy` filtered stream + search endpoint | Every 15 min |
| Instagram Graph API | `requests` + hashtag search | Every 30 min |
| OpenWeatherMap | `pyowm` wrapper | Hourly |
| Google Places Popularity | Scraper via `playwright` (Popular Times) | Daily baseline |
| User crowd reports | FastAPI endpoint → PostgreSQL | Real-time |
| Public holidays (India) | Static YAML file + Calendarific API | Weekly refresh |

---

## 6. Data Persistence

| Store | Technology | Usage |
|-------|-----------|-------|
| Primary DB | **PostgreSQL 16 + TimescaleDB extension** | Time-series CDS scores, raw ingestion log, user data |
| Cache | **Redis 7** | Session tokens, rate limit counters, live CDS broadcast |
| Object storage | **Cloudflare R2** (S3-compatible, free egress) | Raw social post archives, model artefacts |
| Search (future) | **Meilisearch** | Full-text search over beach descriptions and advisories |

### Key TimescaleDB Hypertables

```sql
-- Partitioned by beach_id and time for fast range queries
CREATE TABLE crowd_density_scores (
  id          BIGSERIAL,
  beach_id    INT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  cds         NUMERIC(4,2),
  source      TEXT,
  PRIMARY KEY (beach_id, recorded_at)
);
SELECT create_hypertable('crowd_density_scores', 'recorded_at');
```

---

## 7. Infrastructure & Deployment

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Containerisation | **Docker + Docker Compose** | Consistent dev/prod environments |
| Orchestration (prod) | **Fly.io** (free starter) / **Render.com** | Low-cost, managed Postgres + Redis; no K8s overhead at MVP |
| CI/CD | **GitHub Actions** | Lint → test → build → deploy on push to `main` |
| Secrets management | **GitHub Secrets + Fly.io secrets** | API keys never in source code |
| CDN | **Cloudflare** (free tier) | Static asset caching; DDoS protection |
| Monitoring | **Grafana Cloud** (free 10k metrics) + **Sentry** (free 5k errors/mo) | Uptime, API latency, error tracking |
| Logging | **structlog** → stdout → **Loki** (Grafana Cloud) | Structured JSON logs; searchable |

---

## 8. Development Tooling

| Tool | Purpose |
|------|---------|
| `uv` (Python pkg manager) | Fast dependency resolution; replaces pip + virtualenv |
| `ruff` | Python linter + formatter (replaces flake8 + black) |
| `mypy` | Static type checking on all backend modules |
| `pytest` + `pytest-asyncio` | Unit + integration tests for FastAPI routes and LangChain chains |
| `Vitest` + `React Testing Library` | Frontend unit tests |
| `Playwright` | E2E browser tests for critical user flows |
| `pre-commit` | Enforce linting and type checks before every commit |
| `Swagger UI` | Auto-generated from FastAPI; always up-to-date API docs |

---

## 9. Free / Open-Source Budget Summary

| Service | Free Tier Limit | Expected Usage |
|---------|----------------|----------------|
| X API v2 Basic | 10,000 posts/month read | ~8,000/month at MVP |
| Instagram Graph API | 200 calls/hour | ~150/hour average |
| OpenWeatherMap Free | 1,000 calls/day | ~336/day (7 beaches × 48 hrs) |
| Anthropic Claude Haiku | Pay-per-token (~₹0.08/1K tokens) | ~₹2,000–3,000/month est. |
| Fly.io Hobby | 3 shared-CPU VMs, 3 GB RAM | Sufficient for MVP |
| Cloudflare R2 | 10 GB storage, 1M class-A ops | Sufficient for MVP |
| LangSmith | 10,000 traces/month | Sufficient for dev + staging |
| Sentry | 5,000 errors/month | Sufficient for MVP |

---

## 10. Repository Structure

```
goatouristflow/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI routers
│   │   ├── core/          # Config, auth, DB session
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic layer
│   │   └── workers/       # Celery ingestion tasks
│   ├── ai/
│   │   ├── chains/        # LangChain chain definitions
│   │   ├── prompts/       # YAML prompt templates
│   │   └── evaluators/    # LangSmith eval datasets
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/         # Zustand stores
│   │   └── locales/       # i18n JSON files
│   └── public/
├── infra/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── .github/workflows/
└── docs/
```

---

*End of Tech Stack Reference*
