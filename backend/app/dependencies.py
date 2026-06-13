from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.magic_token import MagicToken
from app.settings import settings


def require_api_key(request: Request) -> bool:
    key = request.headers.get("x-api-key", "")
    if key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


def require_magic_token(token: str, db: Session = Depends(get_db)) -> MagicToken:
    mt = db.query(MagicToken).filter(MagicToken.token == token).first()
    if mt is None:
        raise HTTPException(status_code=404, detail="Invalid token")
    return mt


def require_magic_token_header(
    request: Request, db: Session = Depends(get_db)
) -> MagicToken:
    token = request.headers.get("x-magic-token", "")
    if not token:
        raise HTTPException(status_code=401, detail="Missing magic token")
    return require_magic_token(token=token, db=db)

def require_clerk_agent(request: Request) -> dict:
    from clerk_backend_api import Clerk
    from clerk_backend_api.security import AuthenticateRequestOptions

    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    parties = [
        p.strip()
        for p in (settings.CLERK_AUTHORIZED_PARTIES or "").split(",")
        if p.strip()
    ]
    clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)
    state = clerk.authenticate_request(
        request,
        AuthenticateRequestOptions(authorized_parties=parties or None),
    )

    if not state.is_signed_in or state.payload is None:
        raise HTTPException(status_code=401, detail="Invalid Clerk token")

    payload = state.payload or {}
    email = (payload.get("email") or "").lower()

    if settings.OPERATOR_EMAIL_ALLOWLIST:
        allowlist = [
            e.strip().lower() for e in settings.OPERATOR_EMAIL_ALLOWLIST.split(",")
        ]
        if email not in allowlist:
            raise HTTPException(
                status_code=403, detail="Email not in operator allowlist"
            )

    return payload
