from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_clerk_agent
from app.models.agent import Agent
from app.schemas.agent import AgentOut

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=List[AgentOut])
def list_agents(
    db: Session = Depends(get_db),
    _agent: dict = Depends(require_clerk_agent),
):
    return db.query(Agent).order_by(Agent.name).all()
