import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    """Repository for User entity operations."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Fetch user by primary key ID."""
        query = select(User).where(User.id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        """Fetch user by unique email address."""
        query = select(User).where(func.lower(User.email) == email.lower().strip())
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        """Add new user to persistence session."""
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def count(self) -> int:
        """Count total registered users."""
        query = select(func.count(User.id))
        result = await self.session.execute(query)
        return result.scalar_one() or 0
