from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.dependencies.database import get_db
from app.main import create_application
from tests.conftest import get_test_settings


@pytest.mark.asyncio
async def test_process_health(client: AsyncClient):
    """Test top-level process health endpoint /health."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "PJ Jewellery" in data["service"]


@pytest.mark.asyncio
async def test_liveness_probe(client: AsyncClient):
    """Test v1 liveness probe /api/v1/health/live."""
    response = await client.get("/api/v1/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "live"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_readiness_probe_database_connected(client: AsyncClient):
    """Test v1 readiness probe /api/v1/health/ready when database is healthy."""
    response = await client.get("/api/v1/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_readiness_probe_database_disconnected():
    """Test v1 readiness probe returns 503 without leaking credentials when db fails."""
    app = create_application()

    # Create mock session where execute raises an internal connection error
    mock_session = AsyncMock(spec=AsyncSession)
    mock_session.execute.side_effect = ConnectionRefusedError(
        "psql: error: connection to server at 'postgres-secret-host.internal' failed"
    )

    async def override_failing_db() -> AsyncGenerator[AsyncSession, None]:
        yield mock_session

    app.dependency_overrides[get_db] = override_failing_db
    app.dependency_overrides[get_settings] = get_test_settings

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/health/ready")

    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "not_ready"
    assert data["database"] == "disconnected"
    assert data["error"] == "Database service is unavailable"
    # Ensure no internal hostnames or credentials leaked to client
    assert "postgres-secret-host.internal" not in response.text
