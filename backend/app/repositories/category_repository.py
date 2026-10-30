import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category


class CategoryRepository:
    """Repository for Category entity persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, category_id: uuid.UUID) -> Category | None:
        query = select(Category).where(Category.id == category_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Category | None:
        query = select(Category).where(Category.slug == slug)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_categories(
        self,
        offset: int = 0,
        limit: int = 20,
        only_active: bool = True,
    ) -> tuple[list[Category], int]:
        count_query = select(func.count(Category.id))
        items_query = select(Category)

        if only_active:
            count_query = count_query.where(Category.is_active.is_(True))
            items_query = items_query.where(Category.is_active.is_(True))

        items_query = items_query.order_by(Category.name.asc()).offset(offset).limit(limit)

        total = (await self.session.execute(count_query)).scalar_one() or 0
        items = list((await self.session.execute(items_query)).scalars().all())
        return items, total

    async def create(self, category: Category) -> Category:
        self.session.add(category)
        await self.session.flush()
        await self.session.refresh(category)
        return category
