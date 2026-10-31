import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.products.models import Product


class OrderStatus(enum.StrEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus(enum.StrEnum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class Order(Base, TimestampMixin):
    """Customer acquisition order placed via public storefront or admin manual creation."""

    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    order_number: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
    )
    customer_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    customer_email: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )
    customer_phone: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )
    shipping_address: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    subtotal: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    discount_amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        default=0.0,
        nullable=False,
    )
    total_amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    payment_method: Mapped[str] = mapped_column(
        String(64),
        default="simulated_card",
        nullable=False,
    )
    payment_status: Mapped[str] = mapped_column(
        String(64),
        default=PaymentStatus.PAID.value,
        nullable=False,
        index=True,
    )
    payment_reference: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(64),
        default=OrderStatus.CONFIRMED.value,
        nullable=False,
        index=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Order id={self.id} number={self.order_number} total={self.total_amount}>"


class OrderItem(Base, TimestampMixin):
    """Line item within an acquisition order."""

    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    product_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    product_sku: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    unit_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    total_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    image_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )

    # Relationships
    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="items",
    )
    product: Mapped["Product | None"] = relationship(
        "Product",
    )

    def __repr__(self) -> str:
        return f"<OrderItem id={self.id} sku={self.product_sku} qty={self.quantity}>"
