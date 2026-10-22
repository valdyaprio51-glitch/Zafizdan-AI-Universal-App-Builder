# Universal AI App Builder - Deployment Instructions

## 1. Local Development Deployment

### Prerequisites:
- Node.js >= 18 (Node 20+ recommended)
- npm >= 9
- (Optional) .NET SDK >= 8.0, Python >= 3.10, Docker

### Quick Start:
```bash
# 1. Install all monorepo dependencies
npm install

# 2. Build shared packages and sync database schema
npm run build --workspace=@zafizdan/shared
npx prisma generate --schema=apps/server/prisma/schema.prisma
npx prisma db push --schema=apps/server/prisma/schema.prisma

# 3. Start Platform Backend (Fastify API + SSE)
npm run server:dev

# 4. Start Platform Frontend (Next.js App Router) in another terminal
npm run web:dev
```
Access the platform at `http://localhost:3000`.

---

## 2. Docker Compose Production Deployment

The platform includes full container definitions with PostgreSQL, Redis, Server, and Web:

```bash
docker-compose up -d --build
```

Services:
- **Web UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:4000`
- **PostgreSQL Database:** `localhost:5432`
- **Redis Queue:** `localhost:6379`

To tail logs:
```bash
docker-compose logs -f
```

---

## 3. Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | 4000 | Fastify REST API port |
| `NODE_ENV` | development | Application runtime mode |
| `DATABASE_URL` | `file:./dev.db` | Prisma database connection string |
| `ENCRYPTION_SECRET` | 32-byte hex | Master secret for AES-256-GCM key storage |
| `WORKSPACE_BASE_PATH` | `./workspaces` | Directory where generated app files reside |
| `DEFAULT_AI_PROVIDER` | `mock` | Default engine: `mock`, `google_gemini`, `openai` |
| `GEMINI_API_KEY` | - | Optional Google Gemini API key |
| `OPENAI_API_KEY` | - | Optional OpenAI API key |
