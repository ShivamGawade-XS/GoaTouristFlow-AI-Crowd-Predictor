# GoaTouristFlow — Project Requirements Document

**Version:** 1.0  
**Date:** March 2026  
**Status:** Draft  
**Owner:** GoaTouristFlow Core Team

---

## 1. Executive Summary

GoaTouristFlow is an AI-powered tourist crowd prediction platform tailored for Goa's coastal destinations. By analysing real-time social media signals (X/Instagram), weather data, and historical footfall patterns, the system forecasts crowd density at key beaches and dispatches personalised low-crowd alerts to travellers — preventing the chaos that plagues peak-season hotspots like Calangute, Baga, and Anjuna.

The platform targets individual tourists, local tourism boards, beach shack operators, and hospitality businesses seeking data-driven crowd intelligence.

---

## 2. Goals & Objectives

| Goal | Success Metric |
|------|---------------|
| Predict crowd density 24–48 hrs ahead | ≥ 75% prediction accuracy vs ground truth |
| Surface low-crowd windows to users | ≥ 60% of alerted users report satisfactory beach experience |
| Reduce peak-hour concentration at top-5 beaches | 15% reduction in peak headcount YoY |
| Onboard Goa Tourism Board as institutional partner | Signed MOU within 12 months of launch |
| Achieve PWA install base of 10,000 within 6 months | Play/App store metrics + install events |

---

## 3. Stakeholders

| Role | Stakeholder | Interest |
|------|-------------|---------|
| Primary User | Domestic & international tourist | Low-crowd beach experience |
| Secondary User | Local tourism boards (GTDC) | Crowd management, safety |
| Business User | Beach shack & hotel operators | Footfall prediction for inventory |
| Internal | Product & Engineering team | On-time delivery, scalability |
| Regulatory | Goa State Coastal Zone Authority | Ecological compliance |

---

## 4. Scope

### 4.1 In Scope — MVP (v1.0)

- Social media ingestion pipeline (X API v2, Instagram Graph API)
- LLM-powered hotspot analysis (LangChain + Claude/GPT-4o)
- OpenWeatherMap integration for weather overlay
- Crowd density prediction engine (beach-level, hourly granularity)
- Web app (React PWA) with real-time crowd heat map
- Push notification system for personalised low-crowd alerts
- Admin dashboard for GTDC / tourism board operators
- REST API (FastAPI) for third-party integrations

### 4.2 Out of Scope — v1.0

- CCTV / computer vision footfall counting
- In-app booking or reservation features
- Mobile native apps (iOS/Android)
- Monetisation / paywalled tiers
- Beaches outside Goa state

---

## 5. Functional Requirements

### 5.1 Data Ingestion

| ID | Requirement |
|----|-------------|
| FR-01 | System shall ingest public posts from X (Twitter) API v2 filtered by geo-tags and beach-related keywords every 15 minutes |
| FR-02 | System shall ingest Instagram public hashtag data via Graph API every 30 minutes |
| FR-03 | System shall fetch hourly weather data (temperature, precipitation, UV index, wind speed) from OpenWeatherMap API |
| FR-04 | System shall pull historical Google Places popularity data as a baseline signal |
| FR-05 | All ingested data shall be timestamped, de-duplicated, and stored in a raw data lake |

### 5.2 AI Analysis & Prediction

| ID | Requirement |
|----|-------------|
| FR-06 | LLM pipeline shall perform sentiment analysis on social posts and classify crowd-related language (e.g., "packed," "empty," "serene") |
| FR-07 | System shall identify emerging crowd "hotspots" by correlating high positive sentiment volume with a specific beach and time window |
| FR-08 | Prediction engine shall output a Crowd Density Score (CDS) on a 1–10 scale per beach per hour for the next 48 hours |
| FR-09 | Model shall be retrained weekly using ground-truth feedback from user reports |
| FR-10 | System shall flag anomaly events (festivals, football matches, national holidays) and adjust predictions accordingly |

### 5.3 User-Facing Application

| ID | Requirement |
|----|-------------|
| FR-11 | Users shall view a real-time heat map of Goa beaches colour-coded by current CDS |
| FR-12 | Users shall set preferred beaches and receive push notifications when CDS drops below their chosen threshold |
| FR-13 | Users shall access a 48-hour crowd forecast timeline for any listed beach |
| FR-14 | Users shall submit a crowd report (a quick 1-tap field rating) to contribute ground-truth data |
| FR-15 | App shall function as an installable PWA with offline caching of last-known forecast |
| FR-16 | App shall support English, Hindi, and Konkani |

### 5.4 Admin & Operator Dashboard

| ID | Requirement |
|----|-------------|
| FR-17 | Tourism board operators shall access an aggregate demand heatmap across all listed beaches |
| FR-18 | Operators shall export weekly crowd trend reports as CSV/PDF |
| FR-19 | Operators shall configure alert thresholds and broadcast public advisories via the platform |
| FR-20 | System shall log all data sources, model versions, and prediction outputs for audit trails |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | API p95 response time ≤ 500 ms under 1,000 concurrent users |
| Availability | 99.5% uptime; graceful degradation if social APIs are rate-limited |
| Scalability | Horizontal scaling via containerisation; auto-scale on peak traffic events |
| Security | OAuth 2.0 for all user auth; PII anonymisation on social data within 24 hrs |
| Privacy | GDPR-aligned data handling; no storage of identifiable social user data |
| Accessibility | WCAG 2.1 AA compliance on the React front-end |
| Localisation | Date/time in IST; distance in kilometres |

---

## 7. Constraints

- Social API quotas limit ingestion volume; free tiers only at MVP
- LLM inference costs must remain under ₹5,000/month at launch scale
- Prediction accuracy is inherently probabilistic — no guarantee of precision during unprecedented events
- Beach geo-coordinates must comply with Coastal Regulation Zone (CRZ) notification boundaries

---

## 8. Assumptions

- X API v2 Basic tier is sufficient for MVP keyword volume
- OpenWeatherMap free tier (1,000 calls/day) covers all listed beaches
- Users grant notification permissions on PWA install
- Ground-truth crowd ratings from users are sufficient for weekly model fine-tuning

---

## 9. Beaches — MVP Coverage List

| Beach | District | Peak Season |
|-------|----------|-------------|
| Calangute | North Goa | Oct–Mar |
| Baga | North Goa | Oct–Mar |
| Anjuna | North Goa | Nov–Feb |
| Vagator | North Goa | Nov–Feb |
| Palolem | South Goa | Nov–Feb |
| Colva | South Goa | Oct–Mar |
| Morjim | North Goa | Nov–Feb |

---

## 10. Milestones

| Milestone | Target Date |
|-----------|-------------|
| Requirements sign-off | Week 1 |
| Data pipeline live (X + Weather) | Week 4 |
| LLM hotspot analysis prototype | Week 6 |
| React MVP with heat map | Week 8 |
| PWA + push notifications | Week 10 |
| Tourism board admin dashboard | Week 12 |
| Beta launch (closed) | Week 14 |
| Public launch | Week 18 |

---

## 11. Acceptance Criteria

- All FR-01 through FR-20 pass QA sign-off
- CDS prediction accuracy ≥ 70% on a 2-week back-test against known crowd events
- PWA Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices)
- Zero critical or high-severity security vulnerabilities at launch

---

*End of Project Requirements Document*
