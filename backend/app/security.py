from fastapi.security import APIKeyHeader, HTTPBearer

api_key_header = APIKeyHeader(
    name="x-api-key",
    scheme_name="ApiKeyAuth",
    auto_error=False,
)
clerk_bearer = HTTPBearer(
    scheme_name="ClerkBearer",
    bearerFormat="JWT",
    auto_error=False,
)
magic_token_header = APIKeyHeader(
    name="x-magic-token",
    scheme_name="MagicTokenAuth",
    auto_error=False,
)
worker_bearer = HTTPBearer(
    scheme_name="WorkerOidc",
    bearerFormat="JWT",
    auto_error=False,
)
