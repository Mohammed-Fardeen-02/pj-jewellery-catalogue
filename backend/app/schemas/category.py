import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(
        min_length=2, max_length=150, description="Category name (e.g. Rings, Necklaces)"
    )
    slug: str | None = Field(
        default=None, max_length=160, description="URL-friendly slug (auto-generated if omitted)"
    )
    description: str | None = Field(default=None, description="Category description")
    is_active: bool = Field(default=True, description="Active status in catalogue")


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    slug: str | None = Field(default=None, max_length=160)
    description: str | None = None
    is_active: bool | None = None


class CategoryResponse(CategoryBase):
    id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
