import enum
import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, Boolean, Enum, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.categories.models import Category


class ProductStatus(enum.StrEnum):
    """Lifecycle status for jewellery catalogue items."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Product(Base, TimestampMixin):
    """Jewellery product entity."""

    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    sku: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(260),
        unique=True,
        index=True,
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    tags: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    keywords: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    attributes: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )
    status: Mapped[ProductStatus] = mapped_column(
        Enum(
            ProductStatus,
            name="product_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=ProductStatus.DRAFT,
        nullable=False,
        index=True,
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )
    video_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )

    # Relationships
    category: Mapped["Category | None"] = relationship(
        "Category",
        back_populates="products",
    )
    images: Mapped[list["ProductImage"]] = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ProductImage.display_order",
    )

    def __repr__(self) -> str:
        return (
            f"<Product id={self.id} sku={self.sku} slug={self.slug} "
            f"status={self.status.value} is_active={self.is_active}>"
        )


class ProductImage(Base, TimestampMixin):
    """Product image entity referencing external object storage (e.g. Cloudinary)."""

    __tablename__ = "product_images"

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
    storage_path: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )
    public_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    alt_text: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    display_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # Relationships
    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="images",
    )

    @property
    def image_url(self) -> str:
        """Alias returning the external image storage path/URL."""
        return self.storage_path

    def __repr__(self) -> str:
        return f"<ProductImage id={self.id} path={self.storage_path} primary={self.is_primary}>"
