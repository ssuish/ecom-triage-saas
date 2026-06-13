from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.ticket import TicketCategory, TicketPriority, TicketSource, TicketStatus


class TicketCreate(BaseModel):
    subject: str = Field(max_length=500)
    body: str = Field(max_length=10_000)
    customer_email: EmailStr
    customer_name: str = Field(max_length=255)


class TicketOut(BaseModel):
    id: str
    subject: str
    body: str
    source: TicketSource
    status: TicketStatus
    priority: TicketPriority
    category: TicketCategory
    escalate: bool
    ai_draft_reply: Optional[str]
    agent_reply: Optional[str]
    assigned_agent_id: Optional[str]
    customer_email: Optional[str]
    customer_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TicketStatusOut(BaseModel):
    """Stripped response for customer magic-link view."""

    id: str
    subject: str
    status: TicketStatus
    agent_reply: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AssignPayload(BaseModel):
    agent_id: str


class ReplyPayload(BaseModel):
    agent_reply: str = Field(max_length=10_000)
