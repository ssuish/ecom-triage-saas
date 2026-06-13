from pathlib import Path
from pydantic_settings import BaseSettings

ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+pysqlite:///:memory:"
    CLERK_SECRET_KEY: str = "test_secret"
    CLERK_AUTHORIZED_PARTIES: str = ""
    OPERATOR_EMAIL_ALLOWLIST: str = ""
    API_KEY: str = "test-api-key"
    RESEND_API_KEY: str = ""
    GCP_PROJECT_ID: str = ""
    VERTEX_LOCATION: str = "global"
    GOOGLE_GENAI_USE_VERTEXAI: bool = False
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3-flash"
    GEMINI_TIMEOUT_SECONDS: int = 15
    RATE_LIMIT_TICKETS: str = "100/minute"
    RATE_LIMIT_STATUS: str = "30/minute"
    IS_PRODUCTION: bool = False
    CLOUD_TASKS_ENABLED: bool = False
    CLOUD_TASKS_LOCATION: str = "us-central1"
    CLOUD_TASKS_TRIAGE_QUEUE: str = "triage-queue"
    CLOUD_TASKS_EMAIL_QUEUE: str = "email-queue"
    TASKS_OIDC_AUDIENCE: str = ""
    TASKS_INVOKER_SA_EMAIL: str = ""
    APP_BASE_URL: str = "http://localhost:3000"
    WORKER_BASE_URL: str = "http://localhost:8080"
    FROM_EMAIL: str = "Triage Support <support@yourdomain.com>"

    model_config = {
        "env_file": ROOT_DIR / ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
