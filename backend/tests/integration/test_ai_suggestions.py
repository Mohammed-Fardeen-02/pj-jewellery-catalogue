import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User


async def get_admin_headers(client: AsyncClient, db_session: AsyncSession) -> dict[str, str]:
    admin = User(
        email=f"ai_admin_{uuid.uuid4().hex[:6]}@pjjewellery.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="AI Admin",
        role="admin",
        is_active=True,
    )
    db_session.add(admin)
    await db_session.commit()

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": admin.email, "password": "AdminPass123!"},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_ai_suggestions_security_and_contract(
    client: AsyncClient,
    db_session: AsyncSession,
):
    # 1. Unauthenticated request must be rejected
    unauth_res = await client.post(
        "/api/v1/admin/ai/suggest-product",
        json={"image_url": "https://example.com/ring.jpg"},
    )
    assert unauth_res.status_code == 401

    # 2. Authenticated admin request returns valid gemological suggestions
    admin_headers = await get_admin_headers(client, db_session)
    res = await client.post(
        "/api/v1/admin/ai/suggest-product",
        json={
            "image_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            "current_title": "Diamond Ring",
        },
        headers=admin_headers,
    )
    assert res.status_code == 200
    data = res.json()

    # Verify expected fields are present
    assert "title" in data
    assert "description" in data
    assert "category_name" in data
    assert "design_style" in data
    assert "tags" in data
    assert isinstance(data["tags"], list)

    # CRITICAL: Confirm price, purity, and weights are NOT populated by AI
    assert "price" not in data
    assert "purity" not in data
    assert "gross_weight" not in data
    assert "net_weight" not in data
    assert "stone_weight" not in data
