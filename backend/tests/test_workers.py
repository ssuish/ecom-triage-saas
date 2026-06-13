import pytest
from datetime import datetime, timezone
from unittest.mock import patch
from fastapi import HTTPException

from app.main import app
from app.models.magic_token import MagicToken
from app.models.ticket import Ticket
from app.worker_auth import verify_cloud_tasks_oidc


async def _verify_oidc_ok() -> None:
    return None


def _make_ticket(db_session, subject="Test", body="Body", email="c@c.com"):
    ticket = Ticket(subject=subject, body=body, customer_email=email, customer_name="C")
    db_session.add(ticket)
    db_session.flush()
    mt = MagicToken(ticket_id=ticket.id, token="test-magic-token-123")
    db_session.add(mt)
    db_session.commit()
    return ticket


@pytest.mark.asyncio
@patch("app.routers.workers.run_triage")
async def test_triage_worker_updates_ticket(mock_run_triage, client, db_session):
    from app.services.triage import TriageResult

    mock_run_triage.return_value = TriageResult(
        category="billing",
        priority="high",
        escalate=True,
        draft_reply="We'll look into it.",
        assigned_agent_id=None,
    )

    ticket = _make_ticket(db_session)

    response = await client.post(
        "/workers/triage",
        json={"ticket_id": ticket.id},
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 200

    db_session.refresh(ticket)
    assert ticket.category.value == "billing"
    assert ticket.priority.value == "high"
    assert ticket.escalate is True
    assert ticket.ai_draft_reply == "We'll look into it."


@pytest.mark.asyncio
async def test_triage_worker_rejects_invalid_signature(client, db_session):
    async def _verify_fail() -> None:
        raise HTTPException(status_code=401, detail="Invalid OIDC token")

    app.dependency_overrides[verify_cloud_tasks_oidc] = _verify_fail
    ticket = _make_ticket(db_session)
    response = await client.post(
        "/workers/triage",
        json={"ticket_id": ticket.id},
        headers={"Authorization": "Bearer bad"},
    )
    assert response.status_code == 401
    app.dependency_overrides[verify_cloud_tasks_oidc] = _verify_oidc_ok


@pytest.mark.asyncio
async def test_triage_worker_returns_404_for_missing_ticket(client):
    response = await client.post(
        "/workers/triage",
        json={"ticket_id": "00000000-0000-0000-0000-000000000000"},
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
@patch("app.routers.workers.send_confirmation_email")
async def test_email_worker_confirmation_type(mock_send, client, db_session):
    ticket = _make_ticket(db_session, email="user@example.com")

    response = await client.post(
        "/workers/email",
        json={
            "ticket_id": ticket.id,
            "to": "user@example.com",
            "type": "confirmation",
            "agent_reply": None,
            "magic_link": "https://app.example.com/ticket/abc?token=tok",
        },
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 200
    mock_send.assert_called_once()


@pytest.mark.asyncio
@patch("app.routers.workers.send_reply_email")
async def test_email_worker_reply_type(mock_send, client, db_session):
    ticket = _make_ticket(db_session, email="user@example.com")

    response = await client.post(
        "/workers/email",
        json={
            "ticket_id": ticket.id,
            "to": "user@example.com",
            "type": "reply",
            "agent_reply": "Here is your answer.",
            "magic_link": "https://app.example.com/ticket/abc?token=tok",
        },
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 200
    mock_send.assert_called_once()


@pytest.mark.asyncio
async def test_email_worker_rejects_mismatched_recipient(client, db_session):
    ticket = _make_ticket(db_session, email="user@example.com")

    response = await client.post(
        "/workers/email",
        json={
            "ticket_id": ticket.id,
            "to": "attacker@evil.com",
            "type": "confirmation",
            "agent_reply": None,
            "magic_link": "https://app.example.com/ticket/abc?token=tok",
        },
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_email_worker_rejects_invalid_signature(client, db_session):
    async def _verify_fail() -> None:
        raise HTTPException(status_code=401, detail="Invalid OIDC token")

    app.dependency_overrides[verify_cloud_tasks_oidc] = _verify_fail
    ticket = _make_ticket(db_session)
    response = await client.post(
        "/workers/email",
        json={
            "ticket_id": ticket.id,
            "to": "x@x.com",
            "type": "confirmation",
            "agent_reply": None,
            "magic_link": "https://app.example.com/t?token=x",
        },
        headers={"Authorization": "Bearer bad"},
    )
    assert response.status_code == 401
    app.dependency_overrides[verify_cloud_tasks_oidc] = _verify_oidc_ok


@pytest.mark.asyncio
@patch("app.routers.workers.run_triage")
async def test_triage_worker_skips_when_already_completed(mock_triage, client, db_session):
    ticket = _make_ticket(db_session)
    ticket.triage_completed_at = datetime.now(timezone.utc)
    db_session.commit()
    response = await client.post(
        "/workers/triage",
        json={"ticket_id": ticket.id},
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 200
    mock_triage.assert_not_called()
