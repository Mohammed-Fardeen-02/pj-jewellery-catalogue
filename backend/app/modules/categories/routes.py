import uuid

from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_active_admin
from app.models.user import User
from app.modules.categories.dependencies import get_category_service
from app.modules.categories.schemas import (
    CategoryCreate,
    CategoryListResponse,
    CategoryPublicResponse,
    CategoryResponse,
    CategoryUpdate,
)
from app.modules.categories.service import CategoryService

admin_router = APIRouter()
public_router = APIRouter()


# -------------------------------------------------------------------------
# Admin Endpoints (Require Active Admin Authentication)
# -------------------------------------------------------------------------


@admin_router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Category",
    description="Registers a new jewellery category with unique name and slug.",
)
async def create_category(
    payload: CategoryCreate,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_active_admin),
) -> CategoryResponse:
    """Create a new jewellery category."""
    return await service.create_category(payload)


@admin_router.get(
    "",
    response_model=CategoryListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Admin Categories",
    description=(
        "Lists all categories with pagination, search, status filtering, and product count."
    ),
)
async def list_admin_categories(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    search: str | None = Query(default=None, description="Search by name or slug"),
    is_active: bool | None = Query(default=None, description="Filter by active status"),
    sort_by: str = Query(
        default="created_at",
        pattern="^(name|created_at|updated_at)$",
        description="Sort field",
    ),
    sort_order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
        description="Sort direction",
    ),
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_active_admin),
) -> CategoryListResponse:
    """Retrieve paginated category list for administrators."""
    return await service.list_admin_categories(
        page=page,
        limit=limit,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@admin_router.get(
    "/{id}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Category Details",
    description="Fetches full category details including current associated product count.",
)
async def get_category(
    id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_active_admin),
) -> CategoryResponse:
    """Fetch category details by UUID."""
    return await service.get_category_by_id(id)


@admin_router.patch(
    "/{id}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Category",
    description="Partially updates category properties with uniqueness checks.",
)
async def update_category(
    id: uuid.UUID,
    payload: CategoryUpdate,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_active_admin),
) -> CategoryResponse:
    """Update category properties."""
    return await service.update_category(id, payload)


@admin_router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Category",
    description="Deletes category if no products are associated with it.",
)
async def delete_category(
    id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_active_admin),
) -> None:
    """Delete category by UUID."""
    await service.delete_category(id)


# -------------------------------------------------------------------------
# Public Storefront Endpoints (Unauthenticated, Active Only)
# -------------------------------------------------------------------------


@public_router.get(
    "",
    response_model=list[CategoryPublicResponse],
    status_code=status.HTTP_200_OK,
    summary="List Public Categories",
    description="Returns all active categories for the public customer storefront.",
)
async def list_public_categories(
    search: str | None = Query(default=None, description="Search active categories by name"),
    sort_by: str = Query(
        default="name", pattern="^(name|created_at)$", description="Sort field"
    ),
    sort_order: str = Query(
        default="asc", pattern="^(asc|desc)$", description="Sort direction"
    ),
    service: CategoryService = Depends(get_category_service),
) -> list[CategoryPublicResponse]:
    """Retrieve active categories for public storefront."""
    return await service.list_public_categories(
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@public_router.get(
    "/{slug}",
    response_model=CategoryPublicResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Public Category Details",
    description="Returns public category metadata and published product count by slug.",
)
async def get_public_category(
    slug: str,
    service: CategoryService = Depends(get_category_service),
) -> CategoryPublicResponse:
    """Retrieve single active category by slug."""
    return await service.get_public_category_by_slug(slug)
