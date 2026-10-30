from typing import Any, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Query parameters for paginated endpoints."""

    page: int = Field(default=1, ge=1, description="Page number starting from 1")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page (max 100)")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginatedResponse[T](BaseModel):
    """Standard generic wrapper for paginated collections."""

    items: list[T]
    total: int = Field(ge=0, description="Total matching items")
    page: int = Field(ge=1, description="Current page number")
    limit: int = Field(ge=1, description="Items requested per page")
    total_pages: int = Field(ge=0, description="Total number of pages")

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str


class ErrorDetail(BaseModel):
    """Detailed error item."""

    field: str | None = None
    issue: str


class ErrorPayload(BaseModel):
    """Inner error payload."""

    code: str
    message: str
    details: list[ErrorDetail | dict[str, Any]] = Field(default_factory=list)


class StandardErrorResponse(BaseModel):
    """Standardized error envelope for API responses."""

    error: ErrorPayload
    request_id: str | None = None
