import io

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.integration.test_catalogue_master import get_admin_headers


@pytest.mark.asyncio
async def test_enforce_max_5_images_on_create(client: AsyncClient, db_session: AsyncSession):
    """Ensure product creation rejects payload containing more than 5 images."""
    headers = await get_admin_headers(client, db_session)

    # 1. Attempt creating with 6 images
    payload_6_images = {
        "title": "Hexa Gemstone Tiara",
        "images": [
            {"image_url": f"https://res.cloudinary.com/demo/image/{i}.jpg"}
            for i in range(1, 7)
        ],
    }
    res = await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json=payload_6_images,
    )
    assert res.status_code in (400, 422)

    # 2. Creating with exactly 5 images succeeds
    payload_5_images = {
        "title": "Penta Gemstone Tiara",
        "images": [
            {"image_url": f"https://res.cloudinary.com/demo/image/{i}.jpg"}
            for i in range(1, 6)
        ],
    }
    res2 = await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json=payload_5_images,
    )
    assert res2.status_code == 201
    assert len(res2.json()["images"]) == 5


@pytest.mark.asyncio
async def test_cloudinary_image_upload_and_limit_enforcement(
    client: AsyncClient, db_session: AsyncSession
):
    """Test image upload endpoint, Cloudinary mock fallback, and max 5 images limit."""
    headers = await get_admin_headers(client, db_session)

    # 1. Create a product with 4 images
    create_res = await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json={
            "title": "Platinum Solitaire Band",
            "images": [
                {"image_url": f"https://res.cloudinary.com/demo/image/{i}.jpg"}
                for i in range(1, 5)
            ],
        },
    )
    assert create_res.status_code == 201
    product = create_res.json()
    product_id = product["id"]
    assert len(product["images"]) == 4

    # 2. Upload 5th image via multipart form
    fake_image_file = (
        "gem_macro.jpg",
        io.BytesIO(b"\xFF\xD8\xFF\xE0" + b"\x00" * 200),
        "image/jpeg",
    )
    upload_res = await client.post(
        f"/api/v1/admin/products/{product_id}/images",
        headers=headers,
        files={"file": fake_image_file},
        data={"is_primary": "true", "alt_text": "High magnification gemstone macro"},
    )
    assert upload_res.status_code == 201
    updated = upload_res.json()
    assert len(updated["images"]) == 5
    assert updated["primary_image"]["alt_text"] == "High magnification gemstone macro"

    # 3. Attempt to upload a 6th image (should be rejected with 400 Bad Request)
    fake_image_6 = ("extra.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100), "image/png")
    over_limit_res = await client.post(
        f"/api/v1/admin/products/{product_id}/images",
        headers=headers,
        files={"file": fake_image_6},
    )
    assert over_limit_res.status_code == 400
    assert "maximum of 5 images" in over_limit_res.json()["error"]["message"]

    # 4. Delete an image to reduce count to 4
    image_to_delete = updated["images"][0]["id"]
    del_img_res = await client.delete(
        f"/api/v1/admin/products/{product_id}/images/{image_to_delete}",
        headers=headers,
    )
    assert del_img_res.status_code == 200
    assert len(del_img_res.json()["images"]) == 4

    # 5. Now upload is allowed again
    allow_upload_res = await client.post(
        f"/api/v1/admin/products/{product_id}/images",
        headers=headers,
        files={"file": fake_image_6},
    )
    assert allow_upload_res.status_code == 201
    assert len(allow_upload_res.json()["images"]) == 5


@pytest.mark.asyncio
async def test_product_video_upload_and_deletion(client: AsyncClient, db_session: AsyncSession):
    """Test video upload (1 video per product) and deletion flow."""
    headers = await get_admin_headers(client, db_session)

    # 1. Create product without video
    create_res = await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json={"title": "Celestial Diamond Pendant"},
    )
    assert create_res.status_code == 201
    product_id = create_res.json()["id"]
    assert create_res.json()["video_url"] is None

    # 2. Upload video
    fake_video = ("360_spin.mp4", io.BytesIO(b"\x00\x00\x00 ftypisom" + b"\x00" * 500), "video/mp4")
    video_res = await client.post(
        f"/api/v1/admin/products/{product_id}/video",
        headers=headers,
        files={"file": fake_video},
    )
    assert video_res.status_code == 200
    assert "video" in video_res.json()["video_url"]

    # 3. Delete video
    del_video_res = await client.delete(
        f"/api/v1/admin/products/{product_id}/video",
        headers=headers,
    )
    assert del_video_res.status_code == 200
    assert del_video_res.json()["video_url"] is None


