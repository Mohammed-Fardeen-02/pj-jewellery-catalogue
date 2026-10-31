from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_active_admin
from app.dependencies.database import get_db
from app.models.user import User
from app.modules.analytics.schemas import DashboardAnalyticsResponse
from app.modules.analytics.service import AnalyticsService

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=DashboardAnalyticsResponse,
    summary="Get unified dashboard metrics with date range filtering",
)
async def get_dashboard_analytics(
    range: str = Query("30d", description="Predefined time frame: today, 7d, 30d, ytd, all"),
    start_date: date | None = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: date | None = Query(None, description="Custom end date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_admin),
) -> DashboardAnalyticsResponse:
    """Calculates live analytics across catalogue, inventory, orders, and revenue."""
    service = AnalyticsService(db)
    return await service.get_dashboard_analytics(
        date_range=range,
        start_date=start_date,
        end_date=end_date,
    )
