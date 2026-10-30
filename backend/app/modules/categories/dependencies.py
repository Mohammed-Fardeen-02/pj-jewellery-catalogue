from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db
from app.modules.categories.service import CategoryService


async def get_category_service(
    db: AsyncSession = Depends(get_db),
) -> CategoryService:
    """Dependency provider injecting CategoryService."""
    return CategoryService(db)
