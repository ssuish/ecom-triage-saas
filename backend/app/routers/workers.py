from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.worker_auth import verify_cloud_tasks_oidc
from app.models.agent import Agent
from app.models.magic_token import MagicToken
from app.models.ticket import Ticket
from app.services.email import send_confirmation_email, send_reply_email
from app.services.tasks import JobType, enqueue_job
from app.services.triage import run_triage
from app.settings import settings

router = APIRouter(prefix="/workers", tags=["workers"])


class TriageJobPayload(BaseModel):
    ticket_id: str


class EmailJobPayload(BaseModel):
    ticket_id: str
    to: str
    type: Literal["confirmation", "reply"]
    agent_reply: Optional[str]
    magic_link: str


def _magic_link(ticket_id: str, token: str) -> str:
    base = settings.APP_BASE_URL.rstrip("/")
    return f"{base}/ticket/{ticket_id}?token={token}"


def execute_triage(ticket_id: str, db: Session) -> dict:
    """Run triage for a ticket. Idempotent; may enqueue confirmation email."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.triage_completed_at is not None:
        return {"ok": True, "skipped": "already_triaged"}

    agents = [{"id": a.id, "email": a.email} for a in db.query(Agent).all()]
    result = run_triage(subject=ticket.subject, body=ticket.body, agents=agents)

    ticket.category = result.category  # type: ignore[assignment]
    ticket.priority = result.priority  # type: ignore[assignment]
    ticket.escalate = result.escalate
    ticket.ai_draft_reply = result.draft_reply
    if result.assigned_agent_id:
        agent = db.query(Agent).filter(Agent.id == result.assigned_agent_id).first()
        if agent:
            ticket.assigned_agent_id = result.assigned_agent_id

    ticket.triage_completed_at = datetime.now(timezone.utc)
    db.commit()

    mt = db.query(MagicToken).filter(MagicToken.ticket_id == ticket.id).first()
    if mt and ticket.customer_email:
        magic_link = _magic_link(ticket.id, mt.token)
        enqueue_job(
            JobType.OUTBOUND_EMAIL,
            {
                "ticket_id": ticket.id,
                "to": ticket.customer_email,
                "type": "confirmation",
                "agent_reply": None,
                "magic_link": magic_link,
            },
        )
        if not settings.CLOUD_TASKS_ENABLED:
            execute_email(
                EmailJobPayload(
                    ticket_id=ticket.id,
                    to=ticket.customer_email,
                    type="confirmation",
                    agent_reply=None,
                    magic_link=magic_link,
                ),
                db,
            )

    return {"ok": True}


def execute_email(payload: EmailJobPayload, db: Session) -> dict:
    """Send confirmation or reply email. Idempotent."""
    ticket = db.query(Ticket).filter(Ticket.id == payload.ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if payload.type == "confirmation" and ticket.confirmation_email_sent_at:
        return {"ok": True, "skipped": "confirmation_already_sent"}
    if payload.type == "reply" and ticket.reply_email_sent_at:
        return {"ok": True, "skipped": "reply_already_sent"}

    customer_name = ticket.customer_name or "Customer"

    if payload.type == "confirmation":
        send_confirmation_email(
            to=payload.to,
            customer_name=customer_name,
            ticket_id=ticket.id,
            subject=ticket.subject,
            magic_link=payload.magic_link,
        )
        ticket.confirmation_email_sent_at = datetime.now(timezone.utc)
    elif payload.type == "reply":
        send_reply_email(
            to=payload.to,
            customer_name=customer_name,
            subject=ticket.subject,
            agent_reply=payload.agent_reply or "",
            magic_link=payload.magic_link,
            ticket_id=ticket.id,
        )
        ticket.reply_email_sent_at = datetime.now(timezone.utc)
    else:
        raise HTTPException(status_code=400, detail="Unknown email job type")

    db.commit()
    return {"ok": True}


@router.post("/triage")
def worker_triage(
    payload: TriageJobPayload,
    db: Session = Depends(get_db),
    _verified: None = Depends(verify_cloud_tasks_oidc),
):
    return execute_triage(payload.ticket_id, db)


@router.post("/email")
def worker_email(
    payload: EmailJobPayload,
    db: Session = Depends(get_db),
    _verified: None = Depends(verify_cloud_tasks_oidc),
):
    return execute_email(payload, db)
