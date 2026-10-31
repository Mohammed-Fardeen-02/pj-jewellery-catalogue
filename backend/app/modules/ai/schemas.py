from pydantic import BaseModel, Field


class AiSuggestRequest(BaseModel):
    """Payload to request AI suggestions for a jewellery image."""

    image_url: str = Field(..., description="Public image URL or Cloudinary URL to analyze")
    category_hint: str | None = Field(default=None, description="Optional hint for category")


class AiSuggestResponse(BaseModel):
    """Structured AI suggestions returned by the NVIDIA Vision Model.

    Excludes price, purity, and weights per business requirements.
    """

    title: str = Field(..., description="Suggested luxury product title")
    description: str = Field(..., description="Editorial jewellery description")
    category_name: str = Field(..., description="Suggested category name (e.g., Rings, Necklaces)")
    category_slug: str = Field(..., description="Suggested category slug (e.g., rings, necklaces)")
    design_style: str = Field(..., description="Design style (e.g., Solitaire, Art Deco, Halo)")
    gemstone_type: str = Field(..., description="Primary gemstone identification")
    metal_type: str = Field(..., description="Identified precious metal type")
    collection: str = Field(..., description="Suggested atelier collection")
    tags: list[str] = Field(default_factory=list, description="Categorization tags")
    keywords: list[str] = Field(default_factory=list, description="SEO keywords")
    confidence_summary: str = Field(..., description="Brief gemological visual analysis summary")
