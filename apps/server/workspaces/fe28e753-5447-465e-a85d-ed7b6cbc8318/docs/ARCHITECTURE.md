# Architecture Specification & API Contracts

## Overview
Multi-tier decoupled architecture: Next.js frontend with Tailwind UI, ASP.NET Core Web API or Node Express REST backend, SQLite / PostgreSQL data tier, Docker Compose containerization.

## Data Flow
```
Client (Browser) -> Next.js Frontend -> REST API Gateway -> Business Logic -> SQLite/Postgres DB
```

## API Contracts
- `POST /api/auth/login` -> Generates JWT bearer token
- `GET /api/products` -> Returns paginated list of catalog items
- `POST /api/products` -> Creates a new product with stock quantity
- `GET /api/stock-movements` -> Returns audit log of inventory transfers
- `GET /api/health` -> Returns `{ status: "ok", timestamp: ISOString }`
