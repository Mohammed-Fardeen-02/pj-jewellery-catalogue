import math
from typing import TypeVar

from app.schemas.common import PaginatedResponse

T = TypeVar("T")


def build_paginated_response[T](
    items: list[T],
    total: int,
    page: int,
    limit: int,
) -> PaginatedResponse[T]:
    """Calculate pagination metrics and return a structured PaginatedResponse envelope."""
    total_pages = math.ceil(total / limit) if limit > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )
