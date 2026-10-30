import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

logger = logging.getLogger("app.api.auth")
router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Administrator Login",
    description=(
        "Authenticates administrator credentials (email/password) using Argon2 "
        "and issues JWT access and refresh tokens."
    ),
)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate administrator and return access & refresh tokens."""
    auth_service = AuthService(db)
    user = await auth_service.authenticate_user(payload.email, payload.password)
    return auth_service.create_token_pair(user)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh Access Token",
    description=(
        "Exchanges a valid refresh token for a fresh access token without re-authenticating."
    ),
)
async def refresh_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Validate refresh token and issue a new access token."""
    auth_service = AuthService(db)
    return await auth_service.refresh_access_token(payload.refresh_token)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Current Authenticated User",
    description="Returns the profile of the currently authenticated administrator.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> User:
    """Return profile data of the currently authenticated administrator."""
    return current_user
