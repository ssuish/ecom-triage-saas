import json
import logging
from typing import Any


def log_event(logger: logging.Logger, level: int, event: str, **fields: Any) -> None:
    """Emit one structured JSON log line (ADR-0007). No prompts or ticket bodies."""
    payload = {"event": event, **fields}
    logger.log(level, json.dumps(payload))


def configure_logging(is_production: bool) -> None:
    """Configure root logger. JSON in prod for Cloud Logging jsonPayload parsing."""
    root = logging.getLogger()
    if root.handlers:
        return

    handler = logging.StreamHandler()
    if is_production:
        handler.setFormatter(_JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(levelname)s %(name)s %(message)s")
        )

    root.addHandler(handler)
    root.setLevel(logging.INFO)


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        try:
            payload = json.loads(record.getMessage())
        except json.JSONDecodeError:
            payload = {"event": "log", "message": record.getMessage()}

        payload["severity"] = record.levelname
        return json.dumps(payload)
