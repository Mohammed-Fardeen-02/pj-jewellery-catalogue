import uuid
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.categories.models import Category
from app.modules.products.models import Product


class CategoryRepository:
    """Repository handling database operations for Category entity."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, category_id: uuid.UUID) -> tuple[Category, int] | None:
        """Fetch category by UUID along with total associated product count."""
        stmt = (
            select(Category, func.count(Product.id).label("product_count"))
            .outerjoin(Product, Product.category_id == Category.id)
            .where(Category.id == category_id)
            .group_by(Category.id)
        )
        result = await self.db.execute(stmt)
        row = result.first()
        if not row:
            return None
        category, count = row[0], row[1]
        return category, int(count)

    async def get_by_slug(self, slug: str) -> tuple[Category, int] | None:
        """Fetch category by unique slug along with total product count."""
        stmt = (
            select(Category, func.count(Product.id).label("product_count"))
            .outerjoin(Product, Product.category_id == Category.id)
            .where(Category.slug == slug)
            .group_by(Category.id)
        )
        result = await self.db.execute(stmt)
        row = result.first()
        if not row:
            return None
        return row[0], int(row[1])

    async def get_by_name(self, name: str) -> Category | None:
        """Fetch category by exact name (case-insensitive check)."""
        stmt = select(Category).where(func.lower(Category.name) == name.strip().lower())
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def count_products_in_category(self, category_id: uuid.UUID) -> int:
        """Count all products referencing this category."""
        stmt = select(func.count(Product.id)).where(Product.category_id == category_id)
        result = await self.db.execute(stmt)
        return int(result.scalar_one_or_none() or 0)

    async def list_admin(
        self,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[list[tuple[Category, int]], int]:
        """List categories with filters, pagination, and product counts for administrators."""
        # Base filter conditions
        conditions = []
        if search and search.strip():
            query_term = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(Category.name).like(query_term),
                    func.lower(Category.slug).like(query_term),
                )
            )
        if is_active is not None:
            conditions.append(Category.is_active == is_active)

        # 1. Total matching count
        count_stmt = select(func.count(Category.id))
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one_or_none() or 0)

        # 2. Query items with product count aggregation
        query = (
            select(Category, func.count(Product.id).label("product_count"))
            .outerjoin(Product, Product.category_id == Category.id)
            .group_by(Category.id)
        )
        if conditions:
            query = query.where(*conditions)

        # Sorting
        sort_column: Any = Category.created_at
        if sort_by == "name":
            sort_column = Category.name
        elif sort_by == "updated_at":
            sort_column = Category.updated_at
        elif sort_by == "created_at":
            sort_column = Category.created_at

        if sort_order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        items = [(row[0], int(row[1])) for row in result.all()]
        return items, total

    async def list_public(
        self,
        search: str | None = None,
        sort_by: str = "name",
        sort_order: str = "asc",
    ) -> list[tuple[Category, int]]:
        """List active categories for public storefront with published product count."""
        conditions = [Category.is_active == True]  # noqa: E712
        if search and search.strip():
            query_term = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(Category.name).like(query_term),
                    func.lower(Category.slug).like(query_term),
                )
            )

        # Filter product count only to published and active items
        published_product_subq = (
            select(Product.category_id, func.count(Product.id).label("published_count"))
            .where(
                Product.status == "published",
                Product.is_active == True,  # noqa: E712
            )
            .group_by(Product.category_id)
            .subquery()
        )

        query = (
            select(
                Category,
                func.coalesce(published_product_subq.c.published_count, 0).label("product_count"),
            )
            .outerjoin(
                published_product_subq,
                Category.id == published_product_subq.c.category_id,
            )
            .where(*conditions)
        )

        sort_column: Any = Category.name
        if sort_by == "created_at":
            sort_column = Category.created_at
        elif sort_by == "name":
            sort_column = Category.name

        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        result = await self.db.execute(query)
        return [(row[0], int(row[1])) for row in result.all()]

    async def create(self, category: Category) -> Category:
        """Persist new category entity."""
        self.db.add(category)
        await self.db.flush()
        await self.db.refresh(category)
        return category

    async def update(self, category: Category) -> Category:
        """Update and refresh existing category entity."""
        await self.db.flush()
        await self.db.refresh(category)
        return category

    async def delete(self, category: Category) -> None:
        """Remove category entity."""
        await self.db.delete(category)
        await self.db.flush()
