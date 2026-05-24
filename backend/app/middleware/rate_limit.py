from slowapi import Limiter
from slowapi.util import get_remote_address

from app.settings import settings

limiter = Limiter(key_func=get_remote_address)

TICKET_CREATE_LIMIT = settings.RATE_LIMIT_TICKETS