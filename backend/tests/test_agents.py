import pytest
from app.models.agent import Agent


@pytest.mark.asyncio
async def test_list_agents_empty(client):
    response = await client.get("/agents")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_list_agents_returns_agents(client, db_session):
    db_session.add(Agent(email="a@test.com", name="Alice"))
    db_session.add(Agent(email="b@test.com", name="Bob"))
    db_session.commit()

    response = await client.get("/agents")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    emails = {a["email"] for a in data}
    assert emails == {"a@test.com", "b@test.com"}


@pytest.mark.asyncio
async def test_list_agents_returns_id_email_name(client, db_session):
    db_session.add(Agent(email="c@test.com", name="Carol"))
    db_session.commit()

    response = await client.get("/agents")
    agent = response.json()[0]
    assert "id" in agent
    assert "email" in agent
    assert "name" in agent
