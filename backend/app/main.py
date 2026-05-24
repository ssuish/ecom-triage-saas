from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, agents, tickets

app = FastAPI(title="Triage")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(agents.router)
app.include_router(tickets.router)