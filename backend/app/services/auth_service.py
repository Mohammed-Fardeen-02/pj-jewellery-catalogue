import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse

logger = logging.getLogger("app.services.auth")


class AuthService:
    """Service handling administrator authentication, token issuance, and validation."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.user_repo = UserRepository(session)
        self.settings = get_settings()

    async def authenticate_user(self, email: str, password: str) -> User:
        """Authenticate user by email and password using Argon2."""
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            logger.warning("Failed login attempt for email: %s", email)
            raise UnauthorizedException(message="Incorrect email or password")

        if not user.is_active:
            logger.warning("Login rejected for inactive user: %s", email)
            raise UnauthorizedException(message="User account is deactivated")

        logger.info("Successful authentication for user: %s (id: %s)", email, user.id)
        return user

    def create_token_pair(self, user: User) -> TokenResponse:
        """Generate access and refresh tokens for an authenticated user."""
        access_token = create_access_token(subject=str(user.id), role=user.role)
        refresh_token = create_refresh_token(subject=str(user.id))
        expires_in = self.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in,
        )

    async def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """Issue a new access token using a valid refresh token."""
        payload = decode_token(refresh_token, expected_type="refresh")
        user_id_str = payload.get("sub")

        if not user_id_str:
            raise UnauthorizedException(message="Invalid token payload")

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError as err:
            raise UnauthorizedException(message="Malformed user ID in token") from err

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException(message="User associated with token no longer exists")

        if not user.is_active:
            raise UnauthorizedException(message="User account is deactivated")

        access_token = create_access_token(subject=str(user.id), role=user.role)
        expires_in = self.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in,
        )
