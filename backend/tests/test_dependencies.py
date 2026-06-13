import pytest

from fastapi import HTTPException
from app.dependencies import require_api_key, require_magic_token, require_magic_token_header


def test_require_api_key_raises_401_on_wrong_key():
    with pytest.raises(HTTPException) as exc:
        require_api_key(api_key="wrong")
    assert exc.value.status_code == 401


def test_require_api_key_passes_correct_key(monkeypatch):
    from app import dependencies

    monkeypatch.setattr(dependencies.settings, "API_KEY", "correct-key")
    result = require_api_key(api_key="correct-key")
    assert result is True


def test_require_magic_token_raises_404_on_unknown_token(db_session):
    with pytest.raises(HTTPException) as exc:
        require_magic_token(token="not-a-real-token", db=db_session)
    assert exc.value.status_code == 404


def test_require_magic_token_header_raises_401_when_missing(db_session):
    with pytest.raises(HTTPException) as exc:
        require_magic_token_header(token=None, db=db_session)
    assert exc.value.status_code == 401


def test_require_magic_token_header_passes_valid_token(db_session):
    from app.models.magic_token import MagicToken
    from app.models.ticket import Ticket

    ticket = Ticket(
        subject="S",
        body="B",
        customer_email="c@c.com",
        customer_name="C",
    )
    db_session.add(ticket)
    db_session.flush()
    mt = MagicToken(ticket_id=ticket.id, token="header-token-uuid")
    db_session.add(mt)
    db_session.commit()

    result = require_magic_token_header(token="header-token-uuid", db=db_session)
    assert result.token == "header-token-uuid"
