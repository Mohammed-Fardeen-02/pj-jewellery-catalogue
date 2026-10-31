import math
import uuid

from fastapi import UploadFile
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
from app.services.cloudinary_service import CloudinaryService, get_cloudinary_service
from app.utils.slug import generate_slug


class ProductService:
    """Service encapsulating product business rules, validation, and lifecycle management."""

    MAX_IMAGES_PER_PRODUCT = 5

    def __init__(
        self,
        db: AsyncSession,
        cloudinary_service: CloudinaryService | None = None,
    ) -> None:
        self.db = db
        self.repository = ProductRepository(db)
        self.category_repo = CategoryRepository(db)
        self.cloudinary = cloudinary_service or get_cloudinary_service()

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
                public_id=img.public_id,
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
            is_active=product.is_active,
            price=float(product.price or 0.0),
            compare_at_price=float(product.compare_at_price) if product.compare_at_price is not None else None,
            discount_percentage=float(product.discount_percentage) if product.discount_percentage is not None else None,
            stock_quantity=int(product.stock_quantity or 0),
            low_stock_threshold=int(product.low_stock_threshold if product.low_stock_threshold is not None else 5),
            video_url=product.video_url,
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
                public_id=img.public_id,
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
            sku=product.sku,
            description=product.description,
            category=category_summary,
            tags=product.tags or [],
            attributes=product.attributes or {},
            price=float(product.price or 0.0),
            compare_at_price=float(product.compare_at_price) if product.compare_at_price is not None else None,
            discount_percentage=float(product.discount_percentage) if product.discount_percentage is not None else None,
            stock_quantity=int(product.stock_quantity or 0),
            video_url=product.video_url,
            primary_image=primary_image,
            images=image_responses,
            created_at=product.created_at,
            status=product.status,
            is_published=product.is_published,
            is_active=product.is_active,
        )

    async def create_product(self, payload: ProductCreate) -> ProductResponse:
        """Create new jewellery product with SKU, slug, category, and lifecycle validation."""
        # 1. Enforce max 5 images limit
        if len(payload.images) > self.MAX_IMAGES_PER_PRODUCT:
            raise BadRequestException(
                f"A product can hold a maximum of {self.MAX_IMAGES_PER_PRODUCT} images."
            )

        # 2. Resolve and validate slug
        resolved_slug = payload.slug.strip() if payload.slug else generate_slug(payload.title)
        if not resolved_slug:
            resolved_slug = generate_slug(payload.title)

        if not resolved_slug:
            raise BadRequestException("A valid title or slug is required")

        existing_by_slug = await self.repository.get_by_slug(resolved_slug)
        if existing_by_slug:
            raise ConflictException(f"Product with slug '{resolved_slug}' already exists")

        # 3. Resolve and validate SKU
        resolved_sku = payload.sku.strip() if payload.sku else None
        if not resolved_sku:
            prefix = resolved_slug[:6].replace("-", "").upper()
            resolved_sku = f"PJ-{prefix}-{uuid.uuid4().hex[:4].upper()}"

        existing_by_sku = await self.repository.get_by_sku(resolved_sku)
        if existing_by_sku:
            raise ConflictException(f"Product with SKU '{resolved_sku}' already exists")

        # 4. Validate category association
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

        # 5. Clean tags and keywords
        cleaned_tags = list(dict.fromkeys(t.strip() for t in payload.tags if t.strip()))
        cleaned_keywords = list(dict.fromkeys(k.strip() for k in payload.keywords if k.strip()))

        # 6. Resolve pricing & discounts
        price = float(payload.price or 0.0)
        compare_at = float(payload.compare_at_price) if payload.compare_at_price is not None else None
        discount_pct = float(payload.discount_percentage) if payload.discount_percentage is not None else None
        if discount_pct is None and compare_at and compare_at > price and compare_at > 0:
            discount_pct = round(((compare_at - price) / compare_at) * 100, 2)

        # 7. Build entity
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
            is_active=payload.is_active,
            price=price,
            compare_at_price=compare_at,
            discount_percentage=discount_pct,
            stock_quantity=int(payload.stock_quantity or 0),
            low_stock_threshold=int(payload.low_stock_threshold if payload.low_stock_threshold is not None else 5),
            video_url=payload.video_url.strip() if payload.video_url else None,
        )

        # 8. Associate images (max 5)
        for idx, img_in in enumerate(payload.images):
            image = ProductImage(
                storage_path=img_in.image_url.strip(),
                public_id=img_in.public_id.strip() if img_in.public_id else None,
                alt_text=img_in.alt_text.strip() if img_in.alt_text else None,
                display_order=img_in.display_order if img_in.display_order is not None else idx,
                is_primary=img_in.is_primary,
            )
            product.images.append(image)

        created = await self.repository.create(product)
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

        # Update active flag
        if payload.is_active is not None:
            if payload.is_active and product.category_id:
                cat_tuple = await self.category_repo.get_by_id(product.category_id)
                if cat_tuple and not cat_tuple[0].is_active:
                    raise BadRequestException(
                        "Cannot activate product belonging to an inactive category. "
                        "Activate the category first."
                    )
            product.is_active = payload.is_active

        # Update lifecycle status
        if payload.status is not None:
            if payload.status == ProductStatus.PUBLISHED and product.category_id:
                cat_tuple = await self.category_repo.get_by_id(product.category_id)
                if cat_tuple and not cat_tuple[0].is_active:
                    raise BadRequestException(
                        "Cannot publish product belonging to an inactive category. "
                        "Activate the category first."
                    )
            product.status = payload.status
            product.is_published = payload.status == ProductStatus.PUBLISHED

        # Update video_url
        if payload.video_url is not None:
            product.video_url = payload.video_url.strip() if payload.video_url.strip() else None

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

        # Update pricing & discount
        if payload.price is not None:
            product.price = float(payload.price)
        if payload.compare_at_price is not None:
            product.compare_at_price = float(payload.compare_at_price)
        if payload.discount_percentage is not None:
            product.discount_percentage = float(payload.discount_percentage)
        elif product.compare_at_price and float(product.compare_at_price) > float(product.price) and float(product.compare_at_price) > 0:
            product.discount_percentage = round(((float(product.compare_at_price) - float(product.price)) / float(product.compare_at_price)) * 100, 2)

        # Update stock metrics
        if payload.stock_quantity is not None:
            product.stock_quantity = int(payload.stock_quantity)
        if payload.low_stock_threshold is not None:
            product.low_stock_threshold = int(payload.low_stock_threshold)

        # Update images if passed explicitly
        if payload.images is not None:
            if len(payload.images) > self.MAX_IMAGES_PER_PRODUCT:
                raise BadRequestException(
                    f"A product can hold a maximum of {self.MAX_IMAGES_PER_PRODUCT} images."
                )
            product.images.clear()
            for idx, img_in in enumerate(payload.images):
                image = ProductImage(
                    storage_path=img_in.image_url.strip(),
                    public_id=img_in.public_id.strip() if img_in.public_id else None,
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

    async def toggle_product_active(
        self, product_id: uuid.UUID, is_active: bool
    ) -> ProductResponse:
        """Explicitly toggle product active/inactive state."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        if is_active and product.category_id:
            cat_tuple = await self.category_repo.get_by_id(product.category_id)
            if cat_tuple and not cat_tuple[0].is_active:
                raise BadRequestException(
                    "Cannot activate product belonging to an inactive category. "
                    "Activate the category first."
                )

        product.is_active = is_active
        updated = await self.repository.update(product)
        full_product = await self.repository.get_by_id(updated.id)
        return self._serialize_product(full_product or updated)

    async def upload_product_image(
        self,
        product_id: uuid.UUID,
        file: UploadFile,
        is_primary: bool = False,
        alt_text: str | None = None,
    ) -> ProductResponse:
        """Upload an image to Cloudinary and attach to product (max 5 images enforced)."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        if len(product.images) >= self.MAX_IMAGES_PER_PRODUCT:
            raise BadRequestException(
                f"A product can hold a maximum of {self.MAX_IMAGES_PER_PRODUCT} images. "
                "Please delete an existing image before uploading a new one."
            )

        # Upload to Cloudinary
        upload_res = await self.cloudinary.upload_image(file)

        # If marking this image primary, clear other primary flags
        if is_primary:
            for img in product.images:
                img.is_primary = False
        elif len(product.images) == 0:
            is_primary = True

        new_image = ProductImage(
            product_id=product.id,
            storage_path=upload_res["url"],
            public_id=upload_res.get("public_id"),
            alt_text=alt_text.strip() if alt_text else None,
            display_order=len(product.images),
            is_primary=is_primary,
        )
        product.images.append(new_image)

        updated = await self.repository.update(product)
        full_product = await self.repository.get_by_id(updated.id)
        return self._serialize_product(full_product or updated)

    async def delete_product_image(
        self, product_id: uuid.UUID, image_id: uuid.UUID
    ) -> ProductResponse:
        """Remove a product image from the database and Cloudinary."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        target_img = next((img for img in product.images if img.id == image_id), None)
        if not target_img:
            raise NotFoundException(f"Image with ID '{image_id}' not found on this product")

        # Cleanup from Cloudinary
        if target_img.public_id:
            await self.cloudinary.delete_asset(target_img.public_id, resource_type="image")

        was_primary = target_img.is_primary
        product.images.remove(target_img)

        # Re-assign primary if necessary
        if was_primary and product.images:
            product.images[0].is_primary = True

        updated = await self.repository.update(product)
        full_product = await self.repository.get_by_id(updated.id)
        return self._serialize_product(full_product or updated)

    async def upload_product_video(
        self, product_id: uuid.UUID, file: UploadFile
    ) -> ProductResponse:
        """Upload product video to Cloudinary (maximum 1 video per product)."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        # Upload video to Cloudinary
        upload_res = await self.cloudinary.upload_video(file)
        product.video_url = upload_res["url"]

        updated = await self.repository.update(product)
        full_product = await self.repository.get_by_id(updated.id)
        return self._serialize_product(full_product or updated)

    async def delete_product_video(self, product_id: uuid.UUID) -> ProductResponse:
        """Remove product video."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        product.video_url = None
        updated = await self.repository.update(product)
        full_product = await self.repository.get_by_id(updated.id)
        return self._serialize_product(full_product or updated)

    async def delete_product(self, product_id: uuid.UUID) -> None:
        """Delete product and all associated images."""
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        # Cleanup Cloudinary images
        for img in product.images:
            if img.public_id:
                await self.cloudinary.delete_asset(img.public_id, resource_type="image")

        await self.repository.delete(product)

    async def list_admin_products(
        self,
        page: int = 1,
        limit: int = 20,
        search: str | None = None,
        category_id: uuid.UUID | None = None,
        status: ProductStatus | None = None,
        is_active: bool | None = None,
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
            is_active=is_active,
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
        """Retrieve public catalogue listing containing strictly published and active items."""
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
        """Retrieve public product by slug.

        Rejects draft, archived, inactive products, or products under inactive categories.
        """
        product = await self.repository.get_by_slug(slug.strip())
        if not product or product.status != ProductStatus.PUBLISHED or not product.is_active:
            raise NotFoundException(f"Product '{slug}' not found")

        # If product belongs to an inactive category, hide it from public storefront
        if product.category and not product.category.is_active:
            raise NotFoundException(f"Product '{slug}' not found")

        return self._serialize_public_product(product)
