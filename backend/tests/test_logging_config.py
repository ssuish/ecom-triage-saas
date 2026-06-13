import json
import logging
from unittest.mock import MagicMock

from app.logging_config import configure_logging, log_event


def test_log_event_emits_json_with_event_field():
    mock_logger = MagicMock()
    log_event(
        mock_logger,
        logging.INFO,
        "triage",
        ticket_id="t-1",
        outcome="success",
        latency_ms=42,
    )
    mock_logger.log.assert_called_once()
    payload = json.loads(mock_logger.log.call_args[0][1])
    assert payload["event"] == "triage"
    assert payload["ticket_id"] == "t-1"
    assert payload["outcome"] == "success"
    assert payload["latency_ms"] == 42


def test_configure_logging_idempotent():
    configure_logging(is_production=False)
    root = logging.getLogger()
    handler_count = len(root.handlers)
    configure_logging(is_production=False)
    assert len(root.handlers) == handler_count
