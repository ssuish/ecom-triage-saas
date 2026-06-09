from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, agents, tickets, workers
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.middleware.rate_limit import limiter
from app.settings import settings

_cors_origins = [settings.APP_BASE_URL]
if settings.APP_BASE_URL != "http://localhost:3000":
    _cors_origins.append("http://localhost:3000")

app = FastAPI(title="Triage")

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
