import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.products.models import Product
from app.modules.stock.models import StockTransaction
from app.modules.stock.schemas import (
    ProductStockStatusSummary,
    StockAdjustmentCreate,
    StockOverviewResponse,
    StockTransactionResponse,
)


class StockService:
    """Service governing stock movements (Stock In, Stock Out, Inventory Audits)."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def adjust_stock(
        self, product_id: uuid.UUID, payload: StockAdjustmentCreate
    ) -> StockTransactionResponse:
        """Execute a stock in, stock out, or balance adjustment on a product."""
        stmt = (
            select(Product)
            .options(selectinload(Product.images))
            .where(Product.id == product_id)
        )
        result = await self.db.execute(stmt)
        product = result.scalars().first()
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        previous_stock = int(product.stock_quantity or 0)
        adj_type = payload.transaction_type

        if adj_type == "stock_in":
            new_stock = previous_stock + payload.quantity
        elif adj_type == "stock_out":
            if previous_stock < payload.quantity:
                raise BadRequestException(
                    f"Insufficient inventory: cannot stock out {payload.quantity} units. "
                    f"Current inventory is {previous_stock}."
                )
            new_stock = previous_stock - payload.quantity
        elif adj_type == "adjustment":
            new_stock = payload.quantity
        else:
            raise BadRequestException(f"Invalid transaction type: {adj_type}")

        product.stock_quantity = new_stock

        tx = StockTransaction(
            product_id=product.id,
            transaction_type=adj_type,
            quantity=payload.quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reference_id=payload.reference_id.strip() if payload.reference_id else None,
            reason=payload.reason.strip(),
            notes=payload.notes.strip() if payload.notes else None,
        )
        self.db.add(tx)
        await self.db.flush()
        await self.db.refresh(tx)

        return StockTransactionResponse(
            id=tx.id,
            product_id=tx.product_id,
            product_title=product.title,
            product_sku=product.sku,
            transaction_type=tx.transaction_type,
            quantity=tx.quantity,
            previous_stock=tx.previous_stock,
            new_stock=tx.new_stock,
            reference_id=tx.reference_id,
            reason=tx.reason,
            notes=tx.notes,
            created_at=tx.created_at,
        )

    async def get_product_stock_history(
        self, product_id: uuid.UUID, limit: int = 50
    ) -> list[StockTransactionResponse]:
        """Fetch chronological audit trail of stock adjustments for a piece."""
        product_stmt = select(Product).where(Product.id == product_id)
        prod_res = await self.db.execute(product_stmt)
        product = prod_res.scalars().first()
        if not product:
            raise NotFoundException(f"Product with ID '{product_id}' not found")

        stmt = (
            select(StockTransaction)
            .where(StockTransaction.product_id == product_id)
            .order_by(StockTransaction.created_at.desc())
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        txs = res.scalars().all()

        return [
            StockTransactionResponse(
                id=tx.id,
                product_id=tx.product_id,
                product_title=product.title,
                product_sku=product.sku,
                transaction_type=tx.transaction_type,
                quantity=tx.quantity,
                previous_stock=tx.previous_stock,
                new_stock=tx.new_stock,
                reference_id=tx.reference_id,
                reason=tx.reason,
                notes=tx.notes,
                created_at=tx.created_at,
            )
            for tx in txs
        ]

    async def get_overview(self) -> StockOverviewResponse:
        """Calculate inventory health metrics across all jewellery pieces."""
        # Query all products with images and category
        stmt = (
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .order_by(Product.stock_quantity.asc())
        )
        res = await self.db.execute(stmt)
        products = list(res.scalars().all())

        total_units = sum(int(p.stock_quantity or 0) for p in products)
        out_of_stock = [p for p in products if (p.stock_quantity or 0) <= 0]
        low_stock = [
            p
            for p in products
            if 0 < (p.stock_quantity or 0) <= (p.low_stock_threshold or 5)
        ]
        in_stock = [
            p
            for p in products
            if (p.stock_quantity or 0) > (p.low_stock_threshold or 5)
        ]

        low_stock_summaries: list[ProductStockStatusSummary] = []
        for p in out_of_stock + low_stock:
            primary_img = next((img.storage_path for img in p.images if img.is_primary), None)
            if not primary_img and p.images:
                primary_img = p.images[0].storage_path

            status_str = "out_of_stock" if (p.stock_quantity or 0) <= 0 else "low_stock"
            threshold_val = int(p.low_stock_threshold or 5)
            curr_stock_val = int(p.stock_quantity or 0)
            shortage_val = max(0, threshold_val - curr_stock_val)

            low_stock_summaries.append(
                ProductStockStatusSummary(
                    product_id=p.id,
                    title=p.title,
                    sku=p.sku,
                    stock_quantity=curr_stock_val,
                    low_stock_threshold=threshold_val,
                    shortage=shortage_val,
                    status=status_str,
                    primary_image_url=primary_img,
                    category_name=p.category.name if p.category else None,
                )
            )

        return StockOverviewResponse(
            total_inventory_units=total_units,
            total_stock_units=total_units,
            total_products_tracked=len(products),
            total_products=len(products),
            in_stock_count=len(in_stock),
            low_stock_count=len(low_stock),
            out_of_stock_count=len(out_of_stock),
            low_stock_items=low_stock_summaries[:50],
        )
