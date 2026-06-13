#!/usr/bin/env bash
# Deploy Triage backend to Cloud Run (Stage 3). Requires gcloud auth + PROJECT_ID.
set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID}"
: "${REGION:=us-central1}"
: "${API_DOMAIN:?Set API_DOMAIN e.g. https://api.yourdomain.com}"
: "${APP_DOMAIN:?Set APP_DOMAIN e.g. https://app.yourdomain.com}"

RUNTIME_SA="triage-runtime@${PROJECT_ID}.iam.gserviceaccount.com"
INVOKER_SA="cloud-tasks-invoker@${PROJECT_ID}.iam.gserviceaccount.com"

ENV_VARS=(
  "CLOUD_TASKS_ENABLED=true"
  "CLOUD_TASKS_LOCATION=${REGION}"
  "CLOUD_TASKS_TRIAGE_QUEUE=triage-queue"
  "CLOUD_TASKS_EMAIL_QUEUE=email-queue"
  "TASKS_OIDC_AUDIENCE=${API_DOMAIN}"
  "TASKS_INVOKER_SA_EMAIL=${INVOKER_SA}"
  "WORKER_BASE_URL=${API_DOMAIN}"
  "APP_BASE_URL=${APP_DOMAIN}"
  "GCP_PROJECT_ID=${PROJECT_ID}"
  "VERTEX_LOCATION=global"
  "GOOGLE_GENAI_USE_VERTEXAI=true"
  "GEMINI_TIMEOUT_SECONDS=15"
  "RATE_LIMIT_TICKETS=10/minute"
  "CLERK_AUTHORIZED_PARTIES=${APP_DOMAIN}"
  "IS_PRODUCTION=true"
)

SECRETS=(
  "DATABASE_URL=triage-database-url:latest"
  "CLERK_SECRET_KEY=triage-clerk-secret-key:latest"
  "API_KEY=triage-api-key:latest"
  "RESEND_API_KEY=triage-resend-api-key:latest"
  "OPERATOR_EMAIL_ALLOWLIST=triage-operator-allowlist:latest"
)

gcloud run deploy backend \
  --source ./backend \
  --region="${REGION}" \
  --service-account="${RUNTIME_SA}" \
  --allow-unauthenticated \
  --timeout=120 \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80 \
  --max-instances=5 \
  --labels=env=prod,app=triage,team=solo \
  --set-secrets="$(IFS=,; echo "${SECRETS[*]}")" \
  --set-env-vars="$(IFS=,; echo "${ENV_VARS[*]}")"

echo "Deployed backend. Map custom domain ${API_DOMAIN} in Cloud Run console if not done."
