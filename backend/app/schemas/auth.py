import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    """Admin login request schema."""

    email: EmailStr = Field(description="Administrator email address")
    password: str = Field(min_length=8, description="Account password")


class TokenResponse(BaseModel):
    """Authentication token response schema."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token lifespan in seconds")
    refresh_token: str | None = None


class RefreshTokenRequest(BaseModel):
    """Token refresh request schema."""

    refresh_token: str


class TokenPayload(BaseModel):
    """Decoded JWT payload structure."""

    sub: str
    type: str
    iat: int
    exp: int
    jti: str | None = None
    role: str | None = None


class UserResponse(BaseModel):
    """Administrator user profile response."""

    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
