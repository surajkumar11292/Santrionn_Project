# Disaster Response Coordination Platform

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-PostGIS_3.3-336791?logo=postgresql&logoColor=white)](https://postgis.net/)
[![Redis](https://img.shields.io/badge/Redis_7-Cache--Aside-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO_4-Real--Time_Rooms-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Express.js](https://img.shields.io/badge/Express_4-REST_API-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React_18-Vite_6-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker_Compose-100%25_Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

A mission-critical, backend-focused disaster response coordination platform engineered to manage crisis incidents, automatically resolve crisis locations via natural language processing, perform geospatial proximity queries for emergency relief assets (PostGIS `ST_DWithin`), ingest external social intelligence streams via a Redis Cache-Aside pattern, and broadcast live incident updates through WebSocket room channels.

---

## 📋 Table of Contents
1. [Quick Start & Setup](#-quick-start--setup)
   - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
   - [Option B: Local Development Setup (Manual)](#option-b-local-development-setup-manual)
2. [Active Service Endpoints](#-active-service-endpoints)
3. [System Architecture](#-system-architecture)
4. [Technical Decisions & Engineering Rationale](#-technical-decisions--engineering-rationale)
   - [1. Database Selection & Geospatial Search](#1-database-selection--geospatial-search)
   - [2. Caching Strategy (Cache-Aside Pattern)](#2-caching-strategy-cache-aside-pattern)
   - [3. External API Fault Tolerance & Graceful Degradation](#3-external-api-fault-tolerance--graceful-degradation)
   - [4. Natural Language Location Resolution](#4-natural-language-location-resolution)
   - [5. Real-Time Telemetry (Socket.IO Rooms)](#5-real-time-telemetry-socketio-rooms)
   - [6. Authentication & RBAC Matrix](#6-authentication--rbac-matrix)
5. [Bonus Features Implemented](#-bonus-features-implemented)
6. [API Specification & Endpoints](#-api-specification--endpoints)
7. [Trade-offs & Production Considerations](#-trade-offs--production-considerations)
8. [Automated Test Suite](#-automated-test-suite)
9. [AI Tool Usage Disclosure](#-ai-tool-usage-disclosure)

---

## ⚡ Quick Start & Setup

### Option A: Docker Compose (Recommended)
The entire platform runs in isolated Docker containers with zero host system dependencies required (except Docker and Docker Compose).

```bash
# 1. Clone repository
git clone https://github.com/surajkumar11292/Santrionn_Project.git
cd Santrionn_Project

# 2. Copy environment template
cp .env.example .env

# 3. Launch containerized ecosystem
docker compose up -d --build
```
> The startup scripts automatically run database schema migrations (`npm run migrate`) and insert realistic seed incident records (`npm run seed`).

---

### Option B: Local Development Setup (Manual)
If you prefer running services directly on your host machine:

#### Prerequisites
- Node.js (v18+) & pnpm / npm
- PostgreSQL (v14+) with PostGIS extension installed
- Redis server (v6+)

#### 1. Database & Cache Setup
```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE disaster_response;
\c disaster_response
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### 2. Backend Setup
```bash
cd backend
cp .env.example .env

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed database with users, disasters, and relief assets
npm run seed

# Start development API server
npm run dev
```

#### 3. Frontend Setup
```bash
cd ../frontend
cp .env.example .env

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 🌐 Active Service Endpoints

| Service | Endpoint | Description |
|---|---|---|
| **Mission Command Frontend** | [`http://localhost:5173`](http://localhost:5173) | Dark operate-mode React dashboard & Leaflet spatial map |
| **Backend RESTful API** | [`http://localhost:3000`](http://localhost:3000) | Express.js API gateway |
| **Interactive OpenAPI / Swagger** | [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) | Complete Swagger UI documentation & sandbox |
| **Real-Time WebSocket Monitor** | [`http://localhost:3000/socket-test`](http://localhost:3000/socket-test) | Interactive live Socket.IO verification client |
| **PostgreSQL / PostGIS** | `localhost:5433` (internal `5432`) | Spatial database engine |
| **Redis In-Memory Cache** | `localhost:6379` | LRU Cache-Aside layer |

### Evaluation Credentials (Pre-seeded in DB)
- **Admin**: `admin@relief.io` / `admin123` (Full Clearance: CRUD incidents, delete, dispatch bulletins, manage resources)
- **Contributor**: `contrib@relief.io` / `contrib123` (First Responder: Create/update incidents)
- **Viewer**: `viewer@relief.io` / `viewer123` (Auditor / Citizen: Read-only access)

*(1-Click clearance preset buttons are available on the login page to populate credentials without automatic submission).*

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["1. Client & Operator Layer"]
        UI["React 18 + Vite (Operate Mode Dashboard)"]
        Map["Leaflet Spatial Map (Dark Matter Tiles)"]
        SocketClient["Socket.IO Client (Real-Time Rooms)"]
    end

    subgraph GatewayLayer["2. Gateway & Middleware Layer"]
        AuthMiddleware["JWT & RBAC Middleware\n(admin, contributor, viewer)"]
        JoiValidator["Joi Schema Validation"]
        SocketGateway["Socket.IO Server Gateway\n(disaster:<id> rooms & global feed)"]
    end

    subgraph ServiceLayer["3. Business Logic Layer"]
        direction TB
        subgraph CoreServices["Incident Lifecycle & Real-Time Engine"]
            DisasterService["Disaster Service\n(Incident Lifecycle)"]
            ImageService["Incident Photography Service\n(Site Documentation & Gallery)"]
            QueueService["Background Queue & Worker\n(FIFO State Machine & Ingestion)"]
        end
        subgraph SpatialFeeds["Spatial Intelligence & Feed Ingestion"]
            GeoService["Progressive Hierarchical Geocoder\n(NLP Entity + Multi-Tier OSM Nominatim)"]
            ResourceService["Resource Proximity Service\n(PostGIS ST_DWithin)"]
            ReportService["Report Ingestion Service\n(Normalization & Heuristic Classifier)"]
        end
    end

    subgraph ExternalLayer["4. External Services & Upstream Feeds"]
        OSM["OpenStreetMap Nominatim API\n(Multi-Tier Progressive Geocoding)"]
        ExternalSocial["Mock Crisis Social Stream\n(Fault-Tolerant Crisis Intel)"]
    end

    subgraph DataLayer["5. Storage & In-Memory Cache"]
        Postgres[("PostgreSQL 15 + PostGIS 3.3\n(GEOGRAPHY Point, GiST Spatial Index)")]
        RedisCache[("Redis 7 In-Memory Cache\n(Cache-Aside 300s/120s/24h + Job Queues)")]
    end

    %% Client to Gateway
    UI --> AuthMiddleware
    Map --> AuthMiddleware
    SocketClient <--> SocketGateway

    %% Gateway to Services
    AuthMiddleware --> JoiValidator
    JoiValidator --> DisasterService
    JoiValidator --> ResourceService
    JoiValidator --> ReportService
    JoiValidator --> ImageService
    JoiValidator --> QueueService

    %% Service to Service
    DisasterService --> GeoService

    %% Service to External APIs
    GeoService --> OSM
    ReportService --> ExternalSocial

    %% Services to Data & Cache
    DisasterService --> Postgres
    ResourceService --> Postgres
    ResourceService --> RedisCache
    ReportService --> Postgres
    ReportService --> RedisCache
    ImageService --> Postgres
    ImageService --> RedisCache
    GeoService --> RedisCache
    QueueService --> RedisCache

    %% Real-time Socket Dispatches
    DisasterService -.-> SocketGateway
    ReportService -.-> SocketGateway
    ImageService -.-> SocketGateway
```

---

## 📐 Technical Decisions & Engineering Rationale

### 1. Database Selection & Geospatial Search
**Why PostgreSQL + PostGIS?**
- **True Spherical Mathematics**: Standard flat-plane distance formulas (like the Pythagorean theorem or in-memory Haversine iterations) introduce significant spatial distortions across different latitudes and require expensive full table scans ($O(N)$ CPU complexity).
- **PostGIS `GEOGRAPHY(Point, 4326)`**: Native WGS 84 ellipsoidal coordinate storage natively accounts for the curvature of the Earth without manual projection math.
- **R-Tree GiST Spatial Indexing (`ST_DWithin`)**:
  ```sql
  SELECT 
    r.id, r.name, r.type, r.location_name,
    r.latitude, r.longitude, r.capacity, r.status,
    ROUND((ST_Distance(r.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) / 1000.0)::numeric, 2) AS distance_km
  FROM resources r
  WHERE ST_DWithin(r.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)
  ORDER BY distance_km ASC;
  ```
  `ST_DWithin` leverages PostgreSQL's **GiST (Generalized Search Tree)** index, executing radius queries in logarithmic $O(\log N)$ time rather than evaluating distances against every record in the table.

---

### 2. Caching Strategy (Cache-Aside Pattern)
Redis 7 is deployed with an **allkeys-lru** eviction policy to enforce the Cache-Aside pattern:

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API as Express API
    participant Cache as Redis 7
    participant Ext as Mock Social Stream
    participant DB as PostgreSQL 15

    Client->>API: GET /disasters/:id/reports
    API->>Cache: GET reports:disaster:{id}
    alt Cache Hit
        Cache-->>API: Return cached JSON payload
        API-->>Client: 200 OK (meta: { cached: true, cache_ttl: 240 })
    else Cache Miss
        Cache-->>API: null
        API-->>Ext: Fetch external social stream (fault-tolerant)
        Ext-->>API: Raw posts array
        API-->>DB: Fetch persistent field reports
        DB-->>API: DB rows
        API-->>API: Normalize & Classify priority (critical/high/med/low)
        API-->>Cache: SETEX reports:disaster:{id} 300 (5-min TTL)
        API-->>Client: 200 OK (meta: { cached: false, cache_ttl: 300 })
    end
```

#### Cache TTL Selection:
- `reports:disaster:<id>`: **300 seconds (5 minutes)**. Eliminates repeated external network roundtrips during crisis surges while ensuring citizen field intel stays fresh.
- `resources:<id>:<lat>:<lng>:<radius>`: **120 seconds (2 minutes)**. Balances real-time resource availability against repeated spatial radial computations.
- `geocode:<normalized_string>`: **86,400 seconds (24 hours)**. Geographic coordinates of cities, districts, and landmarks are static.
- `images:disaster:<id>`: **180 seconds (3 minutes)**. Caches disaster field photography gallery and site conditions.

---

### 3. External API Fault Tolerance & Graceful Degradation
- Upstream social intelligence feeds are inherently prone to rate limits, network partitions, and 5xx outages.
- The `ReportService` implements a **fail-safe fallback strategy**: if the external stream fails or times out, the error is logged as a non-fatal warning, local persistent reports from PostgreSQL are loaded, and the API responds with:
  ```json
  "meta": {
    "cached": false,
    "external_status": "DEGRADED_FALLBACK"
  }
  ```
- **Zero-Crash Invariant**: External service outages never trigger an unhandled 500 error or disrupt internal relief operations.

---

### 4. Location Resolution (NLP & Progressive Hierarchical Geocoding)
Incident reporting in crisis scenarios often involves ambiguous, unpunctuated, colloquial, or micro-locality spatial descriptions. The platform implements a production-grade, multi-tier geocoding resolution pipeline designed to resolve coordinates to verified administrative anchors while preserving spatial data integrity:

1. **Dual Ingestion Paths (Explicit vs. NLP Extracted)**:
   - **Explicit Location Input**: When field responders supply an explicit location (e.g., via the *Specific Location* field), it is ingested directly without destructive token truncation.
   - **Autonomous Narrative Extraction**: For unpunctuated situational titles (*"Heavy rain at urjanagar, khagual, patna, bihar causing inundation"*), regex contextual boundary parsers isolate the spatial clause after prepositional cues (`in`, `at`, `near`, `across`, `affected`) while cleanly discarding consequence clauses (`causing...`, `leading to...`, `with...`).

2. **Progressive Hierarchical Suffix Evaluation (Specific-to-Broad)**:
   - Remote villages, sectors, and micro-localities (e.g., *Urjanagar*) are frequently unindexed in global cartographic databases. Rather than failing or querying isolated words that accidentally match identically named villages in unrelated states, the resolver evaluates candidate suffixes progressively (`segments.slice(i).join(', ')`):
     - **Tier 1 (Sub-locality)**: `urjanagar, khagual, patna, bihar` $\rightarrow$ Unindexed village (0 hits).
     - **Tier 2 (Administrative Town)**: `khagual, patna, bihar` $\rightarrow$ **Exact Match**: `Goverment hospital, Khagual, Moti Chowk Road, Patna, Bihar [25.578, 85.048]`.
     - **Tier 3 (District Anchor)**: If Khagaul were also unindexed, automatically steps back to `patna, bihar` (`[25.609, 85.123]`).
     - **Tier 4 (State Anchor)**: Steps back to `bihar` (`[25.644, 85.906]`).
   - **Original Text Invariant**: Crucially, the incident details, broadcast feed, and database records **100% preserve the operator's original input string** (e.g., *"urjanagar, khagual, patna, bihar"* or *"Army Public School Danapur Cantt"*). Only the spatial latitude/longitude coordinate pair is mapped to the nearest verified administrative anchor.

3. **Institutional & Facility Stop-Word Filtering**:
   - Institutional facilities (e.g., *"Army public school danapur cantt"*) previously risked matching random namesake buildings in distant states (e.g. an Army Public School pond in Kolkata).
   - The engine enforces an `AMENITY_STOP_WORDS` dictionary (`army`, `public`, `school`, `college`, `hospital`, `station`, `mandir`, `temple`, `gate`, `road`, `street`, `gali`, etc.).
   - Pure amenity pairs (`"army public"`, `"public school"`) are strictly blocked from external queries.
   - Leading facility tokens are stripped to isolate the true geographic anchor (`"danapur cantt"`), resolving accurately to Danapur Cantonment, Dinapur-Cum-Khagaul, Patna, Bihar (`[25.634, 85.030]`).

4. **Live OpenStreetMap Nominatim with Domestic Country Prioritization**:
   - Prioritizes Indian administrative boundaries (`countrycodes=in`) using an `AbortController` timeout (2500ms), falling back globally for international crisis events.

5. **Zero-Silent-Failure Invariant (Deterministic HTTP 400)**:
   - Arbitrary silent fallbacks (such as misreporting unresolvable input to Mumbai) have been completely eliminated.
   - If an unresolvable string (e.g., nonsensical text or unindexed territory) is supplied across all candidate tiers, the API immediately throws an explicit `400 Bad Request` (`BadRequestError`) with an actionable error envelope, ensuring crisis spatial integrity.

6. **Redis Cache-Aside Layer**:
   - Every resolved coordinate pair is cached in Redis under `geocode:<normalized_string>` with a 24-hour (86,400s) TTL, ensuring sub-millisecond retrieval on recurring spatial queries.

---

### 5. Real-Time Telemetry (Socket.IO Rooms)
Rather than broadcasting every packet to every connected client, Socket.IO utilizes **room-based pub/sub isolation**:
- `io.emit('disaster_created')`: Broadcasts new incidents to global crisis command feeds.
- `io.emit('disaster_updated')`: Broadcasts status changes across all operator views.
- `io.to('disaster:<id>')`: Scopes incoming community reports, verified damage imagery, and official bulletins to operators subscribed to that specific crisis room.

---

### 6. Authentication & RBAC Matrix
Stateless JWT Bearer tokens encode cryptographically verified role claims:

| Action / Route | Viewer | Contributor | Admin |
|---|:---:|:---:|:---:|
| View Incidents (`GET /disasters`) | ✅ | ✅ | ✅ |
| View Resources & Reports | ✅ | ✅ | ✅ |
| Report Disaster (`POST /disasters`) | ❌ (403) | ✅ | ✅ |
| Update Status (`PATCH /disasters/:id`) | ❌ (403) | ✅ | ✅ |
| Delete Disaster (`DELETE /disasters/:id`) | ❌ (403) | ❌ (403) | ✅ |
| Register Resource (`POST /disasters/:id/resources`) | ❌ (403) | ❌ (403) | ✅ |
| Broadcast Bulletin (`POST /disasters/:id/updates`) | ❌ (403) | ❌ (403) | ✅ |

---

## 🎁 Bonus Features Implemented

1. **Incident Photography & Field Documentation (`POST /disasters/:id/verify-image` & `GET /disasters/:id/images`)**:
   - Field photo submission and verification pipeline allowing first responders and verified citizens to document real-time site conditions, structural damage, road closures, and flood levels with timestamped captions.
   - Caches disaster photo galleries in Redis (`images:disaster:<id>`) with real-time WebSocket broadcast (`image_verified`) across connected operational terminals.
2. **Official Emergency Bulletins (`POST /disasters/:id/updates` & `GET /disasters/:id/updates`)**:
   - Dedicated authority broadcasting channel for emergency agencies (FEMA, NWS, Civil Defense) with severity classification (`advisory`, `warning`, `evacuation`, `all_clear`).
   - Emits real-time WebSocket alerts to connected operators.
3. **Priority Classification of Community Reports**:
   - Heuristic triage classifier categorizing citizen field reports into `critical`, `high`, `medium`, and `low` based on life-safety indicators (trapped individuals, gas leaks, water deprivation, medical needs).
4. **Interactive Spatial Radar (`MapView.jsx`)**:
   - Tactical dark Leaflet cartography map featuring live epicenter pins, color-coded severity markers, dynamic radial range rings (10km - 100km), operational status filtering, global KPI metric counters (Total, Active, Monitoring, Resolved) preserved across filtered views, coordinate readouts, and one-click incident details popups.
5. **Asynchronous Distributed Job Queue (`POST /disasters/:id/sync-reports` & `GET /jobs/:id`)**:
   - Redis-backed background FIFO queue with state machine (`queued` $\rightarrow$ `processing` $\rightarrow$ `completed` / `failed`), decoupled worker loop, HTTP 202 Accepted response, and real-time Socket.IO completion alerts.

---

## 📡 API Specification & Endpoints

### 1. Disaster Management
- `POST /disasters`: Create incident (Admin, Contributor)
- `GET /disasters`: List incidents with filters (`?tag=flood&status=active&search=mumbai&page=1&limit=10`)
- `GET /disasters/:id`: Get full incident details by UUID
- `PATCH /disasters/:id`: Update incident status/tags (Admin, Contributor)
- `DELETE /disasters/:id`: Delete incident (Admin only)

#### Sample Disaster JSON Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "a1111111-1111-1111-1111-111111111111",
    "title": "Severe Flash Flooding in Manhattan, NYC",
    "description": "Heavy flooding and subway inundation has affected Manhattan, NYC following torrential rainfall.",
    "location": {
      "name": "Manhattan, NYC",
      "latitude": 40.7831,
      "longitude": -73.9712
    },
    "tags": ["flood", "storm", "infrastructure", "subway"],
    "status": "active",
    "created_by": "11111111-1111-1111-1111-111111111111",
    "created_at": "2026-09-27T05:11:45.302Z",
    "updated_at": "2026-09-27T05:11:45.302Z"
  }
}
```

#### Sample Disaster JSON Response (400 Bad Request - Unresolvable Location):
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Unable to resolve geographic location for \"unknown_remote_xyz\". Please provide a valid city, district, or landmark name."
  }
}
```

### 2. Proximity Resources
- `GET /disasters/:id/resources?lat=40.7831&lng=-73.9712&radius=15&type=shelter`: PostGIS radius search
- `POST /disasters/:id/resources`: Register emergency resource (Admin only)

#### Sample Resource JSON Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "b1111111-1111-1111-1111-111111111111",
      "name": "Central Park North Emergency Shelter",
      "type": "shelter",
      "location": {
        "name": "Harlem Meer Pavilion",
        "latitude": 40.7900,
        "longitude": -73.9535
      },
      "capacity": 300,
      "available_units": 185,
      "status": "available",
      "distance_km": 1.68
    }
  ],
  "meta": {
    "cached": true,
    "cache_ttl": 115,
    "total": 1
  }
}
```

### 3. Community Reports
- `GET /disasters/:id/reports`: Retrieve cached community reports
- `POST /disasters/:id/sync-reports`: Trigger asynchronous background sync (HTTP 202 Accepted)

#### Sample Community Report JSON Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "ext-101",
      "content": "Need drinking water near Manhattan 96th st subway station. Water rising quickly.",
      "user": "citizen_jake",
      "verified_user": true,
      "priority": "critical",
      "source": "external_social_media",
      "created_at": "2026-09-27T05:45:00.000Z"
    }
  ],
  "meta": {
    "cached": true,
    "cache_ttl": 284,
    "external_status": "HEALTHY"
  }
}
```

---

## ⚖️ Trade-offs & Production Considerations

1. **In-Memory Worker vs Distributed Broker**:
   - *Current Implementation*: Single-node Redis FIFO list (`jobs:queue:report_sync`) with an active polling worker loop and HTTP 202 Accepted ingestion.
   - *Production Scale*: Deploy dedicated worker pods consuming via BullMQ or AWS SQS with dead-letter queuing and backpressure management.
2. **JWT Revocation Strategy**:
   - *Current Implementation*: Short-lived access tokens (15 minutes) paired with refresh tokens (7 days).
   - *Production Scale*: Maintain a Redis token blacklist / revocation list for instant revocation upon password change or account lockout.
3. **Database Partitioning**:
   - *Current Implementation*: Single `disasters` and `resources` tables with GiST spatial indexes.
   - *Production Scale*: PostgreSQL declarative range partitioning by month/year on `created_at` or geographic region for multi-terabyte crisis archives.

---

## 🧪 Automated Test Suite

The test suite runs against the real, live PostgreSQL + PostGIS and Redis instances using Jest and Supertest:

```bash
# Run test suite from backend directory
cd backend
npm test
```

### Verified Test Suites (25/25 Passing Tests)
1. **`tests/disaster.test.js`**: Full CRUD lifecycle (POST with NLP extraction, GET details, PATCH updates, DELETE removal, and 404 verification).
2. **`tests/validation.test.js`**: Joi validation failure scenarios (missing title, missing description, invalid status enum) asserting standard 400 Bad Request error envelopes.
3. **`tests/rbac.test.js`**: Security enforcement (401 Unauthorized for missing tokens, 403 Forbidden when `viewer` or `contributor` attempts admin deletions or resource additions).
4. **`tests/caching.test.js`**: Redis Cache-Aside pattern (asserting `meta.cached: false` on cache miss and `meta.cached: true` with positive TTL on subsequent requests).
5. **`tests/officialUpdates.test.js`**: Official emergency agency advisories, cache invalidation, and role restrictions.
6. **`tests/queue.test.js`**: Asynchronous job queue (`POST /disasters/:id/sync-reports` returning HTTP 202 Accepted, worker processing state machine, telemetry tracking, and completion).
7. **`tests/imageVerification.test.js`**: Incident photo verification, site documentation payload validation, and Redis cache-aside caching.

---

## 🤖 AI Tool Usage Disclosure

In compliance with section 10 of the assignment guidelines:
- **Tool Used**: Google Antigravity Agentic IDE — **Gemini 3.8** model (Advanced Agentic Coding assistant by Google DeepMind).
- **What it helped with**:
  - Accelerating repetitive boilerplate (OpenAPI Swagger YAML definitions, Postman collection structure, initial seed data).
  - Rapid scaffolding of React JSX layout structures and Leaflet custom HTML pin configurations.
  - Suggesting architectural design patterns (Cache-Aside, Queue/Worker state machine, Repository pattern, Socket.IO room isolation).
  - Debugging and auditing: identifying property name mismatches between frontend modals and backend schemas.
- **What was manually engineered & verified**:
  - PostGIS SQL queries utilizing `ST_DWithin` and `ST_Distance` spherical calculations over native `GEOGRAPHY` types with GiST indexes.
  - Strict Cache-Aside pattern with TTL metadata exposure and upstream error suppression.
  - Automated integration test suite asserting HTTP status codes, error envelope formats, and RBAC authorization boundaries.
  - Docker Compose volume configuration resolving cross-platform symlink and node-linker constraints in Alpine Linux.
  - All decisions about database schema design, index strategy, TTL values, and RBAC role hierarchy were made manually after evaluation.


