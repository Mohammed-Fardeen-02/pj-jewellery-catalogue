import math
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.orders.models import Order, OrderItem, OrderStatus, PaymentStatus
from app.modules.orders.schemas import (
    OrderCreatePublic,
    OrderItemResponse,
    OrderListResponse,
    OrderResponse,
)
from app.modules.products.models import Product, ProductStatus
from app.modules.stock.models import StockTransaction


class OrderService:
    """Service governing customer orders, payments, and automated stock deductions."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _serialize_order(self, order: Order) -> OrderResponse:
        """Serialize Order ORM instance to OrderResponse schema."""
        return OrderResponse(
            id=order.id,
            order_number=order.order_number,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_phone=order.customer_phone,
            shipping_address=order.shipping_address,
            subtotal=float(order.subtotal),
            discount_amount=float(order.discount_amount),
            total_amount=float(order.total_amount),
            payment_method=order.payment_method,
            payment_status=order.payment_status,
            payment_reference=order.payment_reference,
            status=order.status,
            notes=order.notes,
            items=[
                OrderItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    product_title=item.product_title,
                    product_sku=item.product_sku,
                    unit_price=float(item.unit_price),
                    quantity=item.quantity,
                    total_price=float(item.total_price),
                    image_url=item.image_url,
                )
                for item in order.items
            ],
            created_at=order.created_at,
            updated_at=order.updated_at,
        )

    async def create_storefront_order(self, payload: OrderCreatePublic) -> OrderResponse:
        """Create order from storefront checkout, deduct inventory, and record stock transactions."""
        order_number = f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        subtotal = 0.0
        order_items_to_create: list[OrderItem] = []

        # Validate items and inventory
        for item_in in payload.items:
            stmt = (
                select(Product)
                .options(selectinload(Product.images))
                .where(Product.id == item_in.product_id)
            )
            res = await self.db.execute(stmt)
            product = res.scalars().first()

            if not product:
                raise NotFoundException(f"Jewellery piece '{item_in.product_id}' not found")

            if product.status != ProductStatus.PUBLISHED or not product.is_active:
                raise BadRequestException(f"Product '{product.title}' is not available for purchase")

            if (product.stock_quantity or 0) < item_in.quantity:
                raise BadRequestException(
                    f"Insufficient stock for '{product.title}'. "
                    f"Requested {item_in.quantity}, only {product.stock_quantity or 0} in stock."
                )

            unit_price = float(product.price or 0.0)
            item_total = unit_price * item_in.quantity
            subtotal += item_total

            primary_img = next((img.storage_path for img in product.images if img.is_primary), None)
            if not primary_img and product.images:
                primary_img = product.images[0].storage_path

            order_item = OrderItem(
                product_id=product.id,
                product_title=product.title,
                product_sku=product.sku,
                unit_price=unit_price,
                quantity=item_in.quantity,
                total_price=item_total,
                image_url=primary_img,
            )
            order_items_to_create.append(order_item)

            # Deduct stock and record stock_out transaction
            prev_stock = int(product.stock_quantity or 0)
            new_stock = prev_stock - item_in.quantity
            product.stock_quantity = new_stock

            stock_tx = StockTransaction(
                product_id=product.id,
                transaction_type="stock_out",
                quantity=item_in.quantity,
                previous_stock=prev_stock,
                new_stock=new_stock,
                reference_id=order_number,
                reason=f"Customer Order {order_number}",
                notes=f"Customer: {payload.customer_name} ({payload.customer_email})",
            )
            self.db.add(stock_tx)

        # Payment simulation and channel resolution
        payment_reference = f"TXN-PJ-{uuid.uuid4().hex[:10].upper()}"

        method_lower = (payload.payment_method or "simulated_card").lower().strip()
        if method_lower in ["cod", "cash_on_delivery"]:
            payment_status = PaymentStatus.PENDING.value
            order_status = OrderStatus.CONFIRMED.value
        elif method_lower in ["wire", "wire_transfer", "bank_transfer"]:
            payment_status = PaymentStatus.PENDING.value
            order_status = OrderStatus.PENDING.value
        else:
            payment_status = PaymentStatus.PAID.value
            order_status = OrderStatus.CONFIRMED.value

        order = Order(
            order_number=order_number,
            customer_name=payload.customer_name.strip(),
            customer_email=payload.customer_email.strip().lower(),
            customer_phone=payload.customer_phone.strip() if payload.customer_phone else None,
            shipping_address=payload.shipping_address.strip(),
            subtotal=subtotal,
            discount_amount=0.0,
            total_amount=subtotal,
            payment_method=payload.payment_method,
            payment_status=payment_status,
            payment_reference=payment_reference,
            status=order_status,
            notes=payload.notes.strip() if payload.notes else None,
            items=order_items_to_create,
        )

        self.db.add(order)
        await self.db.flush()
        await self.db.refresh(order)

        # Load relationships
        full_stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order.id)
        )
        full_res = await self.db.execute(full_stmt)
        full_order = full_res.scalars().first()

        return self._serialize_order(full_order or order)

    async def list_orders(
        self,
        page: int = 1,
        limit: int = 20,
        status: str | None = None,
        search: str | None = None,
    ) -> OrderListResponse:
        """List orders for administrators with pagination and filters."""
        query = select(Order).options(selectinload(Order.items))
        count_stmt = select(func.count(Order.id))

        conditions = []
        if status and status.strip():
            conditions.append(Order.status == status.strip())

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(Order.order_number).like(term),
                    func.lower(Order.customer_name).like(term),
                    func.lower(Order.customer_email).like(term),
                )
            )

        if conditions:
            query = query.where(*conditions)
            count_stmt = count_stmt.where(*conditions)

        total_res = await self.db.execute(count_stmt)
        total = int(total_res.scalar_one_or_none() or 0)

        query = query.order_by(Order.created_at.desc())
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        res = await self.db.execute(query)
        items = list(res.scalars().all())

        pages = math.ceil(total / limit) if total > 0 else 1

        return OrderListResponse(
            items=[self._serialize_order(o) for o in items],
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )

    async def get_order_by_id(self, order_id: uuid.UUID) -> OrderResponse:
        """Retrieve single order details."""
        stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        res = await self.db.execute(stmt)
        order = res.scalars().first()
        if not order:
            raise NotFoundException(f"Order with ID '{order_id}' not found")
        return self._serialize_order(order)
