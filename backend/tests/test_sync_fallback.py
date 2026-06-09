import pytest
from unittest.mock import patch


@pytest.mark.asyncio
@patch("app.routers.workers.run_triage")
@patch("app.routers.workers.send_confirmation_email")
async def test_create_ticket_calls_triage_sync_when_cloud_tasks_disabled(
    mock_email, mock_triage, client, db_session
):
    from app.services.triage import TriageResult

    mock_triage.return_value = TriageResult(
        category="general",
        priority="low",
        escalate=False,
        draft_reply="Hi there!",
        assigned_agent_id=None,
    )

    payload = {
        "subject": "Sync test",
        "body": "Testing sync",
        "customer_email": "sync@test.com",
        "customer_name": "Sync",
    }
    response = await client.post(
        "/tickets", json=payload, headers={"x-api-key": "test-api-key"}
    )
    assert response.status_code == 201

    mock_triage.assert_called_once_with(
        subject="Sync test", body="Testing sync", agents=[]
    )

    ticket_id = response.json()["id"]
    from app.models.ticket import Ticket

    ticket = db_session.query(Ticket).filter(Ticket.id == ticket_id).first()
    assert ticket.ai_draft_reply == "Hi there!"
    assert ticket.category.value == "general"

    mock_email.assert_called_once()
