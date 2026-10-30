import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.modules.products.models import ProductStatus


class JewelleryAttributes(BaseModel):
    """Structured jewellery-specific attributes (optional & extensible)."""

    metal_type: str | None = Field(default=None, description="e.g. 18K Yellow Gold, Platinum")
    purity: str | None = Field(default=None, description="e.g. 750, 950")
    gross_weight: float | None = Field(default=None, description="Gross item weight in grams")
    net_weight: float | None = Field(default=None, description="Net metal weight in grams")
    gemstone_type: str | None = Field(default=None, description="e.g. Natural Diamond, Emerald")
    stone_weight: float | None = Field(default=None, description="Total gemstone carat weight")
    occasion: str | None = Field(default=None, description="e.g. Bridal, Anniversary, Gala")
    collection: str | None = Field(default=None, description="e.g. Aura, Celestial, Heritage")
    design_style: str | None = Field(default=None, description="e.g. Solitaire, Pavé, Art Deco")

    model_config = ConfigDict(extra="allow")


class ProductImageCreate(BaseModel):
    """Product image creation schema."""

    image_url: str = Field(..., description="External storage URL or relative asset path")
    public_id: str | None = Field(default=None, max_length=255, description="Cloudinary public ID")
    alt_text: str | None = Field(default=None, max_length=255, description="Accessibility alt text")
    display_order: int = Field(default=0, ge=0, description="Display ordering index")
    is_primary: bool = Field(default=False, description="Whether this is the primary hero image")


class ProductImageResponse(BaseModel):
    """Product image response representation."""

    id: uuid.UUID
    image_url: str
    public_id: str | None = None
    alt_text: str | None = None
    display_order: int = 0
    is_primary: bool = False

    model_config = ConfigDict(from_attributes=True)


class ProductMediaUploadResponse(BaseModel):
    """Result of uploading a media file (image or video) to Cloudinary."""

    url: str
    public_id: str | None = None
    resource_type: str = "image"
    message: str = "Media uploaded successfully"


class ProductCategorySummary(BaseModel):
    """Concise category representation embedded in product responses."""

    id: uuid.UUID
    name: str
    slug: str

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    """Product creation payload."""

    title: str = Field(..., min_length=1, max_length=255, description="Product title (mandatory)")
    sku: str | None = Field(
        default=None,
        max_length=64,
        description="Unique SKU. Auto-generated if not supplied.",
    )
    slug: str | None = Field(
        default=None,
        max_length=260,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="URL slug. Auto-generated from title if not supplied.",
    )
    description: str | None = Field(default=None, description="Editorial piece description")
    category_id: uuid.UUID | None = Field(
        default=None, description="Foreign key to active category"
    )
    tags: list[str] = Field(default_factory=list, description="Categorization tags")
    keywords: list[str] = Field(default_factory=list, description="Search optimization keywords")
    attributes: dict[str, Any] = Field(
        default_factory=dict, description="Jewellery attributes dictionary"
    )
    status: ProductStatus = Field(
        default=ProductStatus.DRAFT, description="Initial lifecycle status"
    )
    is_active: bool = Field(default=True, description="Active status for catalogue display")
    video_url: str | None = Field(
        default=None, max_length=512, description="Cloudinary video URL (max 1 video)"
    )
    images: list[ProductImageCreate] = Field(
        default_factory=list,
        max_length=5,
        description="Associated image references (maximum 5 images allowed)",
    )


class ProductUpdate(BaseModel):
    """Product partial modification payload."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    sku: str | None = Field(default=None, max_length=64)
    slug: str | None = Field(default=None, max_length=260, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None
    category_id: uuid.UUID | None = None
    tags: list[str] | None = None
    keywords: list[str] | None = None
    attributes: dict[str, Any] | None = None
    is_active: bool | None = None
    video_url: str | None = Field(default=None, max_length=512)
    images: list[ProductImageCreate] | None = Field(default=None, max_length=5)


class ProductStatusUpdate(BaseModel):
    """Explicit product status transition payload."""

    status: ProductStatus = Field(..., description="Target status: draft, published, or archived")


class ProductActiveUpdate(BaseModel):
    """Explicit product active/inactive toggle payload."""

    is_active: bool = Field(..., description="True to activate, False to deactivate")


class ProductStatusCounts(BaseModel):
    """Aggregate product breakdown across lifecycle statuses."""

    draft: int = 0
    published: int = 0
    archived: int = 0
    total: int = 0


class ProductResponse(BaseModel):
    """Comprehensive admin product representation."""

    id: uuid.UUID
    sku: str
    title: str
    slug: str
    description: str | None = None
    category_id: uuid.UUID | None = None
    category: ProductCategorySummary | None = None
    tags: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    attributes: dict[str, Any] = Field(default_factory=dict)
    status: ProductStatus
    is_published: bool
    is_active: bool
    video_url: str | None = None
    primary_image: ProductImageResponse | None = None
    images: list[ProductImageResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    """Admin product listing response envelope with status counts."""

    items: list[ProductResponse]
    total: int
    page: int
    limit: int
    pages: int
    status_counts: ProductStatusCounts


class ProductPublicResponse(BaseModel):
    """Customer-facing published product response."""

    id: uuid.UUID
    title: str
    slug: str
    description: str | None = None
    category: ProductCategorySummary | None = None
    tags: list[str] = Field(default_factory=list)
    attributes: dict[str, Any] = Field(default_factory=dict)
    video_url: str | None = None
    primary_image: ProductImageResponse | None = None
    images: list[ProductImageResponse] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductPublicListResponse(BaseModel):
    """Customer-facing published products list envelope."""

    items: list[ProductPublicResponse]
    total: int
    page: int
    limit: int
    pages: int

