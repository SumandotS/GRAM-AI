---
name: Artifact preview builds
description: Environment-specific build behavior for Vite web artifacts in this workspace.
---

Vite web artifact builds require `PORT` and `BASE_PATH` from the managed workflow; a direct build without them fails before compiling.

**Why:** The artifact config intentionally validates routing and service-port values at startup, so direct shell builds do not inherit the workflow environment.

**How to apply:** Use the managed web workflow for preview verification, or provide the workflow-equivalent `PORT` and `BASE_PATH` when running a production build manually. Use `pnpm --filter <artifact> run typecheck` for environment-independent static validation.