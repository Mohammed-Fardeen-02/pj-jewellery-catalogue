from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import Settings, get_settings
from app.dependencies.database import get_db
from app.main import create_application
from app.models import Base

# Test database URL using in-memory aiosqlite
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


def get_test_settings() -> Settings:
    """Provide isolated settings for tests."""
    return Settings(
        APP_NAME="PJ Jewellery Test Suite",
        APP_ENV="test",
        DEBUG=True,
        DATABASE_URL=TEST_DATABASE_URL,
        JWT_SECRET_KEY="test-secret-key-that-is-at-least-32-characters-long-for-testing",
        JWT_ALGORITHM="HS256",
        ACCESS_TOKEN_EXPIRE_MINUTES=5,
        REFRESH_TOKEN_EXPIRE_DAYS=1,
    )


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
async def test_engine():
    """Create an isolated in-memory SQLite engine for the test."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Provide an isolated database session for testing."""
    session_maker = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    async with session_maker() as session:
        yield session
        await session.rollback()


@pytest.fixture
def app_instance():
    """Create a fresh FastAPI app instance."""
    return create_application()


@pytest.fixture
async def client(app_instance, db_session) -> AsyncGenerator[AsyncClient, None]:
    """Provide an AsyncClient wired with the in-memory test database session."""

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app_instance.dependency_overrides[get_db] = override_get_db
    app_instance.dependency_overrides[get_settings] = get_test_settings

    transport = ASGITransport(app=app_instance)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app_instance.dependency_overrides.clear()
