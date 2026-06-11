# Streamverse

A Netflix-style streaming app built with React, Express, and PostgreSQL.

## Prerequisites

- Node.js 18+ (Node 17+ needs the OpenSSL legacy provider for the frontend — already configured)
- Docker Desktop (for PostgreSQL)

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts Postgres 16 on port `5432` and auto-applies the schema from `db/init/01-schema.sql`.

| Setting  | Value        |
|----------|--------------|
| Host     | localhost    |
| Port     | 5432         |
| Database | streamverse  |
| User     | streamverse  |
| Password | streamverse  |

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit if needed
npm install
npm run seed           # load Table Backup/*.json data
npm start              # http://localhost:5001
```

### 3. Frontend

```bash
cd frontend
npm install
npm start              # http://localhost:3000
```

Optionally set `REACT_APP_API_URL` in `frontend/.env` if the backend runs on a different host/port.

## Project Structure

```
streamverse/
├── docker-compose.yml       # Postgres container
├── db/
│   ├── init/01-schema.sql   # Postgres schema (auto-applied)
│   └── legacy-oracle/       # Original Oracle DDL/procedures/triggers
├── Table Backup/            # JSON seed data exports
├── backend/
│   ├── app.js               # Express entry point
│   ├── config/              # Environment config
│   ├── controllers/           # Route handlers
│   ├── routes/
│   ├── services/            # DB layer, rating/subscription logic
│   └── scripts/
│       ├── seed.js          # Import Table Backup JSON
│       └── run-tmdb.js      # Optional TMDB data loader
└── frontend/
    └── src/
        ├── config.js        # API_BASE_URL
        ├── pages/
        └── containers/
```

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `/api/users` | Signup, login, account settings |
| `/api/profiles` | Profile CRUD, watchlist, ratings, playback |
| `/api/browse` | Movies, shows, search, recommendations |
| `/api/subscription` | Plans, billing, subscription management |

## Optional: Load TMDB Data

Requires `TMDB_API_KEY` in `backend/.env`:

```bash
cd backend
npm run load-tmdb
```

## Migration Notes

This project was migrated from Oracle (`oracledb`) to PostgreSQL (`pg`). Stored procedures and triggers were replaced with application logic in:

- `backend/services/rating-aggregator.js` — movie/show rating aggregates
- `backend/services/subscription-utils.js` — billing and profile limits
