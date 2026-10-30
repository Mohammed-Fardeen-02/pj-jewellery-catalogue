from fastapi import APIRouter, status

from app.core.exceptions import AppException

router = APIRouter()


@router.get(
    "",
    summary="List Categories (Unimplemented Placeholder)",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
async def list_categories():
    """Placeholder for Category listing. Implementation scheduled for Catalogue Domain Milestone."""
    raise AppException(
        message="Category endpoints are reserved for the Catalogue Domain Milestone.",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        code="NOT_IMPLEMENTED",
    )


@router.post(
    "",
    summary="Create Category (Unimplemented Placeholder)",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
async def create_category():
    """Placeholder for Category creation scheduled for Catalogue Domain Milestone."""
    raise AppException(
        message="Category endpoints are reserved for the Catalogue Domain Milestone.",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        code="NOT_IMPLEMENTED",
    )
