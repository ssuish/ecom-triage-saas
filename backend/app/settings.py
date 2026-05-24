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
    RESEND_WEBHOOK_SECRET: str = ""
    QSTASH_TOKEN: str = ""
    QSTASH_CURRENT_SIGNING_KEY: str = "test-current-key"
    QSTASH_NEXT_SIGNING_KEY: str = "test-next-key"
    GCP_PROJECT_ID: str = ""
    VERTEX_LOCATION: str = "global"
    GOOGLE_GENAI_USE_VERTEXAI: bool = False
    GEMINI_API_KEY: str = ""
    GEMINI_TIMEOUT_SECONDS: int = 15
    RATE_LIMIT_TICKETS: str = "100/minute"
    QSTASH_ENABLED: bool = False
    APP_BASE_URL: str = "http://localhost:3000"
    WORKER_BASE_URL: str = "http://localhost:8080"

    model_config = {
        "env_file": ROOT_DIR / ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
