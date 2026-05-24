import pytest

from fastapi import HTTPException
from unittest.mock import MagicMock
from app.dependencies import require_api_key, require_magic_token

def test_require_api_key_raises_401_on_wrong_key():
    request = MagicMock()
    request.headers = {"x-api-key": "wrong"}
    with pytest.raises(HTTPException) as exc:
        require_api_key(request)
    assert exc.value.status_code == 401

def test_require_api_key_passes_correct_key(monkeypatch):
    from app import dependencies
    monkeypatch.setattr(dependencies.settings, "API_KEY", "correct-key")
    request = MagicMock()
    request.headers = {"x-api-key": "correct-key"}
    result = require_api_key(request)
    assert result is True


def test_require_magic_token_raises_404_on_unknown_token(db_session):
    with pytest.raises(HTTPException) as exc:
        require_magic_token(token="not-a-real-token", db=db_session)
    assert exc.value.status_code == 404
