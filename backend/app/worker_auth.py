import logging

from fastapi import HTTPException, Request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.logging_config import log_event
from app.settings import settings

logger = logging.getLogger(__name__)


def _auth_failed(reason: str) -> HTTPException:
    log_event(logger, logging.WARNING, "worker_auth_failed", reason=reason)
    return HTTPException(status_code=401, detail=reason)


async def verify_cloud_tasks_oidc(request: Request) -> None:
    """Verify Cloud Tasks OIDC Bearer JWT against TASKS_OIDC_AUDIENCE."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise _auth_failed("Missing Bearer token")

    token = auth.removeprefix("Bearer ").strip()
    audience = settings.TASKS_OIDC_AUDIENCE
    if not audience:
        raise _auth_failed("OIDC audience not configured")

    try:
        claims = id_token.verify_oauth2_token(
            token, google_requests.Request(), audience=audience
        )
    except Exception:
        raise _auth_failed("Invalid OIDC token")

    if settings.TASKS_INVOKER_SA_EMAIL:
        email = claims.get("email") or claims.get("sub", "")
        if email != settings.TASKS_INVOKER_SA_EMAIL:
            raise _auth_failed("Unexpected invoker identity")
