import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class StockAdjustmentCreate(BaseModel):
    """Payload to adjust product inventory (stock in, stock out, manual adjustment)."""

    transaction_type: Literal["stock_in", "stock_out", "adjustment"] = Field(
        ..., description="Direction of stock movement"
    )
    quantity: int = Field(..., gt=0, description="Number of units to adjust (must be greater than 0)")
    reason: str = Field(..., min_length=2, max_length=255, description="Business rationale (e.g. Supplier Shipment, Breakage)")
    reference_id: str | None = Field(default=None, max_length=100, description="Optional reference (e.g. PO number, Return voucher)")
    notes: str | None = Field(default=None, description="Optional internal notes")


class StockTransactionResponse(BaseModel):
    """Ledger entry reflecting an inventory movement."""

    id: uuid.UUID
    product_id: uuid.UUID
    product_title: str | None = None
    product_sku: str | None = None
    transaction_type: str
    quantity: int
    previous_stock: int
    new_stock: int
    reference_id: str | None = None
    reason: str
    notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductStockStatusSummary(BaseModel):
    """Stock health status for an individual piece."""

    product_id: uuid.UUID
    title: str
    sku: str
    stock_quantity: int
    low_stock_threshold: int
    shortage: int = 0
    status: str  # "in_stock", "low_stock", "out_of_stock"
    primary_image_url: str | None = None
    category_name: str | None = None


class StockOverviewResponse(BaseModel):
    """High-level atelier inventory metrics."""

    total_inventory_units: int
    total_stock_units: int
    total_products_tracked: int
    total_products: int
    in_stock_count: int
    low_stock_count: int
    out_of_stock_count: int
    low_stock_items: list[ProductStockStatusSummary] = Field(default_factory=list)
