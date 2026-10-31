import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.modules.orders.schemas import OrderResponse
from app.modules.stock.schemas import ProductStockStatusSummary, StockTransactionResponse


class DailyStat(BaseModel):
    date: str
    orders_count: int
    revenue: float


class CatalogueOverviewMetrics(BaseModel):
    total_products: int
    published_products: int
    draft_products: int
    archived_products: int
    active_products: int
    inactive_products: int
    total_categories: int
    active_categories: int


class InventoryMetrics(BaseModel):
    total_stock_units: int
    low_stock_count: int
    out_of_stock_count: int


class CommerceMetrics(BaseModel):
    date_range: str
    start_date: str
    end_date: str
    total_orders: int
    total_revenue: float
    average_order_value: float


class DashboardAnalyticsResponse(BaseModel):
    catalogue: CatalogueOverviewMetrics
    inventory: InventoryMetrics
    commerce: CommerceMetrics
    daily_trends: list[DailyStat] = Field(default_factory=list)
    recent_orders: list[OrderResponse] = Field(default_factory=list)
    recent_stock_transactions: list[StockTransactionResponse] = Field(default_factory=list)
    low_stock_alerts: list[ProductStockStatusSummary] = Field(default_factory=list)
