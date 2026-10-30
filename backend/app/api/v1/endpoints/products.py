from fastapi import APIRouter, status

from app.core.exceptions import AppException

router = APIRouter()


@router.get(
    "",
    summary="List Products (Unimplemented Placeholder)",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
async def list_products():
    """Placeholder for Product catalogue listing scheduled for Catalogue Domain Milestone."""
    raise AppException(
        message="Product catalogue endpoints are reserved for the Catalogue Domain Milestone.",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        code="NOT_IMPLEMENTED",
    )


@router.post(
    "",
    summary="Create Product (Unimplemented Placeholder)",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
async def create_product():
    """Placeholder for Product creation. Implementation scheduled for Catalogue Domain Milestone."""
    raise AppException(
        message="Product catalogue endpoints are reserved for the Catalogue Domain Milestone.",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        code="NOT_IMPLEMENTED",
    )
