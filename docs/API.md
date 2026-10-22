# Universal AI App Builder - REST API Reference

Base URL: `http://localhost:4000/api/v1`

---

## 1. Project Management

### `POST /projects`
Creates a new project and triggers the autonomous AI generation pipeline.

**Request Body:**
```json
{
  "name": "Inventory SaaS",
  "prompt": "Buatkan aplikasi inventory management dengan Next.js dan ASP.NET Core",
  "mode": "one-command",
  "config": {
    "appType": "full_stack",
    "frontend": "nextjs",
    "backend": "aspnet_core",
    "database": "sqlite",
    "auth": "jwt",
    "authorization": "rbac",
    "dockerEnabled": true
  }
}
```

### `GET /projects`
Lists all project workspaces with current runtime status and metadata.

### `GET /projects/:id`
Returns comprehensive project details, including configurations, runtimes, build history, and generation steps.

### `DELETE /projects/:id`
Deletes the project record and cleanly purges the workspace directory on disk.

---

## 2. Real-Time Generation & Events

### `POST /projects/:id/generate`
Manually starts or resumes an AI generation job.

### `GET /projects/:id/generation-status`
Retrieves progress, current stage, and step execution details.

### `GET /projects/:id/events`
Server-Sent Events (SSE) connection streaming real-time pipeline events (`planning.started`, `stage.started`, `file.created`, `runtime.started`, `test.completed`, `progress.updated`).

---

## 3. Workspace File Management

### `GET /projects/:id/files`
Returns the recursive directory tree for the project workspace.

### `GET /projects/:id/files/content?path={filePath}`
Retrieves content and size of a specific workspace file.

### `PUT /projects/:id/files/content`
Saves updated content to a file in the workspace.

### `POST /projects/:id/files/search`
Searches for text strings across all non-ignored project files.

### `POST /projects/:id/export`
Exports and streams the full project workspace as a `.zip` archive.

---

## 4. Execution & Runtimes

### `POST /projects/:id/build`
Triggers an automated build of frontend, backend, or all artifacts.

### `POST /projects/:id/tests`
Executes automated QA verification suites.

### `POST /projects/:id/run`
Starts the application in an isolated sandbox and allocates a preview URL.

### `POST /projects/:id/stop`
Gracefully stops running application processes.

### `GET /projects/:id/preview`
Checks whether the application is running and returns its live preview URL.

---

## 5. Providers & Frameworks

### `GET /frameworks`
Lists all supported frontend, backend, and database adapters.

### `GET /ai/providers`
Lists registered AI provider adapters.

### `POST /ai/providers`
Registers a new AI provider (AES-256-GCM encrypted API key).

### `GET /stats`
Retrieves platform metrics for the developer dashboard.

