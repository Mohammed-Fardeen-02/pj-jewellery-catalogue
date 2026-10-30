import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    """Shared category properties."""

    name: str = Field(..., min_length=1, max_length=150, description="Category display name")
    description: str | None = Field(default=None, description="Optional category description")
    is_active: bool = Field(default=True, description="Whether category is active")


class CategoryCreate(BaseModel):
    """Category creation schema."""

    name: str = Field(..., min_length=1, max_length=150, description="Category name (mandatory)")
    slug: str | None = Field(
        default=None,
        max_length=160,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="Optional URL-friendly slug. Auto-generated from name if omitted.",
    )
    description: str | None = Field(default=None, description="Optional category description")
    is_active: bool = Field(default=True, description="Whether category is active")


class CategoryUpdate(BaseModel):
    """Category update schema for partial modifications."""

    name: str | None = Field(default=None, min_length=1, max_length=150)
    slug: str | None = Field(default=None, max_length=160, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = None
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    """Category response model with product counts."""

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    is_active: bool
    product_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryPublicResponse(BaseModel):
    """Sanitized public category response."""

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    product_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class CategoryListResponse(BaseModel):
    """Paginated category list response envelope."""

    items: list[CategoryResponse]
    total: int
    page: int
    limit: int
    pages: int
