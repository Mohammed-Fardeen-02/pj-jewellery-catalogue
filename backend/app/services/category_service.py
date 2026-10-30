"""Category business service.

Phase 1 Foundation:
Provides the architectural structure for category management. Full CRUD logic,
slug collision checks, and media association will be implemented in the
Catalogue Domain Milestone.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.repositories.category_repository import CategoryRepository


class CategoryService:
    """Service handling product category lifecycle and business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.category_repo = CategoryRepository(session)

    async def get_category(self, slug: str):
        """Fetch category by slug."""
        return await self.category_repo.get_by_slug(slug)

    async def list_active_categories(self, offset: int = 0, limit: int = 20):
        """List active categories for storefront navigation."""
        return await self.category_repo.list_categories(
            offset=offset, limit=limit, only_active=True
        )

    async def create_category(self, *args, **kwargs):
        """Create category placeholder for upcoming catalogue milestone."""
        raise AppException(
            message="Category creation endpoint is reserved for the Catalogue Domain Milestone.",
            status_code=501,
            code="NOT_IMPLEMENTED",
        )
