from app.models.agent import Agent
from app.models.ticket import (
    Ticket,
    TicketStatus,
    TicketPriority,
    TicketCategory,
    TicketSource,
)
from app.models.magic_token import MagicToken


def test_agent_columns():
    cols = {c.name for c in Agent.__table__.columns}
    assert cols == {"id", "email", "name", "created_at", "updated_at"}


def test_ticket_columns():
    cols = {c.name for c in Ticket.__table__.columns}
    assert {
        "id",
        "subject",
        "body",
        "source",
        "status",
        "priority",
        "category",
        "escalate",
        "ai_draft_reply",
        "agent_reply",
        "assigned_agent_id",
        "triage_completed_at",
        "confirmation_email_sent_at",
        "reply_email_sent_at",
        "created_at",
        "updated_at",
    }.issubset(cols)


def test_ticket_status_values():
    assert set(TicketStatus) == {
        TicketStatus.open,
        TicketStatus.in_progress,
        TicketStatus.resolved,
    }


def test_magic_token_columns():
    cols = {c.name for c in MagicToken.__table__.columns}
    assert cols == {"id", "ticket_id", "token", "created_at"}
