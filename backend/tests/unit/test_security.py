import uuid
from datetime import timedelta

import pytest

from app.core.exceptions import UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_token,
    decode_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing_and_verification():
    raw_password = "SuperSecurePassword987!"
    hashed = get_password_hash(raw_password)

    assert hashed != raw_password
    assert hashed.startswith("$argon2")
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_access_token_creation_and_decoding():
    user_id = uuid.uuid4()
    token = create_access_token(subject=user_id, role="admin")

    payload = decode_token(token, expected_type="access")
    assert payload["sub"] == str(user_id)
    assert payload["type"] == "access"
    assert payload["role"] == "admin"
    assert "iat" in payload
    assert "exp" in payload
    assert "jti" in payload


def test_refresh_token_type_separation():
    user_id = uuid.uuid4()
    refresh_tok = create_refresh_token(subject=user_id)

    # Valid when decoding as refresh
    payload = decode_token(refresh_tok, expected_type="refresh")
    assert payload["sub"] == str(user_id)
    assert payload["type"] == "refresh"

    # Must fail when attempted to decode as access token
    with pytest.raises(UnauthorizedException) as exc_info:
        decode_token(refresh_tok, expected_type="access")
    assert "Invalid token type" in exc_info.value.message


def test_expired_token_handling():
    user_id = uuid.uuid4()
    # Create token already expired in the past
    expired_token = create_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(seconds=-10),
    )

    with pytest.raises(UnauthorizedException) as exc_info:
        decode_token(expired_token)
    assert "Token has expired" in exc_info.value.message


def test_tampered_token_handling():
    tampered_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.invalidsignature"
    with pytest.raises(UnauthorizedException) as exc_info:
        decode_token(tampered_token)
    assert "Invalid token" in exc_info.value.message
