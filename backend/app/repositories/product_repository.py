import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product


class ProductRepository:
    """Repository for Product entity persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, product_id: uuid.UUID) -> Product | None:
        query = (
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.id == product_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_sku(self, sku: str) -> Product | None:
        query = select(Product).where(Product.sku == sku.strip())
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Product | None:
        query = (
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.slug == slug.strip())
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_products(
        self,
        offset: int = 0,
        limit: int = 20,
        category_id: uuid.UUID | None = None,
        only_published: bool = True,
    ) -> tuple[list[Product], int]:
        count_query = select(func.count(Product.id))
        items_query = select(Product).options(selectinload(Product.images))

        if only_published:
            count_query = count_query.where(Product.is_published.is_(True))
            items_query = items_query.where(Product.is_published.is_(True))

        if category_id:
            count_query = count_query.where(Product.category_id == category_id)
            items_query = items_query.where(Product.category_id == category_id)

        items_query = items_query.order_by(Product.created_at.desc()).offset(offset).limit(limit)

        total = (await self.session.execute(count_query)).scalar_one() or 0
        items = list((await self.session.execute(items_query)).scalars().all())
        return items, total

    async def create(self, product: Product) -> Product:
        self.session.add(product)
        await self.session.flush()
        await self.session.refresh(product)
        return product
