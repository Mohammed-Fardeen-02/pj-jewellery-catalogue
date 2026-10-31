import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.products.models import Product


class StockTransactionType(enum.StrEnum):
    STOCK_IN = "stock_in"
    STOCK_OUT = "stock_out"
    ADJUSTMENT = "adjustment"
    ORDER_SALE = "order_sale"


class StockTransaction(Base, TimestampMixin):
    """Audit ledger tracking inventory movements (stock in, stock out, sales, adjustments)."""

    __tablename__ = "stock_transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    transaction_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        index=True,
    )
    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    previous_stock: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    new_stock: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    reference_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )
    reason: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="stock_transactions",
    )

    def __repr__(self) -> str:
        return (
            f"<StockTransaction id={self.id} type={self.transaction_type} "
            f"qty={self.quantity} new_stock={self.new_stock}>"
        )
