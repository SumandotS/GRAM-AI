# GRAM-AI

**Agentic Clinical Decision Support for Community Health Workers**

GRAM-AI is a safety-first prototype for structured patient assessment. It is designed for an ASHA/community health worker workflow: capture the patient story, ask a small number of relevant follow-up questions, check configured danger signs, and make the next handoff clear.

> **Clinical safety disclaimer:** GRAM-AI is a decision-support prototype. It does not provide a definitive diagnosis and does not replace a qualified healthcare professional. If a patient appears seriously unwell, follow local emergency protocol immediately instead of waiting for the tool.

## Current implementation

The runnable Replit build includes:

- Responsive field-oriented web interface
- Home, assessment, results, referral, knowledge-base, evaluation, and system-status screens
- Structured patient and symptom intake with age validation
- Multi-step clarification flow
- Deterministic red-flag detection independent of model availability
- Urgent referral priority when a configured danger sign is present
- Honest DEMO/LOCAL runtime status
- Ollama reachability detection
- Printable referral-note generation from the current assessment
- API contracts, generated hooks, safe error responses, and typechecks

The project intentionally does **not** invent clinical evidence. No approved protocol PDFs, clinical dataset, or measured evaluation set were supplied, so the current status correctly reports:

- knowledge base: not loaded
- ChromaDB: unavailable
- Random Forest: not trained
- evaluation: not performed
- LangGraph: unavailable in this first runnable slice

## Architecture

```text
ASHA / community health worker
        |
        v
React + Vite assessment UI
        |
        v
Express API (/api)
        |
        +--> deterministic red-flag safety layer
        +--> short-lived assessment session
        +--> Ollama reachability status
        +--> evidence and evaluation availability
        +--> printable referral note
```

The OpenAPI contract in `lib/api-spec/openapi.yaml` is the source of truth for the API. Generated React Query hooks live in `lib/api-client-react`, and generated Zod schemas live in `lib/api-zod`.

## Folder structure

```text
artifacts/
  api-server/
    src/routes/       API endpoints
    src/lib/          safety rules, runtime checks, session state
  gram-ai/
    src/pages/        product screens
    src/components/   shared shell and accessible UI primitives
lib/
  api-spec/           OpenAPI source
  api-client-react/   generated frontend client
  api-zod/            generated request/response validation
attached_assets/      uploaded project specification
```

## Install

This repository uses pnpm.

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
```

## Run the app

In separate terminals:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/gram-ai run dev
```

The Replit workflows start these services automatically. The web app is served at the project preview root and the API is mounted at `/api`.

## DEMO mode

When Ollama is not reachable, the system status page shows:

```text
DEMO MODE — Ollama/Phi-3 Mini is not connected.
```

DEMO mode is only for exercising the application flow. It must not be described as Phi-3 Mini or as clinical model performance. In this mode the app can run the deterministic safety rules and show explicit unavailable states, but it does not claim protocol-grounded reasoning.

## LOCAL mode

For a local deployment:

1. Install Ollama.
2. Download and verify the intended Phi-3 Mini model locally.
3. Start Ollama on its local service endpoint.
4. Confirm the system-status page reports Ollama connected and Phi-3 Mini available.
5. Validate all prompts, model outputs, and clinical workflows with public-health and clinical experts before any real use.

The app reads `OLLAMA_HOST` when set and otherwise checks the standard local Ollama endpoint. No cloud AI API is required by the runtime status check.

## Knowledge-base ingestion

No knowledge-base documents were provided in this project, so ingestion is not enabled in the current slice. Only approved, supplied documents should be added. Do not add guessed citations or page numbers. A future ingestion implementation must preserve source, page, section, and chunk metadata and report counts from actual indexed files.

## Random Forest training

No dataset was provided, so no Random Forest model has been trained and the evaluation screen does not show target numbers as achieved results. A future implementation must inspect the actual dataset schema, report its real sample/feature/class counts, and keep training and evaluation examples separate.

## Evaluation

The evaluation screen currently reports:

```text
Evaluation not yet performed.
```

This is intentional. Accuracy, precision, recall, F1, confusion matrices, RAG relevance, citation correctness, red-flag recall, latency, and offline behavior must only be shown after a reproducible evaluation has actually run.

## Testing and verification

```bash
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/gram-ai run typecheck
pnpm run typecheck
```

The API smoke path should cover:

1. `GET /api/healthz`
2. `GET /api/system/status`
3. `POST /api/assessment/start`
4. `POST /api/assessment/intake`
5. `POST /api/assessment/clarify`
6. `POST /api/red-flags/check` with an emergency symptom
7. `POST /api/assessment/analyze`
8. `POST /api/referral/generate`
9. `GET /api/evaluation/metrics`

## Known limitations

- Assessment state is in memory and is cleared when the API restarts.
- Browser session storage holds the current assessment result for navigation in the demo.
- Referral output is a printable prototype note; it is not an official government medical form.
- No approved RAG corpus, embedding store, ML dataset, trained model, or measured clinical evaluation was supplied.
- The first runnable slice uses Express/React in the Replit workspace. A production offline package still needs a locally validated model/runtime bundle and public-health review.

## Required expert validation

Before any real-world use, public-health and clinical experts must validate the danger-sign rules, triage wording, local referral pathways, language accessibility, data handling, model behavior, protocol sources, and evaluation methodology. This prototype should be treated as an academic demonstration, not as a clinical deployment.