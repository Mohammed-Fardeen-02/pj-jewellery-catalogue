import uuid
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.analytics.schemas import (
    CatalogueOverviewMetrics,
    CommerceMetrics,
    DailyStat,
    DashboardAnalyticsResponse,
    InventoryMetrics,
)
from app.modules.categories.models import Category
from app.modules.orders.models import Order
from app.modules.orders.schemas import OrderItemResponse, OrderResponse
from app.modules.products.models import Product, ProductStatus
from app.modules.stock.models import StockTransaction
from app.modules.stock.schemas import ProductStockStatusSummary, StockTransactionResponse


class AnalyticsService:
    """Calculates live analytics across catalogue, inventory, orders, and revenue with date filtering."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _resolve_date_range(
        self,
        range_str: str = "30d",
        start_date_param: date | None = None,
        end_date_param: date | None = None,
    ) -> tuple[datetime, datetime, str]:
        """Convert friendly range string or explicit dates into start/end UTC datetimes."""
        now = datetime.now(timezone.utc)

        if start_date_param and end_date_param:
            start_dt = datetime.combine(start_date_param, time.min, tzinfo=timezone.utc)
            end_dt = datetime.combine(end_date_param, time.max, tzinfo=timezone.utc)
            return start_dt, end_dt, "custom"

        range_key = (range_str or "30d").lower().strip()
        if range_key == "today":
            start_dt = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
            end_dt = now
        elif range_key == "7d":
            start_dt = now - timedelta(days=7)
            end_dt = now
        elif range_key == "ytd":
            start_dt = datetime(now.year, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
            end_dt = now
        elif range_key == "all":
            start_dt = datetime(2020, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
            end_dt = now
        else:  # default 30d
            range_key = "30d"
            start_dt = now - timedelta(days=30)
            end_dt = now

        return start_dt, end_dt, range_key

    async def get_dashboard_analytics(
        self,
        date_range: str = "30d",
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> DashboardAnalyticsResponse:
        """Fetch unified metrics covering products, categories, stock levels, orders, and revenue."""
        start_dt, end_dt, resolved_range = self._resolve_date_range(date_range, start_date, end_date)

        # -------------------------------------------------------------
        # 1. Product & Category Master Metrics
        # -------------------------------------------------------------
        prod_stmt = select(Product).options(selectinload(Product.images))
        prod_res = await self.db.execute(prod_stmt)
        products = list(prod_res.scalars().all())

        cat_stmt = select(Category)
        cat_res = await self.db.execute(cat_stmt)
        categories = list(cat_res.scalars().all())

        total_prods = len(products)
        published_prods = sum(1 for p in products if p.status == ProductStatus.PUBLISHED and p.is_published)
        draft_prods = sum(1 for p in products if p.status == ProductStatus.DRAFT)
        archived_prods = sum(1 for p in products if p.status == ProductStatus.ARCHIVED)
        active_prods = sum(1 for p in products if p.is_active)
        inactive_prods = total_prods - active_prods

        total_cats = len(categories)
        active_cats = sum(1 for c in categories if c.is_active)

        catalogue_metrics = CatalogueOverviewMetrics(
            total_products=total_prods,
            published_products=published_prods,
            draft_products=draft_prods,
            archived_products=archived_prods,
            active_products=active_prods,
            inactive_products=inactive_prods,
            total_categories=total_cats,
            active_categories=active_cats,
        )

        # -------------------------------------------------------------
        # 2. Inventory Metrics & Alerts
        # -------------------------------------------------------------
        total_stock = sum(int(p.stock_quantity or 0) for p in products)
        out_of_stock = [p for p in products if (p.stock_quantity or 0) <= 0]
        low_stock = [
            p
            for p in products
            if 0 < (p.stock_quantity or 0) <= (p.low_stock_threshold or 5)
        ]

        inventory_metrics = InventoryMetrics(
            total_stock_units=total_stock,
            low_stock_count=len(low_stock),
            out_of_stock_count=len(out_of_stock),
        )

        low_stock_alerts: list[ProductStockStatusSummary] = []
        for p in out_of_stock + low_stock:
            primary_img = next((img.storage_path for img in p.images if img.is_primary), None)
            if not primary_img and p.images:
                primary_img = p.images[0].storage_path

            status_str = "out_of_stock" if (p.stock_quantity or 0) <= 0 else "low_stock"
            low_stock_alerts.append(
                ProductStockStatusSummary(
                    product_id=p.id,
                    title=p.title,
                    sku=p.sku,
                    stock_quantity=int(p.stock_quantity or 0),
                    low_stock_threshold=int(p.low_stock_threshold or 5),
                    status=status_str,
                    primary_image_url=primary_img,
                )
            )

        # -------------------------------------------------------------
        # 3. Orders & Commerce in Date Range
        # -------------------------------------------------------------
        order_stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.created_at >= start_dt, Order.created_at <= end_dt)
            .order_by(Order.created_at.desc())
        )
        order_res = await self.db.execute(order_stmt)
        range_orders = list(order_res.scalars().all())

        total_orders = len(range_orders)
        total_revenue = sum(
            float(o.total_amount) for o in range_orders if o.payment_status == "paid"
        )
        avg_order_value = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

        commerce_metrics = CommerceMetrics(
            date_range=resolved_range,
            start_date=start_dt.isoformat(),
            end_date=end_dt.isoformat(),
            total_orders=total_orders,
            total_revenue=round(total_revenue, 2),
            average_order_value=avg_order_value,
        )

        # Daily Trends
        daily_buckets: dict[str, dict[str, float]] = {}
        # Prepopulate days for up to 30 days
        day_diff = min((end_dt.date() - start_dt.date()).days, 60)
        for i in range(day_diff + 1):
            day_str = (start_dt.date() + timedelta(days=i)).strftime("%Y-%m-%d")
            daily_buckets[day_str] = {"orders": 0.0, "revenue": 0.0}

        for o in range_orders:
            d_key = o.created_at.strftime("%Y-%m-%d")
            if d_key in daily_buckets:
                daily_buckets[d_key]["orders"] += 1
                if o.payment_status == "paid":
                    daily_buckets[d_key]["revenue"] += float(o.total_amount)

        daily_trends = [
            DailyStat(
                date=k,
                orders_count=int(v["orders"]),
                revenue=round(v["revenue"], 2),
            )
            for k, v in sorted(daily_buckets.items())
        ]

        # -------------------------------------------------------------
        # 4. Recent Activity (Recent Orders & Stock Transactions)
        # -------------------------------------------------------------
        recent_order_stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .order_by(Order.created_at.desc())
            .limit(5)
        )
        rec_ord_res = await self.db.execute(recent_order_stmt)
        latest_orders = list(rec_ord_res.scalars().all())

        recent_orders_resp = [
            OrderResponse(
                id=o.id,
                order_number=o.order_number,
                customer_name=o.customer_name,
                customer_email=o.customer_email,
                customer_phone=o.customer_phone,
                shipping_address=o.shipping_address,
                subtotal=float(o.subtotal),
                discount_amount=float(o.discount_amount),
                total_amount=float(o.total_amount),
                payment_method=o.payment_method,
                payment_status=o.payment_status,
                payment_reference=o.payment_reference,
                status=o.status,
                notes=o.notes,
                items=[
                    OrderItemResponse(
                        id=it.id,
                        product_id=it.product_id,
                        product_title=it.product_title,
                        product_sku=it.product_sku,
                        unit_price=float(it.unit_price),
                        quantity=it.quantity,
                        total_price=float(it.total_price),
                        image_url=it.image_url,
                    )
                    for it in o.items
                ],
                created_at=o.created_at,
                updated_at=o.updated_at,
            )
            for o in latest_orders
        ]

        # Recent Stock Transactions
        tx_stmt = (
            select(StockTransaction, Product)
            .join(Product, StockTransaction.product_id == Product.id)
            .order_by(StockTransaction.created_at.desc())
            .limit(5)
        )
        tx_res = await self.db.execute(tx_stmt)
        latest_txs = list(tx_res.all())

        recent_txs_resp = [
            StockTransactionResponse(
                id=tx.id,
                product_id=tx.product_id,
                product_title=prod.title,
                product_sku=prod.sku,
                transaction_type=tx.transaction_type,
                quantity=tx.quantity,
                previous_stock=tx.previous_stock,
                new_stock=tx.new_stock,
                reference_id=tx.reference_id,
                reason=tx.reason,
                notes=tx.notes,
                created_at=tx.created_at,
            )
            for tx, prod in latest_txs
        ]

        return DashboardAnalyticsResponse(
            catalogue=catalogue_metrics,
            inventory=inventory_metrics,
            commerce=commerce_metrics,
            daily_trends=daily_trends,
            recent_orders=recent_orders_resp,
            recent_stock_transactions=recent_txs_resp,
            low_stock_alerts=low_stock_alerts[:10],
        )
