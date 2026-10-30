from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db
from app.modules.products.service import ProductService


async def get_product_service(
    db: AsyncSession = Depends(get_db),
) -> ProductService:
    """Dependency provider injecting ProductService."""
    return ProductService(db)
