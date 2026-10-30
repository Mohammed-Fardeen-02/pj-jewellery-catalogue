import uuid
from typing import Any

from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.categories.models import Category
from app.modules.products.models import Product, ProductStatus
from app.modules.products.schemas import ProductStatusCounts


class ProductRepository:
    """Repository handling database operations for Product and ProductImage entities."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, product_id: uuid.UUID) -> Product | None:
        """Fetch product by ID with preloaded category and images."""
        stmt = (
            select(Product)
            .options(
                selectinload(Product.category),
                selectinload(Product.images),
            )
            .where(Product.id == product_id)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_slug(self, slug: str) -> Product | None:
        """Fetch product by slug with preloaded category and images."""
        stmt = (
            select(Product)
            .options(
                selectinload(Product.category),
                selectinload(Product.images),
            )
            .where(Product.slug == slug)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_sku(self, sku: str) -> Product | None:
        """Fetch product by unique SKU."""
        stmt = select(Product).where(Product.sku == sku.strip())
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def list_admin(
        self,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        category_id: uuid.UUID | None = None,
        status: ProductStatus | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[list[Product], int, ProductStatusCounts]:
        """List products for administrators with filtering, searching, and status metrics."""
        conditions = []

        if category_id:
            conditions.append(Product.category_id == category_id)

        if status:
            conditions.append(Product.status == status)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(Product.title).like(term),
                    func.lower(Product.slug).like(term),
                    func.lower(Product.sku).like(term),
                    func.lower(cast(Product.tags, String)).like(term),
                    func.lower(cast(Product.keywords, String)).like(term),
                )
            )

        # 1. Total matching count
        count_stmt = select(func.count(Product.id))
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total_res = await self.db.execute(count_stmt)
        total = int(total_res.scalar_one_or_none() or 0)

        # 2. Status counts breakdown
        status_stmt = select(Product.status, func.count(Product.id)).group_by(Product.status)
        status_res = await self.db.execute(status_stmt)
        status_dict = {row[0]: int(row[1]) for row in status_res.all()}

        status_counts = ProductStatusCounts(
            draft=status_dict.get(ProductStatus.DRAFT, 0),
            published=status_dict.get(ProductStatus.PUBLISHED, 0),
            archived=status_dict.get(ProductStatus.ARCHIVED, 0),
            total=sum(status_dict.values()),
        )

        # 3. Paginated items query
        query = (
            select(Product)
            .options(
                selectinload(Product.category),
                selectinload(Product.images),
            )
        )
        if conditions:
            query = query.where(*conditions)

        # Sorting
        sort_col: Any = Product.created_at
        if sort_by == "title":
            sort_col = Product.title
        elif sort_by == "updated_at":
            sort_col = Product.updated_at
        elif sort_by == "created_at":
            sort_col = Product.created_at

        if sort_order.lower() == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        return items, total, status_counts

    async def list_public(
        self,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        category_slug: str | None = None,
        category_id: uuid.UUID | None = None,
        tag: str | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[list[Product], int]:
        """List products for public storefront, restricted to published items."""
        conditions = [Product.status == ProductStatus.PUBLISHED]

        # Join category to filter by active status or category slug
        query = (
            select(Product)
            .join(Category, Product.category_id == Category.id, isouter=True)
            .options(
                selectinload(Product.category),
                selectinload(Product.images),
            )
        )

        # Ensure category is active if assigned
        conditions.append(or_(Product.category_id.is_(None), Category.is_active == True))  # noqa: E712

        if category_id:
            conditions.append(Product.category_id == category_id)

        if category_slug:
            conditions.append(Category.slug == category_slug.strip())

        if tag and tag.strip():
            tag_term = f'%"{tag.strip()}"%'
            conditions.append(cast(Product.tags, String).ilike(tag_term))

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(Product.title).like(term),
                    func.lower(Product.description).like(term),
                    func.lower(cast(Product.tags, String)).like(term),
                    func.lower(cast(Product.keywords, String)).like(term),
                )
            )

        # Count total
        count_stmt = (
            select(func.count(Product.id))
            .join(Category, Product.category_id == Category.id, isouter=True)
        )
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total_res = await self.db.execute(count_stmt)
        total = int(total_res.scalar_one_or_none() or 0)

        # Apply conditions and sorting
        query = query.where(*conditions)

        sort_col: Any = Product.created_at
        if sort_by == "title":
            sort_col = Product.title
        elif sort_by == "created_at":
            sort_col = Product.created_at

        if sort_order.lower() == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        return items, total

    async def create(self, product: Product) -> Product:
        """Persist new product entity."""
        self.db.add(product)
        await self.db.flush()
        await self.db.refresh(product)
        return product

    async def update(self, product: Product) -> Product:
        """Update and refresh existing product entity."""
        await self.db.flush()
        await self.db.refresh(product)
        return product

    async def delete(self, product: Product) -> None:
        """Delete product entity (cascades images)."""
        await self.db.delete(product)
        await self.db.flush()
