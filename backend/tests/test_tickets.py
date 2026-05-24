import pytest


@pytest.mark.asyncio
async def test_create_ticket_returns_201(client):
    payload = {
        "subject": "Can't log in",
        "body": "I keep getting a 403 error",
        "customer_email": "user@example.com",
        "customer_name": "Jane Doe",
    }
    response = await client.post(
        "/tickets", json=payload, headers={"x-api-key": "test-api-key"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["subject"] == "Can't log in"
    assert data["status"] == "open"
    assert data["source"] == "form"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_ticket_generates_magic_token(client, db_session):
    from app.models.magic_token import MagicToken

    payload = {
        "subject": "Billing question",
        "body": "When is my invoice due?",
        "customer_email": "pay@example.com",
        "customer_name": "Bob",
    }
    response = await client.post(
        "/tickets", json=payload, headers={"x-api-key": "test-api-key"}
    )
    assert response.status_code == 201
    ticket_id = response.json()["id"]

    mt = db_session.query(MagicToken).filter(MagicToken.ticket_id == ticket_id).first()
    assert mt is not None
    assert len(mt.token) == 36  # UUID4


@pytest.mark.asyncio
async def test_create_ticket_requires_api_key(client):
    payload = {
        "subject": "No key",
        "body": "body",
        "customer_email": "x@x.com",
        "customer_name": "X",
    }
    # override is set to bypass in conftest, send wrong key directly
    # We need a client WITHOUT the api key override here
    # Use raw client without override
    from httpx import AsyncClient, ASGITransport
    from app.main import app
    from app.dependencies import require_api_key

    # Remove api key override temporarily
    app.dependency_overrides.pop(require_api_key, None)
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as raw:
        resp = await raw.post("/tickets", json=payload, headers={"x-api-key": "wrong"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_list_tickets_empty(client):
    response = await client.get("/tickets")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_list_tickets_returns_created_ticket(client):
    payload = {
        "subject": "Test ticket",
        "body": "Test body",
        "customer_email": "t@t.com",
        "customer_name": "T",
    }
    await client.post("/tickets", json=payload, headers={"x-api-key": "test-api-key"})

    response = await client.get("/tickets")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["subject"] == "Test ticket"


@pytest.mark.asyncio
async def test_list_tickets_filter_by_status(client):
    # Create two tickets
    for subject in ["A", "B"]:
        await client.post(
            "/tickets",
            json={
                "subject": subject,
                "body": "b",
                "customer_email": "e@e.com",
                "customer_name": "E",
            },
            headers={"x-api-key": "test-api-key"},
        )

    response = await client.get("/tickets?status=open")
    assert response.status_code == 200
    assert response.json()["total"] == 2

    response = await client.get("/tickets?status=resolved")
    assert response.json()["total"] == 0


@pytest.mark.asyncio
async def test_get_ticket_by_id(client):
    payload = {
        "subject": "Single",
        "body": "b",
        "customer_email": "s@s.com",
        "customer_name": "S",
    }
    create_resp = await client.post(
        "/tickets", json=payload, headers={"x-api-key": "test-api-key"}
    )
    ticket_id = create_resp.json()["id"]

    response = await client.get(f"/tickets/{ticket_id}")
    assert response.status_code == 200
    assert response.json()["id"] == ticket_id


@pytest.mark.asyncio
async def test_get_ticket_not_found(client):
    response = await client.get("/tickets/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_assign_ticket(client, db_session):
    from app.models.agent import Agent

    agent = Agent(email="a@test.com", name="Alice")
    db_session.add(agent)
    db_session.commit()

    create_resp = await client.post(
        "/tickets",
        json={
            "subject": "S",
            "body": "B",
            "customer_email": "c@c.com",
            "customer_name": "C",
        },
        headers={"x-api-key": "test-api-key"},
    )

    ticket_id = create_resp.json()["id"]

    response = await client.patch(
        f"/tickets/{ticket_id}/assign", json={"agent_id": agent.id}
    )
    assert response.status_code == 200
    assert response.json()["assigned_agent_id"] == agent.id


@pytest.mark.asyncio
async def test_assign_ticket_unknown_agent_raises_404(client):
    create_resp = await client.post(
        "/tickets",
        json={
            "subject": "S",
            "body": "B",
            "customer_email": "c@c.com",
            "customer_name": "C",
        },
        headers={"x-api-key": "test-api-key"},
    )
    ticket_id = create_resp.json()["id"]
    response = await client.patch(
        f"/tickets/{ticket_id}/assign",
        json={"agent_id": "00000000-0000-0000-0000-000000000000"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_reply_sets_in_progress(client):
    create_resp = await client.post(
        "/tickets",
        json={
            "subject": "S",
            "body": "B",
            "customer_email": "c@c.com",
            "customer_name": "C",
        },
        headers={"x-api-key": "test-api-key"},
    )
    ticket_id = create_resp.json()["id"]

    response = await client.patch(
        f"/tickets/{ticket_id}/reply", json={"agent_reply": "Thanks for reaching out!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["agent_reply"] == "Thanks for reaching out!"
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_resolve_sets_resolved(client):
    create_resp = await client.post(
        "/tickets",
        json={
            "subject": "S",
            "body": "B",
            "customer_email": "c@c.com",
            "customer_name": "C",
        },
        headers={"x-api-key": "test-api-key"},
    )
    ticket_id = create_resp.json()["id"]

    response = await client.patch(f"/tickets/{ticket_id}/resolve", json={})
    assert response.status_code == 200
    assert response.json()["status"] == "resolved"


@pytest.mark.asyncio
async def test_customer_status_with_valid_token(client, db_session):
    from app.models.magic_token import MagicToken

    create_resp = await client.post(
        "/tickets",
        json={
            "subject": "My issue",
            "body": "Details",
            "customer_email": "c@c.com",
            "customer_name": "C",
        },
        headers={"x-api-key": "test-api-key"},
    )
    ticket_id = create_resp.json()["id"]
    mt = db_session.query(MagicToken).filter(MagicToken.ticket_id == ticket_id).first()

    response = await client.get(f"/tickets/{ticket_id}/status?token={mt.token}")
    assert response.status_code == 200
    data = response.json()
    assert data["subject"] == "My issue"
    assert "assigned_agent_id" not in data
    assert "escalate" not in data
    assert "ai_draft_reply" not in data


@pytest.mark.asyncio
async def test_customer_status_invalid_token_returns_404(client):
    create_resp = await client.post(
        "/tickets",
        json={
            "subject": "S",
            "body": "B",
            "customer_email": "c@c.com",
            "customer_name": "C",
        },
        headers={"x-api-key": "test-api-key"},
    )
    ticket_id = create_resp.json()["id"]

    response = await client.get(f"/tickets/{ticket_id}/status?token=bad-token")
    assert response.status_code == 404
