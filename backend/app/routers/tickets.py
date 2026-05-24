import uuid
from fastapi.requests import Request
from pydantic import BaseModel
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_api_key, require_clerk_agent
from app.models.magic_token import MagicToken
from app.models.ticket import Ticket, TicketStatus
from app.schemas.ticket import AssignPayload, ReplyPayload, TicketCreate, TicketOut
from app.models.agent import Agent
from app.schemas.ticket import TicketStatusOut
from app.middleware.rate_limit import TICKET_CREATE_LIMIT, limiter

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.post("", response_model=TicketOut, status_code=201)
@limiter.limit(TICKET_CREATE_LIMIT)
def create_ticket(
    request: Request,
    body: TicketCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(require_api_key),
):
    ticket = Ticket(
        subject=body.subject,
        body=body.body,
        customer_email=body.customer_email,
        customer_name=body.customer_name,
    )
    db.add(ticket)
    db.flush()  # get ticket.id before magic token insert

    magic_token = MagicToken(ticket_id=ticket.id, token=str(uuid.uuid4()))
    db.add(magic_token)
    db.commit()
    db.refresh(ticket)
    return ticket


class TicketListOut:
    pass

class TicketPage(BaseModel):
    items: List[TicketOut]
    total: int


@router.get("", response_model=TicketPage)
def list_tickets(
    status: Optional[TicketStatus] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _agent: dict = Depends(require_clerk_agent),
):
    q = db.query(Ticket)
    if status:
        q = q.filter(Ticket.status == status)
    if priority:
        q = q.filter(Ticket.priority == priority)
    if category:
        q = q.filter(Ticket.category == category)

    total = q.count()
    items = (
        q.order_by(Ticket.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return TicketPage(items=items, total=total)


@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    _agent: dict = Depends(require_clerk_agent),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}/assign", response_model=TicketOut)
def assign_ticket(
    ticket_id: str,
    body: AssignPayload,
    db: Session = Depends(get_db),
    _agent: dict = Depends(require_clerk_agent),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    agent = db.query(Agent).filter(Agent.id == body.agent_id).first()
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")

    ticket.assigned_agent_id = body.agent_id
    db.commit()
    db.refresh(ticket)
    return ticket


@router.patch("/{ticket_id}/reply", response_model=TicketOut)
def save_reply(
    ticket_id: str,
    body: ReplyPayload,
    db: Session = Depends(get_db),
    _agent: dict = Depends(require_clerk_agent),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.agent_reply = body.agent_reply
    ticket.status = TicketStatus.in_progress
    db.commit()
    db.refresh(ticket)
    return ticket


@router.patch("/{ticket_id}/resolve", response_model=TicketOut)
def resolve_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    _agent: dict = Depends(require_clerk_agent),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = TicketStatus.resolved
    db.commit()
    db.refresh(ticket)
    # TODO:push outbound email to qstash
    return ticket


@router.get("/{ticket_id}/status", response_model=TicketStatusOut)
def get_ticket_status(
    ticket_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    from app.dependencies import require_magic_token

    magic = require_magic_token(token=token, db=db)
    if magic.ticket_id != ticket_id:
        raise HTTPException(status_code=404, detail="Token does not match ticket")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
