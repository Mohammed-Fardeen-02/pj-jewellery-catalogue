from fastapi import APIRouter, status

from app.core.exceptions import AppException

router = APIRouter()


@router.get(
    "",
    summary="Brand Metadata (Single-Brand Context)",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
async def get_brand_info():
    """Architectural Note:

    PJ is designed as a single-brand catalogue. Multi-brand entities are intentionally
    omitted from this stage to avoid premature domain complexity. A product-level brand
    entity will be evaluated in subsequent milestones if required.
    """
    raise AppException(
        message=(
            "PJ is a single-brand jewellery catalogue. "
            "Brand entity endpoints are not active in the foundation."
        ),
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        code="NOT_IMPLEMENTED",
    )
