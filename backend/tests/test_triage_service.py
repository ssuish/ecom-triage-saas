import pytest
from unittest.mock import MagicMock, patch
import app.services.triage as triage_module
from app.services.triage import (
    TriageResult,
    TriageResponseSchema,
    run_triage,
    _coerce_triage_result,
    _get_genai_client,
)


@pytest.fixture(autouse=True)
def reset_genai_client():
    triage_module._client = None
    yield
    triage_module._client = None


def test_triage_result_defaults():
    r = TriageResult()
    assert r.category == "other"
    assert r.priority == "medium"
    assert r.escalate is False
    assert r.draft_reply == ""
    assert r.assigned_agent_id is None


def test_coerce_valid_dict():
    data = {
        "category": "billing",
        "priority": "high",
        "escalate": True,
        "draft_reply": "We are looking into it.",
        "assigned_agent_id": None,
    }
    result = _coerce_triage_result(data)
    assert result.category == "billing"
    assert result.priority == "high"


def test_coerce_invalid_enum_returns_defaults():
    result = _coerce_triage_result(
        {"category": "unknown", "priority": "extreme", "escalate": False, "draft_reply": "x"}
    )
    assert result.category == "other"
    assert result.priority == "medium"


@patch("app.services.triage.settings")
@patch("app.services.triage.genai")
def test_get_genai_client_rejects_api_key_in_production(mock_genai, mock_settings):
    mock_settings.IS_PRODUCTION = True
    mock_settings.GEMINI_API_KEY = "secret-key"
    mock_settings.GCP_PROJECT_ID = "my-project"
    mock_settings.VERTEX_LOCATION = "global"

    with pytest.raises(RuntimeError, match="GEMINI_API_KEY not allowed in production"):
        _get_genai_client()
    mock_genai.Client.assert_not_called()


@patch("app.services.triage.settings")
@patch("app.services.triage.genai")
def test_get_genai_client_uses_api_key_locally(mock_genai, mock_settings):
    mock_client = MagicMock()
    mock_genai.Client.return_value = mock_client
    mock_settings.IS_PRODUCTION = False
    mock_settings.GEMINI_API_KEY = "dev-key"
    mock_settings.GOOGLE_GENAI_USE_VERTEXAI = False

    client = _get_genai_client()
    assert client is mock_client
    mock_genai.Client.assert_called_once_with(api_key="dev-key")


@patch("app.services.triage.settings")
@patch("app.services.triage.genai")
def test_get_genai_client_uses_vertex_when_flag_set(mock_genai, mock_settings):
    mock_client = MagicMock()
    mock_genai.Client.return_value = mock_client
    mock_settings.IS_PRODUCTION = False
    mock_settings.GEMINI_API_KEY = ""
    mock_settings.GOOGLE_GENAI_USE_VERTEXAI = True
    mock_settings.GCP_PROJECT_ID = "my-project"
    mock_settings.VERTEX_LOCATION = "global"

    client = _get_genai_client()
    assert client is mock_client
    mock_genai.Client.assert_called_once_with(
        vertexai=True,
        project="my-project",
        location="global",
    )


@patch("app.services.triage.settings")
@patch("app.services.triage.genai")
def test_get_genai_client_singleton(mock_genai, mock_settings):
    mock_client = MagicMock()
    mock_genai.Client.return_value = mock_client
    mock_settings.IS_PRODUCTION = False
    mock_settings.GEMINI_API_KEY = "dev-key"
    mock_settings.GOOGLE_GENAI_USE_VERTEXAI = False

    first = _get_genai_client()
    second = _get_genai_client()
    assert first is second
    mock_genai.Client.assert_called_once()


@patch("app.services.triage.log_event")
@patch("app.services.triage.settings")
@patch("app.services.triage.genai")
def test_run_triage_calls_vertex_and_returns_result(mock_genai, mock_settings, mock_log_event):
    mock_settings.IS_PRODUCTION = False
    mock_settings.GEMINI_API_KEY = "dev-key"
    mock_settings.GOOGLE_GENAI_USE_VERTEXAI = False
    mock_settings.GEMINI_MODEL = "gemini-3.1-flash-lite-preview"
    mock_settings.GEMINI_TIMEOUT_SECONDS = 15

    mock_client = MagicMock()
    mock_genai.Client.return_value = mock_client
    mock_response = MagicMock()
    mock_response.parsed = TriageResponseSchema(
        category="general",
        priority="medium",
        escalate=False,
        draft_reply="Hello",
        assigned_agent_id=None,
    )
    mock_client.models.generate_content.return_value = mock_response

    result = run_triage(subject="Hello", body="Need help", agents=[], ticket_id="t-1")
    assert result.category == "general"
    assert result.draft_reply == "Hello"
    mock_client.models.generate_content.assert_called_once()
    config = mock_client.models.generate_content.call_args.kwargs["config"]
    assert config.response_mime_type == "application/json"
    assert config.response_json_schema == TriageResponseSchema.model_json_schema()
    assert config.http_options.timeout == 15_000
    mock_log_event.assert_called_once()
    assert mock_log_event.call_args[0][2] == "triage"
    assert mock_log_event.call_args[1]["outcome"] == "success"
    assert mock_log_event.call_args[1]["ticket_id"] == "t-1"


@patch("app.services.triage.log_event")
@patch("app.services.triage.settings")
@patch("app.services.triage.genai")
def test_run_triage_singleton_reuses_client(mock_genai, mock_settings, mock_log_event):
    mock_settings.IS_PRODUCTION = False
    mock_settings.GEMINI_API_KEY = "dev-key"
    mock_settings.GOOGLE_GENAI_USE_VERTEXAI = False
    mock_settings.GEMINI_MODEL = "gemini-3.1-flash-lite-preview"
    mock_settings.GEMINI_TIMEOUT_SECONDS = 15

    mock_client = MagicMock()
    mock_genai.Client.return_value = mock_client
    mock_response = MagicMock()
    mock_response.parsed = TriageResponseSchema(
        category="general",
        priority="medium",
        escalate=False,
        draft_reply="Hello",
        assigned_agent_id=None,
    )
    mock_client.models.generate_content.return_value = mock_response

    run_triage(subject="Hello", body="Need help", agents=[], ticket_id="t-1")
    run_triage(subject="Again", body="Need help", agents=[], ticket_id="t-2")
    mock_genai.Client.assert_called_once()


@patch("app.services.triage.log_event")
@patch("app.services.triage.settings")
@patch("app.services.triage.genai")
def test_run_triage_falls_back_on_exception(mock_genai, mock_settings, mock_log_event):
    mock_settings.IS_PRODUCTION = False
    mock_settings.GEMINI_API_KEY = "dev-key"
    mock_settings.GOOGLE_GENAI_USE_VERTEXAI = False
    mock_settings.GEMINI_MODEL = "gemini-3.1-flash-lite-preview"
    mock_settings.GEMINI_TIMEOUT_SECONDS = 15

    mock_client = MagicMock()
    mock_genai.Client.return_value = mock_client
    mock_client.models.generate_content.side_effect = Exception("API error")

    result = run_triage(subject="Hello", body="Need help", agents=[], ticket_id="t-2")
    assert result.category == "other"
    assert result.priority == "medium"
    mock_log_event.assert_called_once()
    assert mock_log_event.call_args[1]["outcome"] == "fallback"
