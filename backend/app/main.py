from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, agents, tickets, workers
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.logging_config import configure_logging
from app.middleware.rate_limit import limiter
from app.settings import settings

configure_logging(settings.IS_PRODUCTION)

_cors_origins = [settings.APP_BASE_URL]
if settings.APP_BASE_URL != "http://localhost:3000":
    _cors_origins.append("http://localhost:3000")

_docs_url = None if settings.IS_PRODUCTION else "/docs"
_redoc_url = None if settings.IS_PRODUCTION else "/redoc"
_openapi_url = None if settings.IS_PRODUCTION else "/openapi.json"

app = FastAPI(
    title="Triage",
    docs_url=_docs_url,
    redoc_url=_redoc_url,
    openapi_url=_openapi_url,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(agents.router)
app.include_router(tickets.router)
app.include_router(workers.router)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
