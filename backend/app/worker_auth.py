from fastapi import HTTPException, Request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.settings import settings


async def verify_cloud_tasks_oidc(request: Request) -> None:
    """Verify Cloud Tasks OIDC Bearer JWT against TASKS_OIDC_AUDIENCE."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = auth.removeprefix("Bearer ").strip()
    audience = settings.TASKS_OIDC_AUDIENCE
    if not audience:
        raise HTTPException(status_code=401, detail="OIDC audience not configured")

    try:
        claims = id_token.verify_oauth2_token(
            token, google_requests.Request(), audience=audience
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid OIDC token")

    if settings.TASKS_INVOKER_SA_EMAIL:
        email = claims.get("email") or claims.get("sub", "")
        if email != settings.TASKS_INVOKER_SA_EMAIL:
            raise HTTPException(status_code=401, detail="Unexpected invoker identity")
