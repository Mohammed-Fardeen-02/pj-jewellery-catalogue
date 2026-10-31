from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_active_admin
from app.models.user import User
from app.modules.ai.dependencies import get_ai_vision_service
from app.modules.ai.schemas import AiSuggestRequest, AiSuggestResponse
from app.modules.ai.service import AiVisionService

admin_router = APIRouter()


@admin_router.post(
    "/suggest-product",
    response_model=AiSuggestResponse,
    status_code=status.HTTP_200_OK,
    summary="AI Vision Product Suggestions",
    description=(
        "Analyzes a jewellery product image using NVIDIA Llama Vision AI "
        "and extracts suggested title, description, category, style, and attributes. "
        "Strictly excludes pricing, purity, and weights for manual artisan entry."
    ),
)
async def suggest_product(
    payload: AiSuggestRequest,
    service: AiVisionService = Depends(get_ai_vision_service),
    current_user: User = Depends(get_current_active_admin),
) -> AiSuggestResponse:
    """Analyze jewellery image and return structured product suggestions."""
    return await service.suggest_product_details(
        image_url=payload.image_url,
        category_hint=payload.category_hint,
    )
