import math
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.modules.categories.repository import CategoryRepository
from app.modules.products.models import Product, ProductImage, ProductStatus
from app.modules.products.repository import ProductRepository
from app.modules.products.schemas import (
    ProductCategorySummary,
    ProductCreate,
    ProductImageResponse,
    ProductListResponse,
    ProductPublicListResponse,
    ProductPublicResponse,
    ProductResponse,
    ProductUpdate,
)
from app.utils.slug import generate_slug


class ProductService:
    """Service encapsulating product business rules, validation, and lifecycle management."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repository = ProductRepository(db)
        self.category_repo = CategoryRepository(db)

    def _serialize_product(self, product: Product) -> ProductResponse:
        """Convert Product ORM instance to ProductResponse schema."""
        category_summary = None
        if product.category:
            category_summary = ProductCategorySummary(
                id=product.category.id,
                name=product.category.name,
                slug=product.category.slug,
            )

        image_responses = [
            ProductImageResponse(
                id=img.id,
                image_url=img.storage_path,
                alt_text=img.alt_text,
                display_order=img.display_order,
                is_primary=img.is_primary,
            )
            for img in product.images
        ]

        primary_image = next((img for img in image_responses if img.is_primary), None)
        if not primary_image and image_responses:
            primary_image = image_responses[0]

        return ProductResponse(
            id=product.id,
            sku=product.sku,
            title=product.title,
            slug=product.slug,
            description=product.description,
            category_id=product.category_id,
            category=category_summary,
            tags=product.tags or [],
            keywords=product.keywords or [],
            attributes=product.attributes or {},
            status=product.status,
            is_published=product.is_published,
            primary_image=primary_image,
            images=image_responses,
            created_at=product.created_at,
            updated_at=product.updated_at,
        )

    def _serialize_public_product(self, product: Product) -> ProductPublicResponse:
        """Convert Product ORM instance to sanitized customer-facing public response."""
        category_summary = None
        if product.category:
            category_summary = ProductCategorySummary(
                id=product.category.id,
                name=product.category.name,
                slug=product.category.slug,
            )

        image_responses = [
            ProductImageResponse(
                id=img.id,
                image_url=img.storage_path,
                alt_text=img.alt_text,
                display_order=img.display_order,
                is_primary=img.is_primary,
            )
            for img in product.images
        ]

        primary_image = next((img for img in image_responses if img.is_primary), None)
        if not primary_image and image_responses:
            primary_image = image_responses[0]

        return ProductPublicResponse(
            id=product.id,
            title=product.title,
            slug=product.slug,
            description=product.description,
            category=category_summary,
            tags=product.tags or [],
            attributes=product.attributes or {},
            primary_image=primary_image,
            images=image_responses,
            created_at=product.created_at,
        )

    async def create_product(self, payload: ProductCreate) -> ProductResponse:
        """Create new jewellery product with SKU, slug, category, and lifecycle validation."""
        # 1. Resolve and validate slug
        resolved_slug = payload.slug.strip() if payload.slug else generate_slug(payload.title)
        if not resolved_slug:
            resolved_slug = generate_slug(payload.title)

        if not resolved_slug:
            raise BadRequestException("A valid title or slug is required")

        existing_by_slug = await self.repository.get_by_slug(resolved_slug)
        if existing_by_slug:
            raise ConflictException(f"Product with slug '{resolved_slug}' already exists")

        # 2. Resolve and validate SKU
        resolved_sku = payload.sku.strip() if payload.sku else None
        if not resolved_sku:
            prefix = resolved_slug[:6].replace("-", "").upper()
            resolved_sku = f"PJ-{prefix}-{uuid.uuid4().hex[:4].upper()}"

        existing_by_sku = await self.repository.get_by_sku(resolved_sku)
        if existing_by_sku:
            raise ConflictException(f"Product with SKU '{resolved_sku}' already exists")

        # 3. Validate category association
        if payload.category_id:
            cat_tuple = await self.category_repo.get_by_id(payload.category_id)
            if not cat_tuple:
                raise NotFoundException(
                    f"Referenced category '{payload.category_id}' does not exist"
                )
            category = cat_tuple[0]
            if not category.is_active:
                raise BadRequestException(
                    "Cannot assign product to an inactive category. The category must be active."
                )

        # 4. Clean tags and keywords
        cleaned_tags = list(dict.fromkeys(t.strip() for t in payload.tags if t.strip()))
        cleaned_keywords = list(dict.fromkeys(k.strip() for k in payload.keywords if k.strip()))

        # 5. Build entity
        is_published = payload.status == ProductStatus.PUBLISHED
        product = Product(
            sku=resolved_sku,
            title=payload.title.strip(),
            slug=resolved_slug,
            description=payload.description.strip() if payload.description else None,
            category_id=payload.category_id,
            tags=cleaned_tags,
            keywords=cleaned_keywords,
            attributes=payload.attributes or {},
            status=payload.status,
            is_published=is_published,
        )

        # 6. Associate images if provided
        for idx, img_in in enumerate(payload.images):
            image = ProductImage(
                storage_path=img_in.image_url.strip(),
                alt_text=img_in.alt_text.strip() if img_in.alt_text else None,
                display_order=img_in.display_order if img_in.display_order is not None else idx,
                is_primary=img_in.is_primary,
            )
            product.images.append(image)

        created = await self.repository.create(product)
        # Reload with relationships
        full_product = await self.repository.get_by_id(created.id)
        return self._serialize_product(full_product or created)

    async def get_product_by_id(self, product_id: uuid.UUID) -> ProductResponse:
        """Retrieve complete product details by UUID."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")
        return self._serialize_product(product)

    async def update_product(
        self, product_id: uuid.UUID, payload: ProductUpdate
    ) -> ProductResponse:
        """Update product attributes, enforcing category active status and uniqueness."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        # Update title
        if payload.title is not None and payload.title.strip():
            product.title = payload.title.strip()

        # Update slug
        if payload.slug is not None and payload.slug.strip() != product.slug:
            new_slug = generate_slug(payload.slug.strip())
            existing_slug = await self.repository.get_by_slug(new_slug)
            if existing_slug and existing_slug.id != product.id:
                raise ConflictException(f"Product with slug '{new_slug}' already exists")
            product.slug = new_slug

        # Update SKU
        if payload.sku is not None and payload.sku.strip() != product.sku:
            new_sku = payload.sku.strip()
            existing_sku = await self.repository.get_by_sku(new_sku)
            if existing_sku and existing_sku.id != product.id:
                raise ConflictException(f"Product with SKU '{new_sku}' already exists")
            product.sku = new_sku

        # Update Category
        if payload.category_id is not None:
            if payload.category_id != product.category_id:
                cat_tuple = await self.category_repo.get_by_id(payload.category_id)
                if not cat_tuple:
                    raise NotFoundException(
                        f"Referenced category '{payload.category_id}' does not exist"
                    )
                category = cat_tuple[0]
                if not category.is_active:
                    raise BadRequestException(
                        "Cannot reassign product to an inactive category. Category must be active."
                    )
                product.category_id = payload.category_id

        if payload.description is not None:
            product.description = (
                payload.description.strip() if payload.description.strip() else None
            )

        if payload.tags is not None:
            product.tags = list(dict.fromkeys(t.strip() for t in payload.tags if t.strip()))

        if payload.keywords is not None:
            product.keywords = list(dict.fromkeys(k.strip() for k in payload.keywords if k.strip()))

        if payload.attributes is not None:
            product.attributes = payload.attributes

        # Update images if passed explicitly
        if payload.images is not None:
            product.images.clear()
            for idx, img_in in enumerate(payload.images):
                image = ProductImage(
                    storage_path=img_in.image_url.strip(),
                    alt_text=img_in.alt_text.strip() if img_in.alt_text else None,
                    display_order=img_in.display_order if img_in.display_order is not None else idx,
                    is_primary=img_in.is_primary,
                )
                product.images.append(image)

        updated = await self.repository.update(product)
        full_product = await self.repository.get_by_id(updated.id)
        return self._serialize_product(full_product or updated)

    async def update_product_status(
        self, product_id: uuid.UUID, new_status: ProductStatus
    ) -> ProductResponse:
        """Transition product lifecycle state between draft, published, and archived."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        # If transitioning to published, ensure category is active if assigned
        if new_status == ProductStatus.PUBLISHED and product.category_id:
            cat_tuple = await self.category_repo.get_by_id(product.category_id)
            if cat_tuple and not cat_tuple[0].is_active:
                raise BadRequestException(
                    "Cannot publish product belonging to an inactive category. "
                    "Activate the category first."
                )

        product.status = new_status
        product.is_published = new_status == ProductStatus.PUBLISHED

        updated = await self.repository.update(product)
        full_product = await self.repository.get_by_id(updated.id)
        return self._serialize_product(full_product or updated)

    async def delete_product(self, product_id: uuid.UUID) -> None:
        """Delete product and all associated images."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")
        await self.repository.delete(product)

    async def list_admin_products(
        self,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        category_id: uuid.UUID | None = None,
        status: ProductStatus | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> ProductListResponse:
        """List products with administrative filters, search, and status distribution."""
        page = max(1, page)
        limit = min(max(1, limit), 100)

        items, total, status_counts = await self.repository.list_admin(
            page=page,
            limit=limit,
            search=search,
            category_id=category_id,
            status=status,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        pages = math.ceil(total / limit) if limit > 0 else 0
        return ProductListResponse(
            items=[self._serialize_product(p) for p in items],
            total=total,
            page=page,
            limit=limit,
            pages=pages,
            status_counts=status_counts,
        )

    async def list_public_products(
        self,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        category_slug: str | None = None,
        category_id: uuid.UUID | None = None,
        tag: str | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> ProductPublicListResponse:
        """Retrieve public catalogue listing containing strictly published items."""
        page = max(1, page)
        limit = min(max(1, limit), 100)

        items, total = await self.repository.list_public(
            page=page,
            limit=limit,
            search=search,
            category_slug=category_slug,
            category_id=category_id,
            tag=tag,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        pages = math.ceil(total / limit) if limit > 0 else 0
        return ProductPublicListResponse(
            items=[self._serialize_public_product(p) for p in items],
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )

    async def get_public_product_by_slug(self, slug: str) -> ProductPublicResponse:
        """Retrieve public product by slug. Rejects draft, archived, or inactive categories."""
        product = await self.repository.get_by_slug(slug.strip())
        if not product or product.status != ProductStatus.PUBLISHED:
            raise NotFoundException(f"Product '{slug}' not found")

        # If product belongs to an inactive category, hide it from public storefront
        if product.category and not product.category.is_active:
            raise NotFoundException(f"Product '{slug}' not found")

        return self._serialize_public_product(product)
