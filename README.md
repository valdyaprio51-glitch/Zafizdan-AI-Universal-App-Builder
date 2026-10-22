# Universal AI App Builder

> **Describe your application once. Let AI plan, generate, test, build, and run the complete application.**

[![CI Pipeline](https://github.com/zafizdan/universal-ai-app-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/zafizdan/universal-ai-app-builder)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-App_Router-000000?logo=nextdotjs)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-Modular_API-000000?logo=fastify)](https://fastify.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-SQLite_%7C_PostgreSQL-2D3748?logo=prisma)](https://www.prisma.io/)

Universal AI App Builder is an enterprise-grade AI software engineering platform. It transforms high-level natural language prompts into complete, verified, compiled, and running applications across frontend, backend, database, testing, and container deployment.

---

## Key Features

- **One-Command & Advanced Wizards:** Generate a production application from a single sentence or customize every framework layer.
- **11-Stage Pipeline Orchestration:**
  1. Requirement Analysis (PRD)
  2. Architecture Planning
  3. Scaffolding
  4. Database Design & Migrations
  5. Backend Generation & REST APIs
  6. Frontend Generation & Responsive UI
  7. Integration & Contract Alignment
  8. Automated Quality Assurance (Lint, Types, Unit & Integration Tests)
  9. AI Self-Healing Repair Loop
  10. Isolated Build & Run
  11. Delivery & ZIP Export
- **Multi-Framework Adapters:** Next.js App Router, React + Vite, ASP.NET Core Web API (.NET 10 / C#), Node.js Express, Python FastAPI, PostgreSQL, SQLite, and SQL Server.
- **Pluggable AI Providers:** Universal interface supporting Google Gemini, OpenAI, Anthropic, Ollama/OpenAI-compatible endpoints, and an offline deterministic Mock AI engine for offline CI/CD.
- **Enterprise Security Sandbox:**
  - AES-256-GCM secret encryption with authenticated tags.
  - Strict `PathGuard` preventing path traversal (`../`) out of project workspaces.
  - Command allowlisting blocking arbitrary shell command execution.
  - Dynamic Port Allocation (`PortAllocator`) for collision-free live preview servers.
- **Developer Workspace UI:** Interactive file explorer, code editor, live SSE progress monitoring, streaming terminal console, live application preview viewport, and ZIP download.

---

## Quick Start

### 1. Automated Setup
- **Windows (PowerShell):**
  ```powershell
  .\scripts\setup.ps1
  ```
- **Linux / macOS:**
  ```bash
  chmod +x ./scripts/setup.sh
  ./scripts/setup.sh
  ```

### 2. Manual Commands
```bash
# Install monorepo dependencies
npm install

# Build shared package
npm run build --workspace=@zafizdan/shared

# Initialize database schema
npx prisma generate --schema=apps/server/prisma/schema.prisma
npx prisma db push --schema=apps/server/prisma/schema.prisma

# Start backend server (port 4000)
npm run server:dev

# Start frontend UI (port 3000) in another terminal
npm run web:dev
```

Open `http://localhost:3000` in your browser.

---

## Running Automated Tests

```bash
# Run security, file engine, AI provider, and queue unit tests
npm run test --workspace=@zafizdan/server

# Run the full 11-stage vertical slice end-to-end integration test
npm run test:e2e --workspace=@zafizdan/server
```

---

## Docker Deployment

To spin up the entire platform with PostgreSQL, Redis, Server, and Web UI:

```bash
docker-compose up -d --build
```

---

## Architecture & Documentation

- [Architecture Blueprint](docs/ARCHITECTURE.md)
- [REST API Specification](docs/API.md)
- [Security Architecture & Threat Model](docs/SECURITY.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## License

Licensed under the [Apache-2.0 License](LICENSE).