@pytest.mark.asyncio
async def test_category_and_product_active_inactive_storefront_cascade(
    client: AsyncClient, db_session: AsyncSession
):
    """Verify active/inactive storefront cascading rules.

    1. If category is inactive, all products under it are hidden from storefront.
    2. If product is inactive, it is hidden from storefront.
    3. Activating category restores visibility for active published products.
    """
    headers = await get_admin_headers(client, db_session)

    # 1. Create active category
    cat_res = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Haute Joaillerie", "is_active": True},
    )
    assert cat_res.status_code == 201
    category_id = cat_res.json()["id"]

    # 2. Create published active product under that category
    prod_res = await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json={
            "title": "Imperial Emerald Choker",
            "category_id": category_id,
            "status": "published",
            "is_active": True,
        },
    )
    assert prod_res.status_code == 201
    product = prod_res.json()
    product_id = product["id"]
    slug = product["slug"]

    # 3. Verify visible in public storefront
    pub_list = await client.get("/api/v1/public/products")
    assert any(p["slug"] == slug for p in pub_list.json()["items"])

    pub_detail = await client.get(f"/api/v1/public/products/{slug}")
    assert pub_detail.status_code == 200
    assert pub_detail.json()["slug"] == slug

    # 4. Deactivate the product directly
    toggle_prod = await client.patch(
        f"/api/v1/admin/products/{product_id}/active",
        headers=headers,
        json={"is_active": False},
    )
    assert toggle_prod.status_code == 200
    assert toggle_prod.json()["is_active"] is False

    # Storefront must now HIDE the product
    pub_list_after_deact = await client.get("/api/v1/public/products")
    assert not any(p["slug"] == slug for p in pub_list_after_deact.json()["items"])

    pub_detail_after_deact = await client.get(f"/api/v1/public/products/{slug}")
    assert pub_detail_after_deact.status_code == 404

    # 5. Reactivate the product
    await client.patch(
        f"/api/v1/admin/products/{product_id}/active",
        headers=headers,
        json={"is_active": True},
    )

    # 6. Now deactivate the CATEGORY
    cat_deact = await client.patch(
        f"/api/v1/admin/categories/{category_id}",
        headers=headers,
        json={"is_active": False},
    )
    assert cat_deact.status_code == 200
    assert cat_deact.json()["is_active"] is False

    # Storefront must HIDE all products under the inactive category, even if product is active
    pub_list_inactive_cat = await client.get("/api/v1/public/products")
    assert not any(p["slug"] == slug for p in pub_list_inactive_cat.json()["items"])

    pub_detail_inactive_cat = await client.get(f"/api/v1/public/products/{slug}")
    assert pub_detail_inactive_cat.status_code == 404

    # 7. Reactivate category -> product immediately reappears on storefront!
    cat_react = await client.patch(
        f"/api/v1/admin/categories/{category_id}",
        headers=headers,
        json={"is_active": True},
    )
    assert cat_react.status_code == 200
    assert cat_react.json()["is_active"] is True

    pub_list_restored = await client.get("/api/v1/public/products")
    assert any(p["slug"] == slug for p in pub_list_restored.json()["items"])

    pub_detail_restored = await client.get(f"/api/v1/public/products/{slug}")
    assert pub_detail_restored.status_code == 200


@pytest.mark.asyncio
async def test_prevent_activating_or_publishing_product_under_inactive_category(
    client: AsyncClient, db_session: AsyncSession
):
    """Ensure cannot publish or activate a product if its assigned category is inactive."""
    headers = await get_admin_headers(client, db_session)

    # 1. Create inactive category
    cat_res = await client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name": "Archived Heritage", "is_active": False},
    )
    assert cat_res.status_code == 201
    category_id = cat_res.json()["id"]

    # 2. Attempt creating published product under inactive category (must be rejected)
    create_pub_res = await client.post(
        "/api/v1/admin/products",
        headers=headers,
        json={
            "title": "Ancient Relic Ring",
            "category_id": category_id,
            "status": "published",
        },
    )
    assert create_pub_res.status_code == 400
    assert "must be active" in create_pub_res.json()["error"]["message"]
