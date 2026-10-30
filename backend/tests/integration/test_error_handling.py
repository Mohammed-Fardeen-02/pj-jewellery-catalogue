import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User


@pytest.mark.asyncio
async def test_not_found_error_envelope(client: AsyncClient):
    """Ensure non-existent routes return standardized error envelope."""
    response = await client.get("/api/v1/non-existent-route")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "HTTP_ERROR"
    assert "request_id" in data


@pytest.mark.asyncio
async def test_validation_error_envelope(client: AsyncClient):
    """Ensure invalid payload returns 422 with structured field details."""
    response = await client.post(
        "/api/v1/auth/login", json={"email": "not-an-email", "password": "123"}
    )
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert len(data["error"]["details"]) > 0


@pytest.mark.asyncio
async def test_placeholder_endpoints_return_501(client: AsyncClient):
    """Ensure unimplemented brand notice endpoint returns 501 Not Implemented."""
    response = await client.get("/api/v1/brands")
    assert response.status_code == 501
    data = response.json()
    assert data["error"]["code"] == "NOT_IMPLEMENTED"


@pytest.mark.asyncio
async def test_protected_route_without_token(client: AsyncClient):
    """Ensure protected endpoint /api/v1/auth/me returns 401 Unauthorized when unauthenticated."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_auth_login_and_me_flow(client: AsyncClient, db_session: AsyncSession):
    """Test full login, me, and token refresh flow with seeded test user."""
    # Seed active test administrator
    test_user = User(
        email="admin@testpj.com",
        hashed_password=get_password_hash("TestPassword123!"),
        full_name="Test Admin",
        role="admin",
        is_active=True,
    )
    db_session.add(test_user)
    await db_session.commit()

    # 1. Login with valid credentials
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@testpj.com", "password": "TestPassword123!"},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["token_type"] == "bearer"

    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]

    # 2. Access /api/v1/auth/me with Bearer token
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "admin@testpj.com"
    assert me_data["role"] == "admin"
    assert me_data["is_active"] is True

    # 3. Refresh token
    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    refreshed_data = refresh_res.json()
    assert "access_token" in refreshed_data
    assert refreshed_data["access_token"] != access_token
