import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User


async def get_admin_headers(client: AsyncClient, db_session: AsyncSession) -> dict[str, str]:
    admin = User(
        email=f"admin_{uuid.uuid4().hex[:6]}@pjjewellery.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Stock Admin",
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
async def test_pricing_stock_order_and_analytics_flow(
    client: AsyncClient,
    db_session: AsyncSession,
):
    admin_auth_headers = await get_admin_headers(client, db_session)
    async_client = client
    # 1. Create Category
    cat_payload = {
        "name": f"Diamond Solitaires {uuid.uuid4().hex[:4]}",
        "description": "Exclusive diamonds",
        "is_active": True,
    }
    cat_res = await async_client.post(
        "/api/v1/admin/categories",
        json=cat_payload,
        headers=admin_auth_headers,
    )
    assert cat_res.status_code == 201
    category_id = cat_res.json()["id"]

    # 2. Create Product with Price, Compare-At-Price, and Stock
    prod_payload = {
        "title": "Empress Brilliant Ring",
        "category_id": category_id,
        "price": 12500.00,
        "compare_at_price": 15000.00,
        "stock_quantity": 10,
        "low_stock_threshold": 3,
        "status": "published",
        "is_active": True,
    }
    prod_res = await async_client.post(
        "/api/v1/admin/products",
        json=prod_payload,
        headers=admin_auth_headers,
    )
    assert prod_res.status_code == 201
    prod_data = prod_res.json()
    product_id = prod_data["id"]
    assert prod_data["price"] == 12500.00
    assert prod_data["compare_at_price"] == 15000.00
    assert prod_data["discount_percentage"] == round(((15000 - 12500) / 15000) * 100, 2)
    assert prod_data["stock_quantity"] == 10

    # 3. Test Stock In Adjustment
    stock_in_payload = {
        "transaction_type": "stock_in",
        "quantity": 5,
        "reason": "Supplier Delivery Batch #A102",
        "notes": "Added from master vault",
    }
    stock_in_res = await async_client.post(
        f"/api/v1/admin/products/{product_id}/stock/adjust",
        json=stock_in_payload,
        headers=admin_auth_headers,
    )
    assert stock_in_res.status_code == 201
    assert stock_in_res.json()["previous_stock"] == 10
    assert stock_in_res.json()["new_stock"] == 15

    # 4. Test Stock Out Adjustment
    stock_out_payload = {
        "transaction_type": "stock_out",
        "quantity": 2,
        "reason": "Exhibition Display Loan",
    }
    stock_out_res = await async_client.post(
        f"/api/v1/admin/products/{product_id}/stock/adjust",
        json=stock_out_payload,
        headers=admin_auth_headers,
    )
    assert stock_out_res.status_code == 201
    assert stock_out_res.json()["previous_stock"] == 15
    assert stock_out_res.json()["new_stock"] == 13

    # 5. Test Stock Audit History
    history_res = await async_client.get(
        f"/api/v1/admin/products/{product_id}/stock/history",
        headers=admin_auth_headers,
    )
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) == 2

    # 6. Test Public Storefront Viewing
    pub_res = await async_client.get("/api/v1/public/products")
    assert pub_res.status_code == 200
    pub_items = pub_res.json()["items"]
    target_item = next((i for i in pub_items if i["id"] == product_id), None)
    assert target_item is not None
    assert target_item["price"] == 12500.00
    assert target_item["compare_at_price"] == 15000.00
    assert target_item["stock_quantity"] == 13

    # 7. Test Public Customer Order & Auto Stock Deduction
    order_payload = {
        "customer_name": "Duchess Sophia",
        "customer_email": "sophia@royal.example",
        "customer_phone": "+1 555 0192",
        "shipping_address": "450 Belgravia Square, London, UK",
        "payment_method": "simulated_card",
        "notes": "Complimentary velvet presentation box",
        "items": [
            {
                "product_id": product_id,
                "quantity": 3,
            }
        ],
    }
    order_res = await async_client.post(
        "/api/v1/public/orders",
        json=order_payload,
    )
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["customer_name"] == "Duchess Sophia"
    assert order_data["total_amount"] == 12500.00 * 3
    assert order_data["payment_status"] == "paid"
    assert len(order_data["items"]) == 1

    # Verify inventory was automatically decremented from 13 to 10
    updated_prod_res = await async_client.get(
        f"/api/v1/admin/products/{product_id}",
        headers=admin_auth_headers,
    )
    assert updated_prod_res.status_code == 200
    assert updated_prod_res.json()["stock_quantity"] == 10

    # 8. Test Admin Orders Listing
    admin_orders_res = await async_client.get(
        "/api/v1/admin/orders",
        headers=admin_auth_headers,
    )
    assert admin_orders_res.status_code == 200
    assert admin_orders_res.json()["total"] >= 1

    # 9. Test Dashboard Analytics with Date Range Filter
    analytics_res = await async_client.get(
        "/api/v1/admin/analytics/dashboard?range=today",
        headers=admin_auth_headers,
    )
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    assert analytics["catalogue"]["total_products"] >= 1
    assert analytics["catalogue"]["published_products"] >= 1
    assert analytics["commerce"]["total_orders"] >= 1
    assert analytics["commerce"]["total_revenue"] >= 12500.00 * 3
    assert len(analytics["recent_orders"]) >= 1
    assert len(analytics["recent_stock_transactions"]) >= 1
