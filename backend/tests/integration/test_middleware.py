import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_request_id_generated_automatically(client: AsyncClient):
    """Ensure middleware automatically injects X-Request-ID when not supplied."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) > 10


@pytest.mark.asyncio
async def test_request_id_preserved_from_client_header(client: AsyncClient):
    """Ensure client-provided X-Request-ID is preserved and returned."""
    custom_id = "custom-trace-id-12345"
    response = await client.get("/health", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == custom_id
