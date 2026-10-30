import uuid
from collections.abc import Callable

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.dependencies.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

# HTTPBearer scheme for extracting bearer token from Authorization header
http_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve and validate the currently authenticated user from Bearer JWT.

    Does not trust token claims blindly: verifies token signature and loads
    the user entity from the database to confirm active status.
    """
    if not credentials:
        raise UnauthorizedException(message="Authentication credentials required")

    payload = decode_token(credentials.credentials, expected_type="access")
    user_id_str = payload.get("sub")

    if not user_id_str:
        raise UnauthorizedException(message="Invalid token claims: missing subject")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError as err:
        raise UnauthorizedException(message="Invalid subject ID in token") from err

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)

    if not user:
        raise UnauthorizedException(message="User not found")

    if not user.is_active:
        raise ForbiddenException(message="User account is deactivated")

    return user


async def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency verifying that the active user possesses the administrator role."""
    if current_user.role not in ("admin", "super_admin"):
        raise ForbiddenException(message="Administrator privileges required")
    return current_user


def require_role(*roles: str) -> Callable:
    """Factory dependency for role-based endpoint access control."""

    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise ForbiddenException(
                message=f"Access denied: Requires one of roles: {', '.join(roles)}"
            )
        return user

    return role_checker
