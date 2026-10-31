"""Database model registry.

Importing all models here ensures they are registered with Base.metadata
for Alembic autogenerate discovery and database introspection.
"""

from app.db.base import Base, TimestampMixin
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.user import User
from app.modules.orders.models import Order, OrderItem
from app.modules.stock.models import StockTransaction

__all__ = [
    "Base",
    "Category",
    "Order",
    "OrderItem",
    "Product",
    "ProductImage",
    "StockTransaction",
    "TimestampMixin",
    "User",
]

