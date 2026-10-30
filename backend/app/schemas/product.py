import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ProductImageResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    storage_path: str
    alt_text: str | None = None
    is_primary: bool
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    sku: str = Field(min_length=2, max_length=64, description="Unique stock keeping unit")
    title: str = Field(min_length=2, max_length=255, description="Product title")
    slug: str | None = Field(
        default=None, max_length=260, description="URL slug (auto-generated if omitted)"
    )
    description: str | None = Field(default=None, description="Detailed product description")
    category_id: uuid.UUID | None = Field(default=None, description="Associated category ID")
    tags: list[str] = Field(default_factory=list, description="Search and filter tags")
    attributes: dict[str, Any] = Field(
        default_factory=dict,
        description="Flexible jewellery specifications (e.g. metal, carat, purity, stone, size)",
    )
    is_published: bool = Field(default=False, description="Whether product is live on storefront")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: str | None = Field(default=None, min_length=2, max_length=64)
    title: str | None = Field(default=None, min_length=2, max_length=255)
    slug: str | None = Field(default=None, max_length=260)
    description: str | None = None
    category_id: uuid.UUID | None = None
    tags: list[str] | None = None
    attributes: dict[str, Any] | None = None
    is_published: bool | None = None


class ProductResponse(ProductBase):
    id: uuid.UUID
    slug: str
    images: list[ProductImageResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
