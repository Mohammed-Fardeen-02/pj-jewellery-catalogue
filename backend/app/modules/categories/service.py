import math
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.modules.categories.models import Category
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import (
    CategoryCreate,
    CategoryListResponse,
    CategoryPublicResponse,
    CategoryResponse,
    CategoryUpdate,
)
from app.utils.slug import generate_slug


class CategoryService:
    """Service encapsulating business rules and lifecycle logic for Categories."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repository = CategoryRepository(db)

    async def create_category(self, payload: CategoryCreate) -> CategoryResponse:
        """Create new category enforcing unique name, auto/manual slug, and validation."""
        # 1. Normalize and resolve slug
        raw_slug = payload.slug.strip() if payload.slug else generate_slug(payload.name)
        if not raw_slug:
            raw_slug = generate_slug(payload.name)

        if not raw_slug:
            raise BadRequestException("A valid category name or slug is required")

        # 2. Enforce name uniqueness
        existing_by_name = await self.repository.get_by_name(payload.name)
        if existing_by_name:
            raise ConflictException(f"Category with name '{payload.name}' already exists")

        # 3. Enforce slug uniqueness
        existing_by_slug = await self.repository.get_by_slug(raw_slug)
        if existing_by_slug:
            raise ConflictException(f"Category with slug '{raw_slug}' already exists")

        category = Category(
            name=payload.name.strip(),
            slug=raw_slug,
            description=payload.description.strip() if payload.description else None,
            is_active=payload.is_active,
        )
        created = await self.repository.create(category)
        return CategoryResponse(
            id=created.id,
            name=created.name,
            slug=created.slug,
            description=created.description,
            is_active=created.is_active,
            product_count=0,
            created_at=created.created_at,
            updated_at=created.updated_at,
        )

    async def get_category_by_id(self, category_id: uuid.UUID) -> CategoryResponse:
        """Retrieve category details with associated product count."""
        result = await self.repository.get_by_id(category_id)
        if not result:
            raise NotFoundException(f"Category with ID '{category_id}' not found")

        category, count = result
        return CategoryResponse(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            is_active=category.is_active,
            product_count=count,
            created_at=category.created_at,
            updated_at=category.updated_at,
        )

    async def update_category(
        self, category_id: uuid.UUID, payload: CategoryUpdate
    ) -> CategoryResponse:
        """Update category fields, enforcing slug/name uniqueness on modifications."""
        result = await self.repository.get_by_id(category_id)
        if not result:
            raise NotFoundException(f"Category with ID '{category_id}' not found")

        category, count = result

        # Validate name change
        if payload.name is not None and payload.name.strip() != category.name:
            new_name = payload.name.strip()
            existing_by_name = await self.repository.get_by_name(new_name)
            if existing_by_name and existing_by_name.id != category.id:
                raise ConflictException(f"Category with name '{new_name}' already exists")
            category.name = new_name

        # Validate slug change
        if payload.slug is not None and payload.slug.strip() != category.slug:
            new_slug = generate_slug(payload.slug.strip())
            existing_by_slug = await self.repository.get_by_slug(new_slug)
            if existing_by_slug and existing_by_slug[0].id != category.id:
                raise ConflictException(f"Category with slug '{new_slug}' already exists")
            category.slug = new_slug

        if payload.description is not None:
            category.description = (
                payload.description.strip() if payload.description.strip() else None
            )

        if payload.is_active is not None:
            category.is_active = payload.is_active

        updated = await self.repository.update(category)
        return CategoryResponse(
            id=updated.id,
            name=updated.name,
            slug=updated.slug,
            description=updated.description,
            is_active=updated.is_active,
            product_count=count,
            created_at=updated.created_at,
            updated_at=updated.updated_at,
        )

    async def delete_category(self, category_id: uuid.UUID) -> None:
        """Delete category, strictly preventing deletion if associated products exist."""
        result = await self.repository.get_by_id(category_id)
        if not result:
            raise NotFoundException(f"Category with ID '{category_id}' not found")

        category, product_count = result
        if product_count > 0:
            err_msg = (
                f"Cannot delete category '{category.name}' because {product_count} "
                "product(s) are associated with it. Please reassign or delete the products first."
            )
            raise BadRequestException(
                message=err_msg,
                details=[{"field": "category_id", "issue": "Category has dependent products"}],
            )

        await self.repository.delete(category)

    async def list_admin_categories(
        self,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> CategoryListResponse:
        """List categories for admin portal with pagination, search, filters, and product count."""
        page = max(1, page)
        limit = min(max(1, limit), 100)

        items_with_counts, total = await self.repository.list_admin(
            page=page,
            limit=limit,
            search=search,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        categories_response = [
            CategoryResponse(
                id=c.id,
                name=c.name,
                slug=c.slug,
                description=c.description,
                is_active=c.is_active,
                product_count=count,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c, count in items_with_counts
        ]

        pages = math.ceil(total / limit) if limit > 0 else 0
        return CategoryListResponse(
            items=categories_response,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )

    async def list_public_categories(
        self,
        search: str | None = None,
        sort_by: str = "name",
        sort_order: str = "asc",
    ) -> list[CategoryPublicResponse]:
        """List active categories for public storefront."""
        items_with_counts = await self.repository.list_public(
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return [
            CategoryPublicResponse(
                id=c.id,
                name=c.name,
                slug=c.slug,
                description=c.description,
                product_count=count,
            )
            for c, count in items_with_counts
        ]

    async def get_public_category_by_slug(self, slug: str) -> CategoryPublicResponse:
        """Fetch active category details by slug for public storefront."""
        result = await self.repository.get_by_slug(slug.strip())
        if not result:
            raise NotFoundException(f"Category '{slug}' not found")

        category, count = result
        if not category.is_active:
            raise NotFoundException(f"Category '{slug}' is currently inactive")

        return CategoryPublicResponse(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            product_count=count,
        )
