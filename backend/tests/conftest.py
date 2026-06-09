import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.dependencies import require_clerk_agent, require_api_key
from app.worker_auth import verify_cloud_tasks_oidc

TEST_DB_URL = "sqlite+pysqlite:///:memory:"
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


FAKE_AGENT = {"sub": "user_test123", "email": "agent@example.com"}


async def _verify_oidc_ok() -> None:
    return None


@pytest.fixture
async def client(db_session):
    def override_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[require_clerk_agent] = lambda: FAKE_AGENT
    app.dependency_overrides[require_api_key] = lambda: True
    app.dependency_overrides[verify_cloud_tasks_oidc] = _verify_oidc_ok

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def client_with_magic_token(db_session):
    """Client fixture that allows magic token injection via override."""

    def override_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    from app.middleware.rate_limit import limiter

    limiter.reset()
    yield
    limiter.reset()