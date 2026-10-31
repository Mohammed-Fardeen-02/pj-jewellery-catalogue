import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrderItemCreate(BaseModel):
    """Specification of a line item to acquire."""

    product_id: uuid.UUID = Field(..., description="ID of published jewellery piece")
    quantity: int = Field(default=1, gt=0, description="Quantity desired (must be at least 1)")


class OrderCreatePublic(BaseModel):
    """Public customer checkout payload."""

    customer_name: str = Field(..., min_length=2, max_length=255, description="Customer full name")
    customer_email: EmailStr = Field(..., description="Customer contact email")
    customer_phone: str | None = Field(default=None, max_length=64, description="Customer contact telephone")
    shipping_address: str = Field(..., min_length=5, description="Full delivery address")
    payment_method: str = Field(default="simulated_card", description="Payment channel: simulated_card, wire, upi")
    notes: str | None = Field(default=None, description="Bespoke engraving or delivery notes")
    items: list[OrderItemCreate] = Field(..., min_length=1, description="List of items in order")


class OrderItemResponse(BaseModel):
    """Line item serialization."""

    id: uuid.UUID
    product_id: uuid.UUID | None = None
    product_title: str
    product_sku: str
    unit_price: float
    quantity: int
    total_price: float
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    """Complete order response."""

    id: uuid.UUID
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str | None = None
    shipping_address: str
    subtotal: float
    discount_amount: float
    total_amount: float
    payment_method: str
    payment_status: str
    payment_reference: str | None = None
    status: str
    notes: str | None = None
    items: list[OrderItemResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    """Admin orders listing envelope."""

    items: list[OrderResponse]
    total: int
    page: int
    limit: int
    pages: int
