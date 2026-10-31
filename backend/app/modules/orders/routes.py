import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_active_admin
from app.dependencies.database import get_db
from app.models.user import User
from app.modules.orders.schemas import (
    OrderCreatePublic,
    OrderListResponse,
    OrderResponse,
)
from app.modules.orders.service import OrderService

public_router = APIRouter()
admin_router = APIRouter()


# -------------------------------------------------------------------------
# Public Storefront Checkout Endpoint
# -------------------------------------------------------------------------
@public_router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit storefront customer order & simulated payment",
)
async def submit_storefront_order(
    payload: OrderCreatePublic,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    """Acquire pieces from storefront with automated inventory deduction."""
    service = OrderService(db)
    order = await service.create_storefront_order(payload)
    await db.commit()
    return order


# -------------------------------------------------------------------------
# Admin Order Management Endpoints
# -------------------------------------------------------------------------
@admin_router.get(
    "",
    response_model=OrderListResponse,
    summary="List customer orders with status filtering",
)
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_admin),
) -> OrderListResponse:
    """Retrieve paginated customer orders for atelier fulfillment."""
    service = OrderService(db)
    return await service.list_orders(page=page, limit=limit, status=status, search=search)


@admin_router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get order details by UUID",
)
async def get_order_detail(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_admin),
) -> OrderResponse:
    """Retrieve full customer order and line items."""
    service = OrderService(db)
    return await service.get_order_by_id(order_id)
