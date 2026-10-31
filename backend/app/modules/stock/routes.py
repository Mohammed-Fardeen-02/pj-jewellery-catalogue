import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_active_admin
from app.dependencies.database import get_db
from app.models.user import User
from app.modules.stock.schemas import (
    StockAdjustmentCreate,
    StockOverviewResponse,
    StockTransactionResponse,
)
from app.modules.stock.service import StockService

router = APIRouter()


@router.post(
    "/products/{product_id}/stock/adjust",
    response_model=StockTransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Adjust product stock level (Stock In / Stock Out / Audit)",
)
async def adjust_product_stock(
    product_id: uuid.UUID,
    payload: StockAdjustmentCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_admin),
) -> StockTransactionResponse:
    """Execute a stock in, stock out, or balance adjustment on a product with audit logging."""
    service = StockService(db)
    result = await service.adjust_stock(product_id, payload)
    await db.commit()
    return result


@router.get(
    "/products/{product_id}/stock/history",
    response_model=list[StockTransactionResponse],
    summary="Get product stock audit trail",
)
async def get_product_stock_history(
    product_id: uuid.UUID,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_admin),
) -> list[StockTransactionResponse]:
    """Retrieve chronologically ordered inventory ledger events for a piece."""
    service = StockService(db)
    return await service.get_product_stock_history(product_id, limit=limit)


@router.get(
    "/stock/overview",
    response_model=StockOverviewResponse,
    summary="Get overall stock health and low-inventory alerts",
)
async def get_stock_overview(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_admin),
) -> StockOverviewResponse:
    """Retrieve catalogue-wide inventory metrics including low and out-of-stock items."""
    service = StockService(db)
    return await service.get_overview()
