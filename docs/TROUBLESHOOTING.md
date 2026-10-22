# Universal AI App Builder - Troubleshooting Guide

## 1. Common Issues & Solutions

### A. Database Connection Error (`DATABASE_URL not found` or `P1012`)
- **Cause:** Prisma did not load the `.env` file or SQLite path is invalid.
- **Fix:** Ensure a root `.env` exists with `DATABASE_URL="file:./dev.db"`. Run:
  ```bash
  npx prisma generate --schema=apps/server/prisma/schema.prisma
  npx prisma db push --schema=apps/server/prisma/schema.prisma
  ```

### B. Docker Not Found Warning
- **Cause:** Docker Desktop is not installed or not running on the local machine.
- **Fix:** Universal AI App Builder automatically falls back to `LocalProcessRunner`. Applications will run in dedicated, isolated sub-processes using your host's installed runtime (.NET SDK 10, Node.js 20+, Python 3.12). When Docker Desktop is started, containerized execution can be toggled in project settings.

### C. Port Already in Use (e.g., 3000 or 4000)
- **Cause:** Another application is occupying the default port.
- **Fix:**
  - For Backend: Modify `PORT=4001` in `.env`.
  - For Frontend: Run `next dev -p 3001`.
  - Generated preview applications automatically find free ports between 5100 and 5999 via `PortAllocator`.

### D. Generation Job Stuck or Failed
- **Cause:** Network interruption or syntax error during Stage 8/9.
- **Fix:**
  - Check the **Terminal & Logs** tab in the project workspace.
  - Click **Re-generate** or use `POST /api/v1/projects/:id/generate` to resume from the last completed stage.
  - Review the AI repair attempts in the database.

---

## 2. Health Check Diagnostic
Navigate to `http://localhost:3000/health` or `GET http://localhost:4000/health` to verify service responsiveness and runtime compiler availability.

