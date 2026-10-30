"""Product business service.

Phase 1 Foundation:
Provides the architectural structure for jewellery product management.
Full catalogue queries, AI search integration, and media handling will be
implemented in the Catalogue Domain Milestone.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.repositories.product_repository import ProductRepository


class ProductService:
    """Service handling jewellery product lifecycle, pricing, and attributes."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.product_repo = ProductRepository(session)

    async def get_product_by_slug(self, slug: str):
        """Fetch published product by slug."""
        return await self.product_repo.get_by_slug(slug)

    async def list_storefront_products(self, offset: int = 0, limit: int = 20):
        """List published products for the public storefront."""
        return await self.product_repo.list_products(
            offset=offset, limit=limit, only_published=True
        )

    async def create_product(self, *args, **kwargs):
        """Create product placeholder for upcoming catalogue milestone."""
        raise AppException(
            message="Product creation endpoint is reserved for the Catalogue Domain Milestone.",
            status_code=501,
            code="NOT_IMPLEMENTED",
        )
