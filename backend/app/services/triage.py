import logging
import time
from dataclasses import dataclass
from typing import Any, Literal, Optional

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.logging_config import log_event
from app.settings import settings

logger = logging.getLogger(__name__)

VALID_CATEGORIES = {"billing", "technical", "general", "other"}
VALID_PRIORITIES = {"low", "medium", "high"}

TRIAGE_PROMPT = """You are a support ticket triage assistant. Classify the ticket in the user message block.

Rules:
- priority is "high" for urgency, financial impact, or data loss
- priority is "low" for informational requests
- escalate is true ONLY for legal threats, data breach, or account termination keywords
- draft_reply: professional reply for agent editing
- assigned_agent_id: always null

<ticket>
Subject: {subject}
Body: {body}
</ticket>"""


class TriageResponseSchema(BaseModel):
    category: Literal["billing", "technical", "general", "other"] = "other"
    priority: Literal["low", "medium", "high"] = "medium"
    escalate: bool = False
    draft_reply: str = ""
    assigned_agent_id: Optional[str] = Field(default=None)


@dataclass
class TriageResult:
    category: str = "other"
    priority: str = "medium"
    escalate: bool = False
    draft_reply: str = ""
    assigned_agent_id: Optional[str] = None


def _coerce_triage_result(data: dict[str, Any]) -> TriageResult:
    category = data.get("category", "other")
    if category not in VALID_CATEGORIES:
        category = "other"
    priority = data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        priority = "medium"
    return TriageResult(
        category=category,
        priority=priority,
        escalate=bool(data.get("escalate", False)),
        draft_reply=str(data.get("draft_reply", "")),
        assigned_agent_id=data.get("assigned_agent_id"),
    )


def _parsed_to_dict(parsed: Any) -> dict[str, Any]:
    if parsed is None:
        return {}
    if hasattr(parsed, "model_dump"):
        return parsed.model_dump()
    if isinstance(parsed, dict):
        return parsed
    return {}


_client: genai.Client | None = None


def _get_genai_client() -> genai.Client:
    global _client
    if _client is not None:
        return _client
    if settings.IS_PRODUCTION:
        if settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not allowed in production")
        if not settings.GCP_PROJECT_ID:
            raise RuntimeError("GCP_PROJECT_ID required for Vertex")
        _client = genai.Client(
            vertexai=True,
            project=settings.GCP_PROJECT_ID,
            location=settings.VERTEX_LOCATION,
        )
    elif settings.GEMINI_API_KEY:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    elif settings.GOOGLE_GENAI_USE_VERTEXAI:
        if not settings.GCP_PROJECT_ID:
            raise RuntimeError("GCP_PROJECT_ID required for Vertex")
        _client = genai.Client(
            vertexai=True,
            project=settings.GCP_PROJECT_ID,
            location=settings.VERTEX_LOCATION,
        )
    else:
        raise RuntimeError(
            "Set GEMINI_API_KEY or enable Vertex (GOOGLE_GENAI_USE_VERTEXAI + GCP_PROJECT_ID)"
        )
    return _client


def run_triage(
    subject: str,
    body: str,
    agents: list,
    ticket_id: str = "n/a",
) -> TriageResult:
    """Call Gemini with structured output. Logs outcome; never logs subject/body."""
    start = time.monotonic()
    timeout_ms = settings.GEMINI_TIMEOUT_SECONDS * 1000
    try:
        client = _get_genai_client()
        prompt = TRIAGE_PROMPT.format(subject=subject[:500], body=body[:8000])
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_json_schema=TriageResponseSchema.model_json_schema(),
                http_options=types.HttpOptions(timeout=timeout_ms),
            ),
        )
        result = _coerce_triage_result(_parsed_to_dict(response.parsed))
        log_event(
            logger,
            logging.INFO,
            "triage",
            ticket_id=ticket_id,
            outcome="success",
            latency_ms=int((time.monotonic() - start) * 1000),
        )
        return result
    except Exception:
        log_event(
            logger,
            logging.WARNING,
            "triage",
            ticket_id=ticket_id,
            outcome="fallback",
            latency_ms=int((time.monotonic() - start) * 1000),
        )
        return TriageResult()
