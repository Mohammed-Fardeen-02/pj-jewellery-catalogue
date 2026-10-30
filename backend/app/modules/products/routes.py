import uuid

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status

from app.dependencies.auth import get_current_active_admin
from app.models.user import User
from app.modules.products.dependencies import get_product_service
from app.modules.products.models import ProductStatus
from app.modules.products.schemas import (
    ProductActiveUpdate,
    ProductCreate,
    ProductListResponse,
    ProductPublicListResponse,
    ProductPublicResponse,
    ProductResponse,
    ProductStatusUpdate,
    ProductUpdate,
)
from app.modules.products.service import ProductService

admin_router = APIRouter()
public_router = APIRouter()


# -------------------------------------------------------------------------
# Admin Endpoints (Require Active Admin Authentication)
# -------------------------------------------------------------------------


@admin_router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Product",
    description="Registers a new jewellery product with SKU, slug, attributes, and media.",
)
async def create_product(
    payload: ProductCreate,
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Create a new jewellery catalogue product."""
    return await service.create_product(payload)


@admin_router.get(
    "",
    response_model=ProductListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Admin Products",
    description=(
        "Lists products with search, category filtering, active status, "
        "lifecycle status filtering, and count breakdown."
    ),
)
async def list_admin_products(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    search: str | None = Query(
        default=None, description="Search across title, slug, SKU, tags, or keywords"
    ),
    category_id: uuid.UUID | None = Query(default=None, description="Filter by category UUID"),
    status: ProductStatus | None = Query(
        default=None, description="Filter by status (draft, published, archived)"
    ),
    is_active: bool | None = Query(default=None, description="Filter by active status"),
    sort_by: str = Query(
        default="created_at",
        pattern="^(title|created_at|updated_at)$",
        description="Sort column",
    ),
    sort_order: str = Query(
        default="desc", pattern="^(asc|desc)$", description="Sort direction"
    ),
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductListResponse:
    """Retrieve filtered and paginated product list with status distribution."""
    return await service.list_admin_products(
        page=page,
        limit=limit,
        search=search,
        category_id=category_id,
        status=status,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@admin_router.get(
    "/{id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Product Details",
    description=(
        "Fetches full product details including attributes, category, video, and gallery images."
    ),
)
async def get_product(
    id: uuid.UUID,
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Fetch complete product specification by UUID."""
    return await service.get_product_by_id(id)


@admin_router.patch(
    "/{id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Product",
    description="Partially updates product properties, attributes, and category association.",
)
async def update_product(
    id: uuid.UUID,
    payload: ProductUpdate,
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Update product properties."""
    return await service.update_product(id, payload)


@admin_router.patch(
    "/{id}/status",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Change Product Status",
    description="Transitions lifecycle status between draft, published, and archived.",
)
async def update_product_status(
    id: uuid.UUID,
    payload: ProductStatusUpdate,
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Update lifecycle status of a product."""
    return await service.update_product_status(id, payload.status)


@admin_router.patch(
    "/{id}/active",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle Product Active Status",
    description="Activates or deactivates a product. Inactive products are hidden from storefront.",
)
async def toggle_product_active(
    id: uuid.UUID,
    payload: ProductActiveUpdate,
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Activate or deactivate a product."""
    return await service.toggle_product_active(id, payload.is_active)


@admin_router.post(
    "/{id}/images",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Product Image to Cloudinary",
    description=(
        "Uploads a product image directly to Cloudinary and adds it to the product gallery. "
        "Strictly enforces a maximum of 5 images per product."
    ),
)
async def upload_product_image(
    id: uuid.UUID,
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WebP, AVIF; max 10MB)"),
    is_primary: bool = Form(default=False, description="Whether this is the primary hero image"),
    alt_text: str | None = Form(default=None, description="Image accessibility alt text"),
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Upload product image to Cloudinary (up to 5 images max)."""
    return await service.upload_product_image(
        product_id=id,
        file=file,
        is_primary=is_primary,
        alt_text=alt_text,
    )


@admin_router.delete(
    "/{id}/images/{image_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Product Image",
    description="Removes a product image from the gallery and cleans up storage in Cloudinary.",
)
async def delete_product_image(
    id: uuid.UUID,
    image_id: uuid.UUID,
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Delete a product image by image UUID."""
    return await service.delete_product_image(product_id=id, image_id=image_id)


@admin_router.post(
    "/{id}/video",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload Product Video to Cloudinary",
    description=(
        "Uploads a product video directly to Cloudinary (MP4, WebM, MOV; max 100MB). "
        "Each product can hold 1 video; uploading replaces any existing video."
    ),
)
async def upload_product_video(
    id: uuid.UUID,
    file: UploadFile = File(..., description="Video file (MP4, WebM, MOV; max 100MB)"),
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Upload product video to Cloudinary."""
    return await service.upload_product_video(product_id=id, file=file)


@admin_router.delete(
    "/{id}/video",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Product Video",
    description="Removes video from the product specification.",
)
async def delete_product_video(
    id: uuid.UUID,
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> ProductResponse:
    """Delete product video."""
    return await service.delete_product_video(product_id=id)


@admin_router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Product",
    description="Removes product and cascade-deletes its associated media from Cloudinary.",
)
async def delete_product(
    id: uuid.UUID,
    service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_active_admin),
) -> None:
    """Delete product by UUID."""
    await service.delete_product(id)


# -------------------------------------------------------------------------
# Public Storefront Endpoints (Unauthenticated, Published & Active Only)
# -------------------------------------------------------------------------


@public_router.get(
    "",
    response_model=ProductPublicListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Published Products",
    description="Returns published products for public storefront with category and tag filtering.",
)
async def list_public_products(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    search: str | None = Query(
        default=None, description="Search term in title, description, or tags"
    ),
    category_slug: str | None = Query(
        default=None, description="Filter by active category slug"
    ),
    category_id: uuid.UUID | None = Query(
        default=None, description="Filter by active category UUID"
    ),
    tag: str | None = Query(default=None, description="Filter by tag keyword"),
    sort_by: str = Query(
        default="created_at", pattern="^(title|created_at)$", description="Sort field"
    ),
    sort_order: str = Query(
        default="desc", pattern="^(asc|desc)$", description="Sort direction"
    ),
    service: ProductService = Depends(get_product_service),
) -> ProductPublicListResponse:
    """Retrieve public product catalogue items."""
    return await service.list_public_products(
        page=page,
        limit=limit,
        search=search,
        category_slug=category_slug,
        category_id=category_id,
        tag=tag,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@public_router.get(
    "/{slug}",
    response_model=ProductPublicResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Published Product Details",
    description="Returns public product metadata, attributes, video, and gallery images by slug.",
)
async def get_public_product(
    slug: str,
    service: ProductService = Depends(get_product_service),
) -> ProductPublicResponse:
    """Retrieve single published product by slug."""
    return await service.get_public_product_by_slug(slug)
