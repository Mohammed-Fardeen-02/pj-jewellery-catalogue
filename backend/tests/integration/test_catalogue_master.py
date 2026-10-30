import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User


async def get_admin_headers(client: AsyncClient, db_session: AsyncSession) -> dict[str, str]:
    """Helper to seed and authenticate an admin, returning Bearer headers."""
    admin = User(
        email="testadmin@pjjewellery.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Catalogue Admin",
        role="admin",
        is_active=True,
    )
    db_session.add(admin)
    await db_session.commit()

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@pjjewellery.com", "password": "AdminPass123!"},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# =========================================================================
# Category Master Tests
# =========================================================================


@pytest.mark.asyncio
async def test_create_category_and_auto_slug(client: AsyncClient, db_session: AsyncSession):
    """Test category creation with auto-generated slug."""
    headers = await get_admin_headers(client, db_session)

    res = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Diamond Rings", "description": "Solitaire and eternity bands"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Diamond Rings"
    assert data["slug"] == "diamond-rings"
    assert data["is_active"] is True
    assert data["product_count"] == 0


@pytest.mark.asyncio
async def test_reject_duplicate_category_name_and_slug(
    client: AsyncClient, db_session: AsyncSession
):
    """Ensure duplicate category name or slug triggers 409 Conflict."""
    headers = await get_admin_headers(client, db_session)

    # 1. First creation
    res1 = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Fine Necklaces", "slug": "necklaces"},
    )
    assert res1.status_code == 201

    # 2. Duplicate slug
    res2 = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Another Necklaces", "slug": "necklaces"},
    )
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "CONFLICT"

    # 3. Duplicate name
    res3 = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Fine Necklaces"},
    )
    assert res3.status_code == 409
    assert res3.json()["error"]["code"] == "CONFLICT"


@pytest.mark.asyncio
async def test_update_category_and_list_admin(client: AsyncClient, db_session: AsyncSession):
    """Test updating category metadata and listing for administrators."""
    headers = await get_admin_headers(client, db_session)

    # Create
    create_res = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Pendants", "is_active": True},
    )
    category_id = create_res.json()["id"]

    # Update
    update_res = await client.patch(
        f"/api/v1/admin/categories/{category_id}",
        headers=headers,
        json={"name": "Luxury Pendants & Lockets", "description": "High jewelry pendants"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Luxury Pendants & Lockets"
    assert update_res.json()["description"] == "High jewelry pendants"

    # List admin
    list_res = await client.get("/api/v1/admin/categories?search=pendants", headers=headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert any(c["id"] == category_id for c in list_data["items"])


# =========================================================================
# Product Master & Lifecycle Tests
# =========================================================================


@pytest.mark.asyncio
async def test_product_crud_and_lifecycle(client: AsyncClient, db_session: AsyncSession):
    """Test full product lifecycle: draft -> published -> archived and status validation."""
    headers = await get_admin_headers(client, db_session)

    # 1. Create Category
    cat_res = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Artisan Bracelets"},
    )
    cat_id = cat_res.json()["id"]

    # 2. Create Draft Product
    prod_res = await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json={
            "title": "Pavé Diamond Bangle",
            "category_id": cat_id,
            "description": "Hand-set pavé diamonds in 18K white gold",
            "tags": ["bangle", "diamond", "white-gold"],
            "keywords": ["pave bangle", "tennis bracelet"],
            "attributes": {
                "metal_type": "18K White Gold",
                "stone_weight": 2.45,
            },
            "status": "draft",
        },
    )
    assert prod_res.status_code == 201
    prod_data = prod_res.json()
    prod_id = prod_data["id"]
    slug = prod_data["slug"]
    assert prod_data["status"] == "draft"
    assert prod_data["is_published"] is False
    assert prod_data["sku"].startswith("PJ-")

    # 3. Verify product is HIDDEN from public storefront while in Draft
    pub_get_res = await client.get(f"/api/v1/public/products/{slug}")
    assert pub_get_res.status_code == 404

    pub_list_res = await client.get("/api/v1/public/products")
    assert not any(p["slug"] == slug for p in pub_list_res.json()["items"])

    # 4. Publish Product
    pub_res = await client.patch(
        f"/api/v1/admin/products/{prod_id}/status",
        headers=headers,
        json={"status": "published"},
    )
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "published"
    assert pub_res.json()["is_published"] is True

    # 5. Verify product is now VISIBLE on public storefront
    pub_detail = await client.get(f"/api/v1/public/products/{slug}")
    assert pub_detail.status_code == 200
    assert pub_detail.json()["title"] == "Pavé Diamond Bangle"

    # 6. Archive Product
    arch_res = await client.patch(
        f"/api/v1/admin/products/{prod_id}/status",
        headers=headers,
        json={"status": "archived"},
    )
    assert arch_res.status_code == 200
    assert arch_res.json()["status"] == "archived"

    # 7. Verify product is HIDDEN from public storefront while Archived
    arch_pub = await client.get(f"/api/v1/public/products/{slug}")
    assert arch_pub.status_code == 404


@pytest.mark.asyncio
async def test_prevent_category_deletion_when_products_associated(
    client: AsyncClient, db_session: AsyncSession
):
    """Ensure category deletion is blocked if products are associated with it."""
    headers = await get_admin_headers(client, db_session)

    # 1. Create Category
    cat_res = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Bridal Tiara"},
    )
    cat_id = cat_res.json()["id"]

    # 2. Create Product in Category
    await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json={"title": "Regal Diamond Tiara", "category_id": cat_id},
    )

    # 3. Attempt to delete category
    del_res = await client.delete(f"/api/v1/admin/categories/{cat_id}", headers=headers)
    assert del_res.status_code == 400
    data = del_res.json()
    assert data["error"]["code"] == "BAD_REQUEST"
    assert "associated" in data["error"]["message"].lower()


@pytest.mark.asyncio
async def test_prevent_inactive_category_assignment(client: AsyncClient, db_session: AsyncSession):
    """Ensure products cannot be assigned to an inactive category."""
    headers = await get_admin_headers(client, db_session)

    # Create inactive category
    cat_res = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Archived Line", "is_active": False},
    )
    cat_id = cat_res.json()["id"]

    # Attempt to assign
    prod_res = await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json={"title": "Sample Piece", "category_id": cat_id},
    )
    assert prod_res.status_code == 400
    assert "inactive category" in prod_res.json()["error"]["message"].lower()


# =========================================================================
# Security & Access Control Tests
# =========================================================================


@pytest.mark.asyncio
async def test_admin_routes_reject_unauthenticated_requests(client: AsyncClient):
    """Verify unauthenticated requests are rejected with 401 Unauthorized."""
    endpoints = [
        ("POST", "/api/v1/admin/categories", {"name": "Test"}),
        ("GET", "/api/v1/admin/categories", None),
        ("POST", "/api/v1/admin/products", {"title": "Test"}),
        ("GET", "/api/v1/admin/products", None),
    ]

    for method, endpoint, payload in endpoints:
        if method == "POST":
            res = await client.post(endpoint, json=payload)
        else:
            res = await client.get(endpoint)
        assert res.status_code == 401
        assert res.json()["error"]["code"] == "UNAUTHORIZED"
