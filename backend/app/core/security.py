import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedException

# Password hasher using pwdlib with Argon2 (RFC 9106 profile: 19 MiB memory cost)
password_hash = PasswordHash((Argon2Hasher(memory_cost=19456, time_cost=2),))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against an Argon2 hash."""
    try:
        return password_hash.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a plain-text password using Argon2."""
    return password_hash.hash(password)


def create_token(
    subject: str | Any,
    token_type: str,
    expires_delta: timedelta,
    additional_claims: dict[str, Any] | None = None,
) -> str:
    """Create a signed JWT token with explicit claims: sub, type, iat, exp, jti."""
    settings = get_settings()
    now = datetime.now(UTC)
    expire = now + expires_delta

    payload: dict[str, Any] = {
        "sub": str(subject),
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
    }

    if additional_claims:
        payload.update(additional_claims)

    encoded_jwt = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def create_access_token(subject: str | Any, role: str | None = None) -> str:
    """Generate a short-lived access token."""
    settings = get_settings()
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    claims = {"role": role} if role else None
    return create_token(
        subject=subject,
        token_type="access",
        expires_delta=expires_delta,
        additional_claims=claims,
    )


def create_refresh_token(subject: str | Any) -> str:
    """Generate a long-lived refresh token."""
    settings = get_settings()
    expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=expires_delta,
    )


def decode_token(token: str, expected_type: str | None = None) -> dict[str, Any]:
    """Decode and validate a JWT token. Checks signature, expiry, and token type."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["sub", "type", "iat", "exp"]},
        )
    except jwt.ExpiredSignatureError as err:
        raise UnauthorizedException(message="Token has expired") from err
    except jwt.InvalidTokenError as err:
        raise UnauthorizedException(message="Invalid token signature or payload") from err

    if expected_type and payload.get("type") != expected_type:
        raise UnauthorizedException(
            message=f"Invalid token type: expected '{expected_type}', got '{payload.get('type')}'"
        )

    return payload
