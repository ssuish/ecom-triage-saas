#!/usr/bin/env bash
# Run Alembic migrations against local Docker Postgres (host port 5432).
set -euo pipefail

DATABASE_URL="${DATABASE_URL:-postgresql+psycopg2://triage:triage@localhost:5432/triage}"

cd "$(dirname "$0")/../backend"
DATABASE_URL="$DATABASE_URL" uv run alembic upgrade head
