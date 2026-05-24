from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.ticket import TicketCategory, TicketPriority, TicketSource, TicketStatus


class TicketCreate(BaseModel):
    subject: str
    body: str
    customer_email: str
    customer_name: str

    @field_validator("subject")
    @classmethod
    def subject_max_500(cls, v: str) -> str:
        if len(v) > 500:
            raise ValueError("subject must be 500 characters or fewer")
        return v


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
    agent_reply: str
