# Triage — Agent Instructions

Read [CONTEXT.md](CONTEXT.md) first for domain language and v1 boundaries.

## Repo map

```text
backend/     FastAPI, SQLAlchemy, Alembic, pytest
frontend/    React 18 + Vite + Clerk + TanStack + shadcn/ui
scripts/     deploy-backend.sh, (seed_agent.py deferred)
docs/        PRD, GCP setup, ADRs
```

## Current status (2026-06)

| Area | State |
|------|-------|
| Backend (Phases 1–2) | Done — CRUD, auth, Gemini triage, Cloud Tasks workers, Resend, structured logs |
| Frontend (Phase 3) | Scaffold — health-check `App.tsx`; UI primitives exist; no real screens |
| Prod (Phase 4) | Pending — Neon, Cloud Run, Firebase, agent seed, migrate workflow |

Branch: `core-be`.

CI: `.github/workflows/ci.yml` — path-filtered backend (pytest + Docker build) and frontend (test + build) on push/PR; `workflow_dispatch` runs all jobs.

## Commands

```bash
cp .env.example .env && docker compose up --build   # local stack
./scripts/run-migrations.sh                         # if backend started before migrate-on-boot image
cd backend && uv sync --dev && uv run pytest tests/ -v
cd frontend && pnpm install && pnpm test
```

Local: `CLOUD_TASKS_ENABLED=false` — triage + email run in-process after ticket create/resolve.

Prod deploy: `docs/gcp-production-setup.md` + `scripts/deploy-backend.sh`.

## Conventions

- Use **Ticket** in code/docs — not case/issue.
- **v1 intake**: web form only (`POST /tickets` + `x-api-key`). No `/tickets/inbound`.
- **Workers**: `/workers/triage`, `/workers/email` — Cloud Tasks OIDC only. No QStash/Upstash headers.
- **Auth**: Clerk JWT (operators), `x-magic-token` (customer status), `x-api-key` (public form), OIDC Bearer (workers).
- **Clerk ≠ DB agent**: JWT gates API; `agents` table row required for assign — seed before testing assign.
- **Reply flow**: save draft on `PATCH /reply`; send customer email on `PATCH /resolve`.
- **Gemini prod**: Vertex + ADC (`triage-runtime@`); local may use `GEMINI_API_KEY`.
- **Logs**: structured JSON with `ticket_id`, `event`, `outcome` — never log ticket body or prompts.
- **Email HTML**: `html.escape` all user-supplied fields.
- **Scope**: minimal diffs; match existing patterns; no unrelated features.

## Implemented API

`GET /health` · `GET /agents` · `POST|GET /tickets` · `GET /tickets/{id}` · `PATCH .../assign|reply|resolve` · `GET .../status` · `POST /workers/triage|email`

Spec: `backend/openapi.yaml`

## Out of v1 scope

Inbound email intake, ticket threading, attachments, RBAC beyond agent/customer, multi-tenant orgs, QStash, Railway/Vercel deploy, auto-deploy on `main`.

## Do not

- Commit or push unless user asks
- Put `GEMINI_API_KEY` in prod Secret Manager
- Use prod Neon `DATABASE_URL` locally
- Remove `TicketSource.email` enum (deferred channel)
