import pytest
from unittest.mock import MagicMock, patch
from app.services.triage import (
    TriageResult,
    TriageResponseSchema,
    run_triage,
    _coerce_triage_result,
)


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


@patch("app.services.triage.genai")
def test_run_triage_calls_vertex_and_returns_result(mock_genai):
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

    result = run_triage(subject="Hello", body="Need help", agents=[])
    assert result.category == "general"
    assert result.draft_reply == "Hello"
    mock_client.models.generate_content.assert_called_once()
    config = mock_client.models.generate_content.call_args.kwargs["config"]
    assert config.response_mime_type == "application/json"
    assert config.response_json_schema is TriageResponseSchema
    assert config.http_options.timeout == 15_000


@patch("app.services.triage.genai")
def test_run_triage_falls_back_on_exception(mock_genai):
    mock_client = MagicMock()
    mock_genai.Client.return_value = mock_client
    mock_client.models.generate_content.side_effect = Exception("API error")

    result = run_triage(subject="Hello", body="Need help", agents=[])
    assert result.category == "other"
    assert result.priority == "medium"
